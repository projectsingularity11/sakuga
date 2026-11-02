-- Derive and clear membership in one scan, avoiding a correlated relation scan for every season.
create index anime_relations_related_idx on public.anime_relations(related_id);
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
 update public.anime a set series_id=d.root,series_count=coalesce(d.n,1)
 from(select known.id,m.root,m.n from public.anime known left join membership m on m.origin=known.id) d
 where a.id=d.id and (a.series_id is distinct from d.root or a.series_count<>coalesce(d.n,1));
 get diagnostics changed=row_count;
 return changed;
end $$;
