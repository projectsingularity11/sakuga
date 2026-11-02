import { ArrowUpRight, Play } from "lucide-react";
import type { Anime } from "@/lib/domain";
import { mediaLinks } from "@/lib/media";
export function MediaLinks({
  anime,
  compact = false,
}: {
  anime: Anime;
  compact?: boolean;
}) {
  const l = mediaLinks(anime);
  if (compact)
    return (
      <nav className="card-sources" aria-label="Anime sources">
        <a
          href={l.mal}
          target="_blank"
          rel="noreferrer"
          aria-label={
            l.malVerified ? "MyAnimeList listing" : "Search MyAnimeList"
          }
        >
          MAL
          <ArrowUpRight size={11} />
        </a>
        <a
          href={l.imdb}
          target="_blank"
          rel="noreferrer"
          aria-label={l.imdbVerified ? "IMDb listing" : "Search IMDb"}
        >
          IMDb
          <ArrowUpRight size={11} />
        </a>
        <a href={l.trailer || l.trailerSearch} target="_blank" rel="noreferrer">
          <Play size={11} />
          {l.trailer ? "Trailer" : "Find trailer"}
        </a>
      </nav>
    );
  return (
    <section className="media-links" aria-label="Trailers and databases">
      <a
        href={l.trailer || l.trailerSearch}
        target="_blank"
        rel="noreferrer"
        className="trailer-link"
      >
        <Play size={17} />
        <span>
          {l.trailer ? "Watch trailer" : "Find a trailer"}
          <small>
            {l.trailer
              ? "Provider-linked preview"
              : "Search YouTube · availability varies"}
          </small>
        </span>
        <ArrowUpRight size={16} />
      </a>
      <div>
        <a href={l.mal} target="_blank" rel="noreferrer">
          {l.malVerified ? "MyAnimeList" : "Search MyAnimeList"}
          <ArrowUpRight size={14} />
        </a>
        <a href={l.imdb} target="_blank" rel="noreferrer">
          {l.imdbVerified ? "IMDb" : "Search IMDb"}
          <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
