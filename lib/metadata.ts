import type { Anime } from "./domain";
type Titles = {
  title?: string | null;
  title_english?: string | null;
  title_romaji?: string | null;
  title_native?: string | null;
};
const clean = (s?: string | null) => s?.trim() || null;
export function resolveTitle(a: Titles, language = "english") {
  const english = clean(a.title_english),
    romaji = clean(a.title_romaji),
    native = clean(a.title_native),
    legacy = clean(a.title);
  const order =
    language === "native"
      ? [native, english, romaji, legacy]
      : language === "romaji"
        ? [romaji, english, legacy, native]
        : [english, romaji, legacy, native];
  return order.find(Boolean) || "Untitled anime";
}
export function alternateTitles(a: Titles, language = "english") {
  return [
    ...new Set(
      [a.title_english, a.title_romaji, a.title_native, a.title]
        .map(clean)
        .filter((v): v is string => !!v && v !== resolveTitle(a, language)),
    ),
  ];
}
export const formatLabel = (v: string | null) =>
  ({
    TV: "TV series",
    TV_SHORT: "Short series",
    MOVIE: "Film",
    ONA: "Web series",
    OVA: "OVA",
    SPECIAL: "Special",
    MUSIC: "Music video",
  })[v || ""] || "Anime";
export const releaseLabel = (v?: string | null) =>
  ({
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Upcoming",
    FINISHED: "Finished",
    CANCELLED: "Cancelled",
    HIATUS: "On hiatus",
  })[v || ""] || "Release unknown";
export function coverQuality(width?: number | null, height?: number | null) {
  return (width || 0) >= 1080 && (height || 0) >= 1620
    ? "1080p"
    : (width || 0) >= 720 && (height || 0) >= 1080
      ? "720p"
      : "unverified";
}
export function qualifiedCover(
  a: Pick<Anime, "cover_url" | "cover_width" | "cover_height">,
) {
  return coverQuality(a.cover_width, a.cover_height) === "unverified"
    ? null
    : a.cover_url;
}
