import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Anime } from "@/lib/domain";
import { trustedImage } from "@/lib/asset-urls";
import { resolveTitle, formatLabel, qualifiedCover } from "@/lib/metadata";
import { animeHref } from "@/lib/series";
import { CoverImage } from "./cover-image";
export function AnimeRow({
  anime,
  language,
}: {
  anime: Anime;
  language: string;
}) {
  const title = resolveTitle(anime, language);
  return (
    <article className="anime-row">
      <Link
        href={animeHref(anime)}
        className="row-art"
        aria-label={`View ${title}`}
      >
        <CoverImage
          compact
          id={anime.id}
          src={trustedImage(qualifiedCover(anime))}
          title={title}
        />
      </Link>
      <div className="row-copy">
        <h3>
          <Link href={animeHref(anime)}>{title}</Link>
        </h3>
        <p>
          {formatLabel(anime.format)} <span aria-hidden="true">·</span>{" "}
          {anime.year || "Year unannounced"}
        </p>
      </div>
      <Link
        className="row-list"
        href={animeHref(anime, true)}
        aria-label={`Manage ${title} in your list`}
      >
        <ArrowUpRight size={18} />
      </Link>
    </article>
  );
}
