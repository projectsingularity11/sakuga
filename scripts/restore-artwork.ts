import { readFile, mkdir, writeFile } from "node:fs/promises";
import { operator } from "./client";
import { trustedImage } from "../lib/domain";
const file = process.argv.find((a) => a.startsWith("--file="))?.slice(7);
if (!file)
  throw Error("Pass --file=/path/to/anime-offline-database-minified.json");
const sqlDir = process.argv.find((a) => a.startsWith("--sql-dir="))?.slice(10);
const input = JSON.parse(await readFile(file, "utf8")) as {
  data: { sources: string[]; picture: string }[];
};
if (!Array.isArray(input.data)) throw Error("Invalid catalog file");
const rows = input.data.flatMap((m) => {
  const source = m.sources.find((s) =>
    /^https:\/\/anilist.co\/anime\/\d+$/.test(s),
  );
  const cover = trustedImage(m.picture);
  return source && cover && !/no_pic|\/default\./.test(cover)
    ? [{ id: Number(source.split("/").at(-1)), cover }]
    : [];
});
if (sqlDir) await mkdir(sqlDir, { recursive: true });
const client = sqlDir ? null : operator();
for (let offset = 0; offset < rows.length; offset += 1000) {
  const batch = rows.slice(offset, offset + 1000);
  if (sqlDir) {
    const payload = JSON.stringify(batch).replaceAll("'", "''");
    await writeFile(
      `${sqlDir}/${offset / 1000}.sql`,
      `update public.anime a set cover_url=r.cover,cover_width=null,cover_height=null from jsonb_to_recordset('${payload}'::jsonb) r(id bigint,cover text) where a.id=r.id and a.moderation='published' and a.cover_url is null;\n`,
    );
  } else {
    for (const row of batch) {
      const { error } = await client!
        .from("anime")
        .update({ cover_url: row.cover, cover_width: null, cover_height: null })
        .eq("id", row.id)
        .eq("moderation", "published")
        .is("cover_url", null);
      if (error) throw error;
    }
  }
  console.log(
    JSON.stringify({
      processed: Math.min(offset + 1000, rows.length),
      available: rows.length,
    }),
  );
}
