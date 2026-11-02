import { Suspense } from "react";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { featuredSelection } from "@/lib/feature-selection";
import { projectFeature } from "@/lib/home-feature";
import { ArrowUpRight } from "lucide-react";
import { viewerLanguage } from "@/lib/viewer";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import {
  CatalogShelf,
  ShelfPlaceholder,
  type FeedResult,
} from "@/components/catalog-shelf";
import { catalog } from "@/lib/catalog";
const settle = (promise: ReturnType<typeof catalog>): Promise<FeedResult> =>
  promise.then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason) => ({ status: "rejected" as const, reason }),
  );
export default async function Home() {
  const year = new Date().getUTCFullYear();
  const popular = settle(catalog({})),
    current = settle(catalog({ year: String(year), sort: "newest" })),
    upcoming = settle(catalog({ airing: "NOT_YET_RELEASED", sort: "popular" }));
  const [language, main] = await Promise.all([viewerLanguage(), popular]);
  const features = featuredSelection(
    main.status === "fulfilled" ? main.value.titles : [],
  ).map((a) => projectFeature(a, language));
  return (
    <div className="cinema-home prism-home">
      <PublicNav />
      <main id="main">
        <div className="cinema-stage">
          <FeaturedCarousel
            key={features.map((a) => a.id).join("-")}
            titles={features}
          />
          <nav className="browse-shortcuts" aria-label="Browse genres">
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
          </nav>
        </div>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={popular}
            title="Popular with anime fans"
            href="/discover"
            language={language}
            rail
          />
        </Suspense>
        <div className="home-gallery-pair">
          <Suspense fallback={<ShelfPlaceholder />}>
            <CatalogShelf
              result={current}
              title={`Released in ${year}`}
              href={`/discover?year=${year}&sort=newest`}
              language={language}
            />
          </Suspense>
          <Suspense fallback={<ShelfPlaceholder />}>
            <CatalogShelf
              result={upcoming}
              title="Coming next"
              href="/discover?airing=NOT_YET_RELEASED"
              language={language}
            />
          </Suspense>
        </div>
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
