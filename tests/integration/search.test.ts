import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
it('ranks aliases before popularity, preserves punctuation and denies restricted records',async()=>{
 const db=new PGlite({extensions:{pg_trgm}});
 try{await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;`);await db.exec(readFileSync('supabase/migrations/20261102011112_sakuga_core.sql','utf8'));await db.exec(`create schema extensions;alter extension pg_trgm set schema extensions;`);await db.exec(readFileSync('supabase/migrations/20261102020423_ranked_search_titles_cover_quality.sql','utf8'));await db.exec(`grant usage on schema public,extensions to anon;grant select on all tables in schema public to anon;insert into anime(id,title,synonyms,moderation,moderation_reason,popularity) values(1,'Shingeki no Kyojin',array['Attack on Titan','進撃の巨人'],'published','fixture',5),(2,'Attack on Titan sequel',array[]::text[],'published','fixture',1000),(3,'Attack on Titan hidden',array[]::text[],'quarantine','fixture',9999),(4,'Fate/stay night',array[]::text[],'published','fixture',1);set role anon;`);
 for(const q of ['attack on titan','  ATTACK ON TITAN  ','進撃の巨人']){const r=await db.query<{data:{titles:{id:number}[]}}>('select public.search_anime($1) data',[q]);expect(r.rows[0].data.titles[0].id).toBe(1);expect(r.rows[0].data.titles.some(t=>t.id===3)).toBe(false);}
 const r=await db.query<{data:{titles:{id:number}[]}}>('select public.search_anime($1) data',['fate/stay night']);expect(r.rows[0].data.titles[0].id).toBe(4);
 }finally{await db.close();}
},30000);
