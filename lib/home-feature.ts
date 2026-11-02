import type { Anime } from "./domain";
import { trustedImage } from "./asset-urls";
import { resolveTitle, formatLabel } from "./metadata";
import { englishSynopsis, releaseDescription, mediaLinks } from "./media";
import { animeHref } from "./series";
import { artworkFor, type HomeArtwork } from "./home-artwork";
export type FeatureSlide = {
  id: number;
  title: string;
  format: string;
  year: string;
  parts: string;
  synopsis: string;
  cover: string | null;
  banner: string | null;
  href: string;
  libraryHref: string;
  trailer: string;
  hasTrailer: boolean;
  art?: HomeArtwork;
};
export function projectFeature(a: Anime, language: string): FeatureSlide {
  const media = mediaLinks(a),
    text = englishSynopsis(a) || releaseDescription(a);
  return {
    id: a.id,
    title: resolveTitle(a, language),
    format: formatLabel(a.format),
    year: a.year ? String(a.year) : "Year unknown",
    parts:
      (a.series_count || 1) > 1
        ? `${a.series_count} seasons / parts`
        : a.episodes
          ? `${a.episodes} episodes`
          : "Episodes unannounced",
    synopsis: text.length > 420 ? text.slice(0, 417).trimEnd() + "…" : text,
    cover: artworkFor(a.id)?.cover?.webp || trustedImage(a.cover_url),
    banner: trustedImage(a.banner_url),
    href: animeHref(a),
    libraryHref: animeHref(a, true),
    trailer: media.trailer || media.trailerSearch,
    hasTrailer: !!media.trailer,
    art: artworkFor(a.id),
  };
}
