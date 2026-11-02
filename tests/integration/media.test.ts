import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { readFileSync } from "node:fs";
import { it, expect } from "vitest";
it("restricts external-ID enrichment to the service role and preserves existing English names", async () => {
  const db = new PGlite({ extensions: { pg_trgm } });
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;`,
    );
    for (const file of [
      "20261102011112_sakuga_core.sql",
      "20261102011712_harden_functions_and_extensions.sql",
      "20261102020423_ranked_search_titles_cover_quality.sql",
      "20261102023927_catalog_media_links.sql",
      "20261102025319_verified_imdb_crossreferences.sql",
      "20261102025947_verified_english_names_and_anilist_links.sql",
    ])
      await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
    await db.exec(
      `insert into public.anime(id,title,moderation,moderation_reason) values(1,'Fixture romaji','published','Test fixture');insert into public.source_mappings(anime_id,provider,external_id,url,provenance,confidence,verified) values(1,'mal','100','https://myanimelist.net/anime/100','Fixture',1,true);grant usage on schema public to service_role,anon;grant select,update on public.anime to service_role;grant select on public.source_mappings to service_role;set role anon;`,
    );
    const payload = JSON.stringify([
      {
        provider: "mal",
        external_id: "100",
        imdb: "tt1234567",
        entity: "https://www.wikidata.org/entity/Q12345",
        english: "English fixture name",
      },
    ]);
    await expect(
      db.query("select public.apply_imdb_crossreferences($1::jsonb)", [
        payload,
      ]),
    ).rejects.toThrow();
    await db.exec("reset role;set role service_role;");
    const first = await db.query<{ n: number }>(
      "select public.apply_imdb_crossreferences($1::jsonb) n",
      [payload],
    );
    expect(first.rows[0].n).toBe(1);
    const second = await db.query<{ n: number }>(
      "select public.apply_imdb_crossreferences($1::jsonb) n",
      [payload],
    );
    expect(second.rows[0].n).toBe(0);
    const row = await db.query<{ imdb_id: string; title_english: string }>(
      "select imdb_id,title_english from public.anime where id=1",
    );
    expect(row.rows[0]).toEqual({
      imdb_id: "tt1234567",
      title_english: "English fixture name",
    });
  } finally {
    await db.close();
  }
}, 30000);
