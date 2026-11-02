alter table public.anime set (autovacuum_analyze_scale_factor=0.02,autovacuum_analyze_threshold=50);
analyze public.anime;
