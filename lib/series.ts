import type { Anime } from "./domain";
export const showId = (anime: Pick<Anime, "id" | "series_id">) =>
  anime.series_id || anime.id;
export function animeHref(
  anime: Pick<Anime, "id" | "series_id" | "matched_id">,
  workspace = false,
) {
  const root = showId(anime),
    selected = anime.matched_id || anime.id;
  return `${workspace ? "/app" : ""}/anime/${root}${selected !== root ? `?season=${selected}` : ""}`;
}
export function groupEntries<
  T extends { anime_id: number; anime: Anime | null },
>(entries: T[]) {
  const groups = new Map<number, T[]>();
  for (const entry of entries) {
    const key = entry.anime ? showId(entry.anime) : entry.anime_id;
    const group = groups.get(key) || [];
    group.push(entry);
    groups.set(key, group);
  }
  return [...groups.values()];
}
