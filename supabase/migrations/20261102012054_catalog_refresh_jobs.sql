create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create function public.claim_catalog_refresh() returns boolean language plpgsql security definer set search_path='' as $$
begin
 insert into public.ingestion_jobs(provider,page,status) values('catalog-enrichment',0,'pending') on conflict do nothing;
 update public.ingestion_jobs set status='syncing',updated_at=now() where provider='catalog-enrichment' and (status<>'syncing' or updated_at<now()-interval '3 minutes');
 return found;
end $$;
create function public.release_catalog_refresh() returns void language sql security definer set search_path='' as $$ update public.ingestion_jobs set status='running' where provider='catalog-enrichment' and status='syncing' $$;
revoke all on function public.claim_catalog_refresh() from public,anon,authenticated;
revoke all on function public.release_catalog_refresh() from public,anon,authenticated;
grant execute on function public.claim_catalog_refresh() to service_role;
grant execute on function public.release_catalog_refresh() to service_role;
