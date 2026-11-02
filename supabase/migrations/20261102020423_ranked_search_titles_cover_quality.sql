alter table public.anime add column title_english text, add column cover_width int, add column cover_height int, add column cover_checked_at timestamptz;
update public.anime set title_english=title where title_romaji is not null and title<>title_romaji;
create function public.normalize_anime_search(value text) returns text language sql immutable set search_path='' as $$ select trim(regexp_replace(lower(normalize(coalesce(value,''),NFKC)), '[^[:alnum:]一-龯ぁ-んァ-ン]+',' ','g')) $$;
alter table public.anime add column search_normalized text generated always as (public.normalize_anime_search(coalesce(title_english,'')||' '||title||' '||coalesce(title_romaji,'')||' '||coalesce(title_native,'')||' '||public.search_aliases(synonyms))) stored;
create index anime_normalized_trgm on public.anime using gin(search_normalized extensions.gin_trgm_ops);
create function public.search_anime(query text default '',filters jsonb default '{}',page_number int default 1) returns jsonb language sql stable security invoker set search_path='' as $$
with input as (select public.normalize_anime_search(left(query,100)) q), candidates as (
 select a.*,case when i.q='' then 0 when exists(select 1 from unnest(array[a.title_english,a.title,a.title_romaji,a.title_native]||a.synonyms) t where public.normalize_anime_search(t)=i.q) then 0
 when exists(select 1 from unnest(array[a.title_english,a.title,a.title_romaji,a.title_native]||a.synonyms) t where starts_with(public.normalize_anime_search(t),i.q)) then 1
 when a.search_normalized like '%'||i.q||'%' then 2 else 3 end relevance
 from public.anime a cross join input i where a.moderation='published'
 and (i.q='' or a.search_normalized like '%'||i.q||'%' or (length(i.q)>=5 and extensions.word_similarity(i.q,a.search_normalized)>0.55))
 and (coalesce(filters->>'genre','')='' or a.genres @> array[filters->>'genre'])
 and (coalesce(filters->>'format','')='' or a.format=filters->>'format')
 and (coalesce(filters->>'year','')='' or a.year::text=filters->>'year')
 and (coalesce(filters->>'season','')='' or a.season=filters->>'season')
 and (coalesce(filters->>'airing','')='' or a.airing_status=filters->>'airing')
 and (coalesce(filters->>'studio','')='' or a.studios @> array[filters->>'studio'])
 and (coalesce(filters->>'short','')<>'true' or a.episodes<=13)
 and (coalesce(filters->>'source','')='' or exists(select 1 from public.ratings r where r.anime_id=a.id and r.provider=filters->>'source' and r.score/r.scale*10>=case when coalesce(filters->>'rating','') ~ '^([0-9]|10)(\.[0-9]+)?$' then (filters->>'rating')::numeric else 0 end))
), selected as (select * from candidates order by relevance,
 case when filters->>'sort'='newest' then year end desc nulls last,
 case when filters->>'sort'='rating' then (select max(r.score/r.scale) from public.ratings r where r.anime_id=candidates.id) end desc nulls last,
 popularity desc nulls last,id limit 24 offset ((greatest(1,least(coalesce(page_number,1),10000))-1)*24))
select jsonb_build_object('count',(select count(*) from candidates),'titles',coalesce((select jsonb_agg(to_jsonb(s)-'search_text'-'search_normalized'||jsonb_build_object('ratings',coalesce((select jsonb_agg(r) from public.ratings r where r.anime_id=s.id),'[]'::jsonb),'source_mappings',coalesce((select jsonb_agg(m) from public.source_mappings m where m.anime_id=s.id),'[]'::jsonb))) from selected s),'[]'::jsonb)) $$;
revoke all on function public.search_anime(text,jsonb,int) from public;
grant execute on function public.search_anime(text,jsonb,int) to anon,authenticated,service_role;
