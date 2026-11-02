alter table public.anime add column imdb_source_url text;
create function public.apply_imdb_crossreferences(payload jsonb) returns int language plpgsql security invoker set search_path='' as $$
declare changed int;begin
 if jsonb_typeof(payload)<>'array' or jsonb_array_length(payload)>50000 then raise exception 'Invalid mapping batch';end if;
 update public.anime a set imdb_id=m.imdb,imdb_source_url=m.entity from jsonb_to_recordset(payload) m(mal text,imdb text,entity text),public.source_mappings s
 where s.provider='mal' and s.verified and s.external_id=m.mal and s.anime_id=a.id and a.imdb_id is null and m.imdb ~ '^tt[0-9]{5,12}$' and m.entity ~ '^https://www.wikidata.org/entity/Q[0-9]+$';
 get diagnostics changed=row_count;return changed;
end $$;
revoke all on function public.apply_imdb_crossreferences(jsonb) from public,anon,authenticated;
grant execute on function public.apply_imdb_crossreferences(jsonb) to service_role;
