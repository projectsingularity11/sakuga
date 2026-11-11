import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { redirect } from "next/navigation";
import { PublicNav } from "@/components/public-nav";
import { FeaturedCarousel } from "@/components/featured-carousel";
import {
  CatalogShelf,
  ShelfPlaceholder,
  type FeedResult,
} from "@/components/catalog-shelf";
import { catalog } from "@/lib/catalog";
import { viewerLanguage } from "@/lib/viewer";
import { featuredSelection } from "@/lib/feature-selection";
import { projectFeature } from "@/lib/home-feature";
import { scalarParams } from "@/lib/search";
export const metadata = { title: "Discover anime" };
const settle = (promise: ReturnType<typeof catalog>): Promise<FeedResult> =>
  promise.then(
    (value) => ({ status: "fulfilled", value }),
    (reason) => ({ status: "rejected", reason }),
  );
export default async function Discover({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = scalarParams(await searchParams);
  if (Object.keys(params).length) {
    const query = new URLSearchParams(
      Object.entries(params).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    redirect(`/search?${query}`);
  }
  const popular = settle(catalog({ sort: "popular" })),
    airing = settle(catalog({ airing: "RELEASING", sort: "popular" })),
    recent = settle(catalog({ sort: "newest" })),
    upcoming = settle(catalog({ airing: "NOT_YET_RELEASED", sort: "popular" }));
  const [language, featured] = await Promise.all([viewerLanguage(), popular]);
  const slides = featuredSelection(
    featured.status === "fulfilled" ? featured.value.titles : [],
  ).map((anime) => projectFeature(anime, language));
  return (
    <>
      <PublicNav />
      <main id="main" className="public-catalog discover-assortment">
        <div className="catalog-top">
          <h1>Discover anime</h1>
          <Link className="text-link" href="/search">
            Search the catalog <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="discover-scene">
          <FeaturedCarousel titles={slides} />
        </div>
        <nav className="browse-shortcuts" aria-label="Browse genres">
          {[
            "Action",
            "Adventure",
            "Fantasy",
            "Romance",
            "Sci-Fi",
            "Slice of Life",
          ].map((genre) => (
            <Link
              key={genre}
              href={`/search?genre=${encodeURIComponent(genre)}`}
            >
              {genre}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={recent}
            title="Recent releases"
            href="/search?sort=newest"
            language={language}
            rail
          />
        </Suspense>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={airing}
            title="Top airing"
            href="/search?airing=RELEASING"
            language={language}
            rail
          />
        </Suspense>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={popular}
            title="Popular anime"
            href="/search?sort=popular"
            language={language}
            rail
          />
        </Suspense>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={upcoming}
            title="Upcoming"
            href="/search?airing=NOT_YET_RELEASED"
            language={language}
            variant="rows"
          />
        </Suspense>
      </main>
    </>
  );
}
