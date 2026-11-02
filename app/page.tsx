import { CoverImage } from "@/components/cover-image";
import { englishSynopsis, releaseDescription, mediaLinks } from "@/lib/media";
import { Play, ArrowUpRight } from "lucide-react";
import { viewerLanguage } from "@/lib/viewer";
import Link from "next/link";
import Image from "next/image";
import { PublicNav } from "@/components/public-nav";
import { AnimeCard } from "@/components/anime-card";
import { catalog } from "@/lib/catalog";
import { resolveTitle, formatLabel } from "@/lib/metadata";
import { trustedImage } from "@/lib/domain";
export default async function Home() {
  const language = await viewerLanguage();
  const year = new Date().getUTCFullYear();
  const feeds = [
    { title: "Popular with anime fans", params: {}, href: "/discover" },
    {
      title: `Released in ${year}`,
      params: { year: String(year), sort: "newest" },
      href: `/discover?year=${year}&sort=newest`,
    },
    {
      title: "Coming next",
      params: { airing: "NOT_YET_RELEASED", sort: "popular" },
      href: "/discover?airing=NOT_YET_RELEASED",
    },
  ];
  const results = await Promise.allSettled(feeds.map((f) => catalog(f.params)));
  const featured =
    results[0].status === "fulfilled"
      ? results[0].value.titles.find((a) => a.synopsis)
      : null;
  const art = featured ? trustedImage(featured.banner_url) : null;
  const preview = featured ? mediaLinks(featured) : null;
  return (
    <div className="cinema-home">
      <PublicNav />
      <main id="main">
        <section className="discovery-feature">
          {
            <Image
              className="featured-backdrop"
              src={art || "/art/sakuga-city.png"}
              alt=""
              fill
              priority
              sizes="100vw"
            />
          }
          <div className="featured-content">
            <h1>
              {featured ? resolveTitle(featured, language) : "Explore anime"}
            </h1>
            {featured && (
              <p className="featured-meta">
                {formatLabel(featured.format)} ·{" "}
                {featured.year || "Year unknown"} ·{" "}
                {featured.episodes
                  ? `${featured.episodes} episodes`
                  : "Episodes unannounced"}
              </p>
            )}
            <p className="featured-synopsis">
              {(featured
                ? englishSynopsis(featured) || releaseDescription(featured)
                : null) ||
                "Discover anime, compare source ratings, and keep track of every story in your own list."}
            </p>
            <div className="hero-actions">
              <Link
                className="button"
                href={featured ? `/anime/${featured.id}` : "/discover"}
              >
                {featured ? "Explore this anime" : "Explore anime"}
              </Link>
              <Link className="button outline" href="/app/library">
                Open my list
              </Link>
              {preview && (
                <a
                  className="hero-preview"
                  href={preview.trailer || preview.trailerSearch}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={15} />
                  {preview.trailer ? "Watch trailer" : "Find trailer"}
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
          <div className="hero-gallery" aria-label="Featured anime artwork">
            {featured && (
              <Link
                className="gallery-main"
                href={`/anime/${featured.id}`}
                aria-label={resolveTitle(featured, language)}
              >
                <CoverImage
                  src={trustedImage(featured.cover_url)}
                  title={resolveTitle(featured, language)}
                  priority
                />
                <span className="poster-open">
                  <ArrowUpRight size={24} />
                  <span>View anime</span>
                </span>
              </Link>
            )}
          </div>
        </section>
        <div className="browse-shortcuts">
          <Link className="shortcut-all" href="/discover">
            All anime <ArrowUpRight size={17} />
          </Link>
          {["Action", "Fantasy", "Romance", "Sci-Fi", "Slice of Life"].map(
            (g) => (
              <Link key={g} href={"/discover?genre=" + encodeURIComponent(g)}>
                {g}
              </Link>
            ),
          )}
        </div>
        {feeds.map((feed, i) => {
          const r = results[i];
          return (
            <section className="catalog-section" key={feed.title}>
              <div className="shelf-heading">
                <h2>{feed.title}</h2>
                <Link href={feed.href}>View all →</Link>
              </div>
              {r.status === "fulfilled" && r.value.titles.length ? (
                <div className="home-anime-grid">
                  {r.value.titles.slice(0, 8).map((a) => (
                    <AnimeCard
                      key={a.id}
                      anime={a}
                      language={language}
                      publicPage
                    />
                  ))}
                </div>
              ) : (
                <p className="feed-notice">
                  {r.status === "rejected"
                    ? "This section is temporarily unavailable."
                    : "No published titles match this section yet."}{" "}
                  <Link href={feed.href}>Explore the catalog</Link>
                </p>
              )}
            </section>
          );
        })}
      </main>
      <footer>
        <Link href="/">sakuga.</Link>

        <nav aria-label="Footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/content-policy">Content & sources</Link>
        </nav>
      </footer>
    </div>
  );
}
