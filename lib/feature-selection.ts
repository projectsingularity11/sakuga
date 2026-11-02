import { artworkFor } from "./home-artwork";
import type { Anime } from "./domain";
/** Shuffle a copy outside the catalog cache. Never mutate shared public data. */
export function featuredSelection(
  titles: Anime[],
  random: () => number = Math.random,
  limit = 6,
) {
  const pool = [
    ...new Map(
      titles.filter((a) => !a.mature).map((a) => [a.series_id || a.id, a]),
    ).values(),
  ];
  const illustrated = pool.filter((a) => a.cover_url || a.banner_url);
  const nativeWide = illustrated.filter((a) => {
    const art = artworkFor(a.id);
    return art?.banner && art.banner.width >= 1400 && art.banner.height >= 600;
  });
  const selection =
    nativeWide.length >= Math.min(4, illustrated.length) &&
    nativeWide.length >= 2
      ? nativeWide
      : illustrated.length >= 2
        ? illustrated
        : pool;
  for (let i = selection.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [selection[i], selection[j]] = [selection[j], selection[i]];
  }
  return selection.slice(0, limit);
}
