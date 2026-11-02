import { FeaturedCarousel } from "@/components/featured-carousel";
import { featuredSelection } from "@/lib/feature-selection";
import { ArrowUpRight } from "lucide-react";
import { viewerLanguage } from "@/lib/viewer";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { AnimeCard } from "@/components/anime-card";
import { catalog } from "@/lib/catalog";
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
  const features = featuredSelection(
    results[0].status === "fulfilled"
      ? results[0].value.titles
      : results.flatMap((result) =>
          result.status === "fulfilled" ? result.value.titles : [],
        ),
  );
  return (
    <div className="cinema-home">
      <PublicNav />
      <main id="main">
        <FeaturedCarousel
          key={features.map((a) => a.id).join("-")}
          titles={features}
          language={language}
        />
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
        <Link href="/">sakuga</Link>

        <nav aria-label="Footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/content-policy">Content & sources</Link>
        </nav>
      </footer>
    </div>
  );
}
