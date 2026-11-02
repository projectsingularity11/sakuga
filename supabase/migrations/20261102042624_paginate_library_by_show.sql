-- Group private library pages before pagination; preserve each member's own progress.
create or replace function public.library_show_page(filters jsonb default '{}',page_number integer default 1) returns jsonb language sql stable security invoker set search_path='' as $$
with filtered as (
 select l.*,coalesce(a.series_id,a.id) group_id from public.library l join public.anime a on a.id=l.anime_id
 where a.moderation='published'
 and (coalesce(filters->>'status','')='' or l.status::text=filters->>'status')
 and (coalesce(filters->>'favorite','')<>'true' or l.favorite)
 and (coalesce(filters->>'q','')='' or a.search_normalized like '%'||public.normalize_anime_search(left(filters->>'q',100))||'%' or exists(select 1 from public.anime root where root.id=a.series_id and root.search_normalized like '%'||public.normalize_anime_search(left(filters->>'q',100))||'%'))
), groups as(select group_id,max(updated_at) updated_at,max(score) score from filtered group by group_id), pages as (
 select * from groups order by case when filters->>'sort'='score' then score end desc nulls last,updated_at desc,group_id limit 100 offset ((greatest(1,least(coalesce(page_number,1),10000))-1)*100)
), entries as(
 select f.*,row_number() over(order by case when filters->>'sort'='score' then p.score end desc nulls last,p.updated_at desc,p.group_id,f.updated_at desc,f.anime_id) position from filtered f join pages p on p.group_id=f.group_id
)
select jsonb_build_object('count',(select count(*) from groups),'entries',coalesce((select jsonb_agg(to_jsonb(e)-'group_id'-'position'||jsonb_build_object('anime',(select to_jsonb(a)-'search_text'-'search_normalized'||jsonb_build_object('ratings',coalesce((select jsonb_agg(r) from public.ratings r where r.anime_id=a.id),'[]'::jsonb),'source_mappings',coalesce((select jsonb_agg(m) from public.source_mappings m where m.anime_id=a.id),'[]'::jsonb)) from public.anime a where a.id=e.anime_id)) order by e.position) from entries e),'[]'::jsonb)) $$;
revoke all on function public.library_show_page(jsonb,integer) from public,anon;
grant execute on function public.library_show_page(jsonb,integer) to authenticated;
