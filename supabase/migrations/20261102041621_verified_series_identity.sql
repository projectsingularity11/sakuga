-- Additive series identity: per-season anime IDs and all library foreign keys remain intact.
alter table public.anime add column series_id bigint references public.anime(id), add column series_count integer not null default 1;
create index anime_series_idx on public.anime(series_id) where series_id is not null;
create table public.anime_relations (
 anime_id bigint not null references public.anime(id) on delete cascade,
 related_id bigint not null,
 relation_type text not null check(relation_type in ('PREQUEL','SEQUEL')),
 refreshed_at timestamptz not null default now(),
 primary key(anime_id,related_id,relation_type),check(anime_id<>related_id)
);
alter table public.anime_relations enable row level security;
create policy "Published relations" on public.anime_relations for select using(exists(select 1 from public.anime a where a.id=anime_id and a.moderation='published') and exists(select 1 from public.anime a where a.id=related_id and a.moderation='published'));
grant select on public.anime_relations to anon,authenticated;
grant all on public.anime_relations to service_role;
create or replace function public.rebuild_anime_series() returns integer language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 perform pg_advisory_xact_lock(6843902);
 with recursive edges as (
  select r.anime_id a,r.related_id b from public.anime_relations r
  join public.anime x on x.id=r.anime_id join public.anime y on y.id=r.related_id
  where x.moderation='published' and y.moderation='published'
  and (case when x.format in ('TV','TV_SHORT','ONA') then 'TV' else x.format end)=(case when y.format in ('TV','TV_SHORT','ONA') then 'TV' else y.format end)
 ), links as(select a,b from edges union select b,a from edges), walk(origin,node) as (
 select a,a from links union select w.origin,l.b from walk w join links l on l.a=w.node
 ), roots as (
 select distinct on(w.origin) w.origin,a.id root from walk w join public.anime a on a.id=w.node order by w.origin,a.year asc nulls last,a.id
 ), counts as(select root,count(*)::integer n from roots group by root), membership as(select r.origin,r.root,c.n from roots r join counts c on c.root=r.root)
 update public.anime a set series_id=m.root,series_count=m.n from membership m where a.id=m.origin and (a.series_id is distinct from m.root or a.series_count<>m.n);
 get diagnostics changed=row_count;
 -- Clear only stale derived membership. No source records or user data are removed.
 update public.anime a set series_id=null,series_count=1 where series_id is not null and not exists(select 1 from public.anime_relations r join public.anime x on x.id=r.anime_id join public.anime y on y.id=r.related_id where (r.anime_id=a.id or r.related_id=a.id) and x.moderation='published' and y.moderation='published' and (case when x.format in ('TV','TV_SHORT','ONA') then 'TV' else x.format end)=(case when y.format in ('TV','TV_SHORT','ONA') then 'TV' else y.format end));
 return changed;
end $$;
revoke all on function public.rebuild_anime_series() from public,anon,authenticated;
grant execute on function public.rebuild_anime_series() to service_role;
create or replace function public.search_anime(query text default '',filters jsonb default '{}',page_number int default 1) returns jsonb language sql stable security invoker set search_path='' as $$
with input as (select public.normalize_anime_search(left(query,100)) q), candidates as (
 select a.*,case when i.q='' then 0 when exists(select 1 from unnest(array[a.title_english,a.title,a.title_romaji,a.title_native]||a.synonyms) t where public.normalize_anime_search(t)=i.q) then 0
 when exists(select 1 from unnest(array[a.title_english,a.title,a.title_romaji,a.title_native]||a.synonyms) t where starts_with(public.normalize_anime_search(t),i.q)) then 1
 when a.search_normalized like '%'||i.q||'%' then 2 else 3 end relevance
 from public.anime a cross join input i where a.moderation='published'
 and (i.q='' or a.search_normalized like '%'||i.q||'%' or (length(i.q)>=5 and a.search_normalized operator(extensions.%>) i.q))
 and (coalesce(filters->>'genre','')='' or a.genres @> array[filters->>'genre'])
 and (coalesce(filters->>'format','')='' or a.format=filters->>'format')
 and (coalesce(filters->>'year','')='' or a.year::text=filters->>'year')
 and (coalesce(filters->>'season','')='' or a.season=filters->>'season')
 and (coalesce(filters->>'airing','')='' or a.airing_status=filters->>'airing')
 and (coalesce(filters->>'studio','')='' or a.studios @> array[filters->>'studio'])
 and (coalesce(filters->>'short','')<>'true' or a.episodes<=13)
 and (coalesce(filters->>'source','')='' or exists(select 1 from public.ratings r where r.anime_id=a.id and r.provider=filters->>'source' and r.score/r.scale*10>=case when coalesce(filters->>'rating','') ~ '^([0-9]|10)(\.[0-9]+)?$' then (filters->>'rating')::numeric else 0 end))
), ranked as (select candidates.*,row_number() over(partition by coalesce(series_id,id) order by relevance,
 case when filters->>'sort'='newest' then year end desc nulls last,popularity desc nulls last,id) group_rank from candidates), grouped as(select * from ranked where group_rank=1), selected as (select * from grouped order by relevance,
 case when filters->>'sort'='newest' then year end desc nulls last,
 case when filters->>'sort'='rating' then (select max(r.score/r.scale) from public.ratings r where r.anime_id=grouped.id) end desc nulls last,
 popularity desc nulls last,id limit 24 offset ((greatest(1,least(coalesce(page_number,1),10000))-1)*24))
select jsonb_build_object('count',(select count(*) from grouped),'titles',coalesce((select jsonb_agg((select to_jsonb(root)-'search_text'-'search_normalized' from public.anime root where root.id=coalesce(s.series_id,s.id) and root.moderation='published')||jsonb_build_object('matched_id',s.id,'ratings',coalesce((select jsonb_agg(r) from public.ratings r where r.anime_id=coalesce(s.series_id,s.id)),'[]'::jsonb),'source_mappings',coalesce((select jsonb_agg(m) from public.source_mappings m where m.anime_id=coalesce(s.series_id,s.id)),'[]'::jsonb))) from selected s),'[]'::jsonb)) $$;


analyze public.anime;
