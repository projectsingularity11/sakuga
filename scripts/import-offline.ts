/** ODbL source import. Never substitutes aggregate dataset scores for provider ratings. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import { operator } from "./client";
import { trustedImage } from "../lib/domain";
const row = z.object({
  sources: z.array(z.string().url()),
  title: z.string(),
  type: z.string(),
  episodes: z.number().int().nonnegative(),
  status: z.string(),
  animeSeason: z.object({ year: z.number().optional(), season: z.string() }),
  picture: z.string(),
  duration: z.object({ value: z.number() }).optional(),
  synonyms: z.array(z.string()),
  studios: z.array(z.string()),
  tags: z.array(z.string()),
});
const schema = z.object({
  lastUpdate: z.string(),
  license: z.object({ name: z.string(), url: z.string() }),
  data: z.array(row),
});
const path = process.argv.find((a) => a.startsWith("--file="))?.slice(7);
if (!path)
  throw Error(
    "Use --file=/path/to/anime-offline-database-minified.json. Download the original ODbL release; see docs/PROVIDERS.md.",
  );
const input = schema.parse(JSON.parse(await readFile(path, "utf8")));
const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Ecchi",
  "Music",
  "Psychological",
];
const seen = new Set<number>();
const records = input.data.flatMap((m) => {
  const source = m.sources.find((s) =>
    /^https:\/\/anilist.co\/anime\/\d+$/.test(s),
  );
  if (!source) return [];
  const id = Number(source.split("/").at(-1));
  if (seen.has(id)) return [];
  seen.add(id);
  const tags = new Set(m.tags);
  const explicit = [
    "hentai",
    "pornography",
    "plot with porn",
    "erotic torture",
  ].some((t) => tags.has(t));
  const ambiguous =
    ["borderline porn", "erotica", "adult audience only"].some((t) =>
      tags.has(t),
    ) || tags.size === 0;
  const moderation = explicit
    ? "excluded"
    : ambiguous
      ? "quarantine"
      : "published";
  const anime = {
    id,
    title: m.title,
    synonyms: m.synonyms,
    format: m.type,
    year: m.animeSeason.year ?? null,
    season: m.animeSeason.season,
    airing_status:
      (
        {
          ONGOING: "RELEASING",
          FINISHED: "FINISHED",
          UPCOMING: "NOT_YET_RELEASED",
        } as Record<string, string>
      )[m.status] ?? null,
    episodes: m.episodes || null,
    duration: m.duration?.value
      ? Math.max(1, Math.round(m.duration.value / 60))
      : null,
    genres: genres.filter(
      (g) =>
        tags.has(g.toLowerCase()) ||
        (g === "Sci-Fi" &&
          ["sci fi", "science fiction", "science-fiction"].some((t) =>
            tags.has(t),
          )),
    ),
    studios: m.studios,
    cover_url: moderation === "published" ? trustedImage(m.picture) : null,
    moderation,
    moderation_reason:
      moderation === "published"
        ? "ODbL catalog: no explicit or ambiguous pornography tag; subject to reports and provider refresh"
        : "Offline catalog tag screening; explicit or ambiguous sexual classifications withheld",
    mature: ["ecchi", "nudity", "sexual humour", "gore"].some((t) =>
      tags.has(t),
    ),
    popularity: null,
  };
  const mappings = m.sources.flatMap((url) => {
    const provider = url.startsWith("https://anilist.co/anime/")
      ? "anilist"
      : url.startsWith("https://myanimelist.net/anime/")
        ? "mal"
        : url.startsWith("https://kitsu.app/anime/")
          ? "kitsu"
          : null;
    return provider
      ? [
          {
            anime_id: id,
            provider,
            external_id: url.split("/").at(-1)!,
            url,
            provenance: `manami-project/anime-offline-database ${input.lastUpdate}; cross-provider mapping`,
            confidence: 0.95,
            verified: true,
          },
        ]
      : [];
  });
  return [{ anime, mappings }];
});
const summary = {
  sourceDate: input.lastUpdate,
  license: input.license,
  total: records.length,
  published: records.filter((r) => r.anime.moderation === "published").length,
  excluded: records.filter((r) => r.anime.moderation === "excluded").length,
  quarantine: records.filter((r) => r.anime.moderation === "quarantine").length,
};
console.log(JSON.stringify(summary, null, 2));
if (process.argv.includes("--dry-run")) process.exit(0);
const sqlDir = process.argv.find((a) => a.startsWith("--sql-dir="))?.slice(10);
if (sqlDir) await mkdir(sqlDir, { recursive: true });
const client = sqlDir ? null : operator();
for (let offset = 0; offset < records.length; offset += 200) {
  const batch = records.slice(offset, offset + 200);
  const anime = batch.map((r) => r.anime);
  const mappings = batch.flatMap((r) => r.mappings);
  if (sqlDir) {
    const literal = (v: unknown) =>
      `'${JSON.stringify(v).replaceAll("'", "''")}'::jsonb`;
    const fields = Object.keys(anime[0]);
    const types =
      "id bigint,title text,synonyms text[],format text,year int,season text,airing_status text,episodes int,duration int,genres text[],studios text[],cover_url text,moderation text,moderation_reason text,mature boolean,popularity int";
    const sql = `begin; insert into public.anime(${fields.join(",")}) select ${fields.join(",")} from jsonb_to_recordset(${literal(anime)}) as r(${types}) on conflict(id) do nothing;\ninsert into public.source_mappings(anime_id,provider,external_id,url,provenance,confidence,verified) select anime_id,provider,external_id,url,provenance,confidence,verified from jsonb_to_recordset(${literal(mappings)}) as r(anime_id bigint,provider text,external_id text,url text,provenance text,confidence numeric,verified boolean) on conflict do nothing; commit;\n`;
    await writeFile(
      `${sqlDir}/${String(offset / 200).padStart(3, "0")}.sql`,
      sql,
    );
  } else {
    const a = await client!
      .from("anime")
      .upsert(anime, { onConflict: "id", ignoreDuplicates: true });
    if (a.error) throw a.error;
    // Do not overwrite manually reviewed provider mappings.
    const b = await client!
      .from("source_mappings")
      .upsert(mappings, {
        onConflict: "provider,external_id",
        ignoreDuplicates: true,
      });
    if (b.error) throw b.error;
  }
  console.log(
    JSON.stringify({
      processed: Math.min(offset + 200, records.length),
      total: records.length,
    }),
  );
}
