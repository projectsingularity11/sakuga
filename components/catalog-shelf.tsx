import Link from "next/link";
import { AnimeCard } from "./anime-card";
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
}: {
  result: Promise<FeedResult>;
  title: string;
  href: string;
  language: string;
  rail?: boolean;
}) {
  const feed = await result;
  const cards =
    feed.status === "fulfilled"
      ? feed.value.titles
          .slice(0, rail ? 10 : 4)
          .map((a) => (
            <AnimeCard key={a.id} anime={a} language={language} publicPage />
          ))
      : [];
  return (
    <section
      className={`catalog-section ${rail ? "catalog-strip" : "catalog-gallery"}`}
    >
      <div className="shelf-heading">
        <h2>{title}</h2>
        <Link href={href}>
          View all <span aria-hidden="true">↗</span>
        </Link>
      </div>
      {cards.length ? (
        rail ? (
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
