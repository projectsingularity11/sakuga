import { account } from "@/app/actions";
import { entrySchema } from "@/lib/domain";
export async function GET(request: Request) {
  const { client, user } = await account();
  const { count, error: countError } = await client
    .from("library")
    .select("anime_id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError)
    return Response.json({ error: "Export unavailable" }, { status: 503 });
  if ((count || 0) > 2000)
    return Response.json(
      {
        error:
          "Export exceeds 2,000 entries; contact operator for a full export.",
      },
      { status: 413 },
    );
  const data = [];
  for (let offset = 0; offset < (count || 0); offset += 500) {
    const { data: batch, error } = await client
      .from("library")
      .select("*")
      .eq("user_id", user.id)
      .order("anime_id")
      .range(offset, offset + 499);
    if (error)
      return Response.json({ error: "Export unavailable" }, { status: 503 });
    data.push(...(batch || []));
  }
  const entries = (data || []).map((e) => entrySchema.parse(e));
  const csv = new URL(request.url).searchParams.get("format") === "csv";
  const quote = (x: unknown) =>
    `"${String(x ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const body = csv
    ? [
        "anime_id,status,progress,score,favorite,notes",
        ...entries.map((e) =>
          [e.anime_id, e.status, e.progress, e.score, e.favorite, e.notes]
            .map(quote)
            .join(","),
        ),
      ].join("\r\n")
    : JSON.stringify({ version: 1, entries }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": csv ? "text/csv" : "application/json",
      "Content-Disposition": `attachment; filename="sakuga-library.${csv ? "csv" : "json"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
