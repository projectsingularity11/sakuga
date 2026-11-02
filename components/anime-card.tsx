import { Plus } from "lucide-react";
import { MediaLinks } from "./media-links";
import Link from "next/link";
import { animeHref } from "@/lib/series";
import type { Anime } from "@/lib/domain";
import { trustedImage } from "@/lib/domain";
import {
  resolveTitle,
  formatLabel,
  qualifiedCover,
  releaseLabel,
} from "@/lib/metadata";
import { CoverImage } from "./cover-image";
export function AnimeCard({
  anime,
  hideMature = false,
  language = "english",
  publicPage = false,
}: {
  anime: Anime;
  hideMature?: boolean;
  language?: string;
  publicPage?: boolean;
}) {
  const title = resolveTitle(anime, language),
    href = animeHref(anime, !publicPage);
  const scores = anime.ratings?.filter((r) => r.score !== null) || [];
  return (
    <article className="anime-card">
      <Link href={href} className="poster-link">
        <div className="cover">
          <CoverImage
            key={anime.cover_url}
            id={anime.id}
            src={
              hideMature && anime.mature
                ? null
                : trustedImage(qualifiedCover(anime))
            }
            title={title}
          />
          <span className="poster-format">{formatLabel(anime.format)}</span>
        </div>
        <h3>{title}</h3>
      </Link>
      <p>
        {anime.year || "Year unknown"} · {releaseLabel(anime.airing_status)}
      </p>
      {scores.length > 0 && (
        <div className="source-scores">
          {scores.slice(0, 2).map((r) => (
            <span key={r.provider}>
              {r.provider.toUpperCase()}{" "}
              <b>
                {r.score}/{r.scale}
              </b>
            </span>
          ))}
        </div>
      )}
      <Link className="card-list-action" href={animeHref(anime, true)}>
        <Plus size={13} /> Manage list
      </Link>
      {(anime.series_count || 1) > 1 && (
        <p className="series-count">{anime.series_count} seasons / parts</p>
      )}
      <MediaLinks anime={anime} compact />
    </article>
  );
}
