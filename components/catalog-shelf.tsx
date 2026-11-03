import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimeCard } from "./anime-card";
import { AnimeRow } from "./anime-row";
import { FilmRail } from "./film-rail";
import type { catalog } from "@/lib/catalog";
export type FeedResult = PromiseSettledResult<
  Awaited<ReturnType<typeof catalog>>
>;
export async function CatalogShelf({
  result,
  title,
  href,
  language,
  rail = false,
  variant = "posters",
}: {
  result: Promise<FeedResult>;
  title: string;
  href: string;
  language: string;
  rail?: boolean;
  variant?: "posters" | "popular" | "rows";
}) {
  const feed = await result;
  const titles =
    feed.status === "fulfilled"
      ? feed.value.titles.slice(0, variant === "popular" || rail ? 8 : 4)
      : [];
  const cards = titles.map((a) => (
    <AnimeCard
      key={a.id}
      anime={a}
      language={language}
      publicPage
      compact={variant === "popular"}
    />
  ));
  return (
    <section
      className={`catalog-section ${rail ? "catalog-strip" : `catalog-${variant}`}`}
    >
      <div className="shelf-heading">
        <h2>{title}</h2>
        <Link href={href}>
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      {titles.length ? (
        variant === "rows" ? (
          <div className="anime-row-grid">
            {titles.map((a) => (
              <AnimeRow key={a.id} anime={a} language={language} />
            ))}
          </div>
        ) : rail ? (
          <FilmRail label={title}>{cards}</FilmRail>
        ) : (
          <div className="home-anime-grid">{cards}</div>
        )
      ) : (
        <p className="feed-notice">
          {feed.status === "rejected"
            ? "This section is temporarily unavailable."
            : "No published titles match this section yet."}{" "}
          <Link href={href}>Explore the catalog</Link>
        </p>
      )}
    </section>
  );
}
export function ShelfPlaceholder() {
  return (
    <div
      className="shelf-placeholder"
      aria-label="Loading catalog"
      aria-busy="true"
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
