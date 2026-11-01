import { db } from "./supabase";
import type { Anime } from "./domain";
export async function catalog(params: Record<string, string | undefined>) {
  const client = await db();
  const page = Math.min(10000, Math.max(1, Number(params.page) || 1));
  let q = client
    .from("anime")
    .select(`*,ratings${params.source ? "!inner" : ""}(*),source_mappings(*)`, {
      count: "exact",
    })
    .eq("moderation", "published");
  const search = (params.q || "")
    .trim()
    .slice(0, 100)
    .replace(/[%_,().]/g, "");
  if (search) q = q.ilike("search_text", `%${search}%`);
  if (params.genre) q = q.contains("genres", [params.genre.slice(0, 80)]);
  if (params.format) q = q.eq("format", params.format);
  if (params.year && /^\d{4}$/.test(params.year))
    q = q.eq("year", Number(params.year));
  if (params.source && ["anilist", "mal", "kitsu"].includes(params.source)) {
    q = q.eq("ratings.provider", params.source);
    if (
      params.rating &&
      Number(params.rating) >= 0 &&
      Number(params.rating) <= 10
    )
      q = q.gte(
        "ratings.score",
        Number(params.rating) * (params.source === "anilist" ? 10 : 1),
      );
  }
  if (params.studio) q = q.contains("studios", [params.studio.slice(0, 100)]);
  if (params.season) q = q.eq("season", params.season);
  if (params.airing) q = q.eq("airing_status", params.airing);
  if (params.short === "true") q = q.lte("episodes", 13);
  const { data, count, error } = await q
    .order("popularity", { ascending: false, nullsFirst: false })
    .order("id")
    .range((page - 1) * 24, page * 24 - 1);
  if (error) throw Error("Catalog is temporarily unavailable. Please retry.");
  return { titles: (data || []) as Anime[], count: count || 0, page };
}
