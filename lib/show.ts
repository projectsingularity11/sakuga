import "server-only";
import { db } from "./supabase";
import type { Anime } from "./domain";
export async function loadShow(
  client: Awaited<ReturnType<typeof db>>,
  id: string,
  season?: string,
) {
  const { data, error } = await client
    .from("anime")
    .select("*,ratings(*),source_mappings(*)")
    .eq("id", id)
    .eq("moderation", "published")
    .maybeSingle();
  if (error) throw Error("Could not load this show. Please retry.");
  if (!data) return null;
  const initial = data as Anime;
  let members: Anime[] = [initial];
  if (initial.series_id) {
    const result = await client
      .from("anime")
      .select("*,ratings(*),source_mappings(*)")
      .eq("series_id", initial.series_id)
      .eq("moderation", "published")
      .order("year", { ascending: true, nullsFirst: false })
      .order("id");
    if (result.error) throw Error("Could not load seasons. Please retry.");
    if (result.data?.length) members = result.data as Anime[];
  }
  const show = members.find((a) => a.id === initial.series_id) || initial;
  const selected =
    season && /^\d{1,10}$/.test(season)
      ? members.find((a) => a.id === Number(season))
      : undefined;
  return { show, members, anime: selected || initial };
}
