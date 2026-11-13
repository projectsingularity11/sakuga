-- Keep only grouping/sorting keys in the window and materialized CTE.
-- Hydrate full public records after LIMIT, avoiding wide synopsis/search-text spills.
create or replace function public.search_anime(query text default '',filters jsonb default '{}',page_number int default 1) returns jsonb language plpgsql stable security definer set search_path='' set plan_cache_mode='force_custom_plan' as $$ begin return (
with input as (select public.normalize_anime_search(left(query,100)) q), candidates as (
 select a.id,a.year,a.popularity,coalesce(a.series_id,a.id) as show_id,case when i.q='' then 0 when exists(select 1 from unnest(array[a.title_english,a.title,a.title_romaji,a.title_native]||a.synonyms) t where public.normalize_anime_search(t)=i.q) then 0
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
), ranked as (select candidates.*,row_number() over(partition by show_id order by relevance,
 case when filters->>'sort'='newest' then year end desc nulls last,popularity desc nulls last,id) group_rank from candidates), grouped as(select * from ranked where group_rank=1), selected as (select * from grouped order by relevance,
 case when filters->>'sort'='newest' then year end desc nulls last,
 case when filters->>'sort'='rating' then (select max(r.score/r.scale) from public.ratings r where r.anime_id=grouped.id) end desc nulls last,
 popularity desc nulls last,id limit 24 offset ((greatest(1,least(coalesce(page_number,1),10000))-1)*24))
select jsonb_build_object('count',(select count(*) from grouped),'titles',coalesce((select jsonb_agg((select to_jsonb(root)-'search_text'-'search_normalized' from public.anime root where root.id=s.show_id and root.moderation='published')||jsonb_build_object('matched_id',s.id,'ratings',coalesce((select jsonb_agg(r) from public.ratings r where r.anime_id=s.show_id),'[]'::jsonb),'source_mappings',coalesce((select jsonb_agg(m) from public.source_mappings m where m.anime_id=s.show_id and m.verified),'[]'::jsonb))) from selected s),'[]'::jsonb))); end $$;
