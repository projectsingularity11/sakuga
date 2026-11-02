import type { Anime } from "./domain";
import { resolveTitle, formatLabel } from "./metadata";
export function trailerLink(value?: string | null) {
  try {
    if (!value) return null;
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    if (
      u.hostname === "www.youtube.com" &&
      u.pathname === "/watch" &&
      /^[\w-]{11}$/.test(u.searchParams.get("v") || "")
    )
      return u.href;
    if (
      u.hostname === "www.dailymotion.com" &&
      /^\/video\/[a-zA-Z0-9]+$/.test(u.pathname)
    )
      return u.href;
    return null;
  } catch {
    return null;
  }
}
export function mediaLinks(a: Anime) {
  const name = resolveTitle(a);
  const query = [name, a.year].filter(Boolean).join(" ");
  const mal = a.source_mappings?.find(
    (s) =>
      s.provider === "mal" &&
      /^https:\/\/myanimelist\.net\/anime\/\d+(?:\/[^?]*)?$/.test(s.url),
  );
  return {
    mal:
      mal?.url ||
      "https://myanimelist.net/anime.php?q=" + encodeURIComponent(name),
    malVerified: !!mal,
    imdb:
      a.imdb_id && /^tt\d{5,12}$/.test(a.imdb_id)
        ? `https://www.imdb.com/title/${a.imdb_id}/`
        : "https://www.imdb.com/find/?s=tt&q=" + encodeURIComponent(query),
    imdbVerified: !!a.imdb_id && /^tt\d{5,12}$/.test(a.imdb_id),
    trailer: trailerLink(a.trailer_url),
    trailerSearch:
      "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(query + " anime official trailer"),
  };
}
export function englishSynopsis(a: Anime) {
  const text = a.synopsis?.replace(/<[^>]*>/g, " ").trim();
  if (!text) return null;
  const foreign = (
    text.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Cyrillic}]/gu,
    ) || []
  ).length;
  const letters = (text.match(/\p{L}/gu) || []).length;
  return foreign / Math.max(1, letters) < 0.15 &&
    a.synopsis_language !== "other"
    ? text
    : null;
}
export function releaseDescription(a: Anime) {
  const kind = formatLabel(a.format);
  return `${resolveTitle(a)} is ${kind === "Anime" ? "an anime" : `a ${kind.toLowerCase()}`}${a.year ? ` released in ${a.year}` : ""}.${a.episodes ? ` The release has ${a.episodes} ${a.episodes === 1 ? "episode" : "episodes"}.` : ""}${a.studios?.length ? ` Studio: ${a.studios.join(", ")}.` : ""}${a.genres?.length ? ` Genres: ${a.genres.join(", ")}.` : ""}`;
}
