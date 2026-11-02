import { db, configured } from "@/lib/supabase";
export async function GET() {
  if (!configured())
    return Response.json({ status: "unconfigured" }, { status: 503 });
  try {
    const client = await db();
    const { count, error } = await client
      .from("anime")
      .select("id", { count: "exact", head: true })
      .eq("moderation", "published");
    if (error) throw error;
    return Response.json(
      {
        status: "ready",
        publishedTitles: count,
        catalogSizeTargetMet: (count || 0) >= 10000,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "database-unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
