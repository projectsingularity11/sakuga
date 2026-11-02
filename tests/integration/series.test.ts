import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
it("groups verified season chains before pagination, includes cross-format parts and isolates music, preserves user progress and finds a matched season", async () => {
  const db = new PGlite({ extensions: { pg_trgm } });
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;`,
    );
    for (const name of [
      "20261102011112_sakuga_core",
      "20261102020423_ranked_search_titles_cover_quality",
      "20261102023927_catalog_media_links",
      "20261102041621_verified_series_identity",
      "20261102042624_paginate_library_by_show",
      "20261102043211_optimize_series_rebuild",
      "20261102043330_include_cross_format_sequel_parts",
      "20261102043605_index_grouped_catalog_lookups",
      "20261102043957_plan_public_catalog_projection",
    ]) {
      if (name.startsWith("202611020204"))
        await db.exec(
          "create schema extensions;alter extension pg_trgm set schema extensions;",
        );
      await db.exec(readFileSync(`supabase/migrations/${name}.sql`, "utf8"));
    }
    await db.exec(
      `insert into auth.users values('00000000-0000-4000-8000-000000000001');insert into anime(id,title,format,year,episodes,moderation,moderation_reason,popularity) values(1,'Test Show','TV',2020,12,'published','fixture',10),(2,'Test Show Part Two','TV',2021,12,'published','fixture',500),(3,'Test Show Movie','MOVIE',2022,1,'published','fixture',100),(4,'Unrelated Show','TV',2023,12,'published','fixture',20),(5,'Hidden Show','TV',2024,12,'quarantine','fixture',200),(6,'Test Show Music','MUSIC',2024,1,'published','fixture',10);insert into library(user_id,anime_id,progress) values('00000000-0000-4000-8000-000000000001',1,3),('00000000-0000-4000-8000-000000000001',2,7);insert into anime_relations(anime_id,related_id,relation_type) values(1,2,'SEQUEL'),(2,1,'PREQUEL'),(2,3,'SEQUEL'),(2,5,'SEQUEL'),(2,6,'SEQUEL');select rebuild_anime_series();`,
    );
    expect(
      (
        await db.query(
          "select anime_id,progress from library order by anime_id",
        )
      ).rows,
    ).toEqual([
      { anime_id: 1, progress: 3 },
      { anime_id: 2, progress: 7 },
    ]);
    expect(
      (
        await db.query(
          "select id,series_id,series_count from anime order by id",
        )
      ).rows,
    ).toEqual([
      { id: 1, series_id: 1, series_count: 3 },
      { id: 2, series_id: 1, series_count: 3 },
      { id: 3, series_id: 1, series_count: 3 },
      { id: 4, series_id: null, series_count: 1 },
      { id: 5, series_id: null, series_count: 1 },
      { id: 6, series_id: null, series_count: 1 },
    ]);
    await db.exec(
      "insert into source_mappings(anime_id,provider,external_id,url,provenance,confidence,verified) values(1,'mal','1','https://myanimelist.net/anime/1','fixture',0.2,false);",
    );
    const library = await db.query<{
      data: {
        count: number;
        entries: { anime_id: number; progress: number }[];
      };
    }>("select library_show_page() data");
    expect(library.rows[0].data.count).toBe(1);
    expect(library.rows[0].data.entries).toHaveLength(2);
    expect(
      library.rows[0].data.entries.find((e) => e.anime_id === 2)?.progress,
    ).toBe(7);
    await db.exec(
      "grant usage on schema auth to authenticated;grant select on library,anime,ratings,source_mappings to authenticated;set role authenticated;set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';",
    );
    const mine = await db.query<{ data: { count: number } }>(
      "select library_show_page() data",
    );
    expect(mine.rows[0].data.count).toBe(1);
    await db.exec(
      "set request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';",
    );
    const other = await db.query<{
      data: { count: number; entries: unknown[] };
    }>("select library_show_page() data");
    expect(other.rows[0].data).toMatchObject({ count: 0, entries: [] });
    await db.exec("reset role;reset request.jwt.claim.sub;");
    await db.exec(
      "grant usage on schema public,extensions to anon;grant select on all tables in schema public to anon;set role anon;",
    );
    const all = await db.query<{
      data: { count: number; titles: { id: number; matched_id: number }[] };
    }>(`select search_anime('') data`);
    expect(all.rows[0].data.count).toBe(3);
    expect(all.rows[0].data.titles.filter((a) => a.id === 1)).toHaveLength(1);
    expect(
      (
        all.rows[0].data.titles.find((a) => a.id === 1) as unknown as {
          source_mappings: unknown[];
        }
      ).source_mappings,
    ).toEqual([]);
    const match = await db.query<{
      data: { count: number; titles: { id: number; matched_id: number }[] };
    }>(`select search_anime('Test Show Part Two') data`);
    expect(match.rows[0].data.titles[0]).toMatchObject({
      id: 1,
      matched_id: 2,
    });
    await expect(db.exec("select rebuild_anime_series()")).rejects.toThrow();
  } finally {
    await db.close();
  }
}, 30000);
