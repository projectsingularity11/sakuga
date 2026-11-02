import Image from "next/image";
import Link from "next/link";
import type { Anime } from "@/lib/domain";
import { trustedImage } from "@/lib/domain";
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
  const image =
    hideMature && anime.mature ? null : trustedImage(anime.cover_url);
  const title =
    (language === "native"
      ? anime.title_native
      : language === "romaji"
        ? anime.title_romaji
        : null) || anime.title;
  return (
    <Link
      href={`${publicPage ? "/anime" : "/app/anime"}/${anime.id}`}
      className="anime-card"
    >
      <div className="cover">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width:600px) 44vw, (max-width:1000px) 25vw, 18vw"
          />
        ) : (
          <div className="cover-placeholder">
            <span>sakuga.</span>
            <span>
              {hideMature && anime.mature
                ? "Artwork hidden"
                : anime.format || "ANIME"}
            </span>
          </div>
        )}
      </div>
      <h3>{title}</h3>
      <p>
        {anime.year || "Year unknown"} <span>·</span>{" "}
        {anime.format || "Format unknown"} {anime.mature && " · Mature themes"}
      </p>
      <div className="source-scores">
        {anime.ratings
          ?.filter((r) => r.score !== null)
          .map((r) => (
            <span key={r.provider}>
              {r.provider.toUpperCase()}{" "}
              <b>
                {r.score}/{r.scale}
              </b>
            </span>
          ))}
      </div>
    </Link>
  );
}
