alter table public.anime add column title_english_source_url text;
create or replace function public.apply_imdb_crossreferences(payload jsonb) returns int language plpgsql security invoker set search_path='' as $$
declare changed int;begin
 if jsonb_typeof(payload)<>'array' or jsonb_array_length(payload)>50000 then raise exception 'Invalid mapping batch';end if;
 update public.anime a set imdb_id=coalesce(a.imdb_id,m.imdb),imdb_source_url=coalesce(a.imdb_source_url,m.entity),title_english=coalesce(nullif(trim(a.title_english),''),nullif(trim(m.english),'')),title_english_source_url=case when nullif(trim(a.title_english),'') is null and nullif(trim(m.english),'') is not null then m.entity else a.title_english_source_url end
 from jsonb_to_recordset(payload) m(provider text,external_id text,mal text,imdb text,entity text,english text),public.source_mappings s
 where s.provider=coalesce(m.provider,'mal') and s.provider in ('mal','anilist') and s.verified and s.external_id=coalesce(m.external_id,m.mal) and s.anime_id=a.id and (a.imdb_id is null or nullif(trim(a.title_english),'') is null) and m.imdb ~ '^tt[0-9]{5,12}$' and m.entity ~ '^https://www.wikidata.org/entity/Q[0-9]+$';
 get diagnostics changed=row_count;return changed;
end $$;
