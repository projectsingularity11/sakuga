import { BorderBeam } from "@/components/border-beam";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { featuredSelection } from "@/lib/feature-selection";
import { projectFeature } from "@/lib/home-feature";
import { viewerLanguage } from "@/lib/viewer";
import { PublicNav } from "@/components/public-nav";
import { Brand } from "@/components/brand";
import {
  CatalogShelf,
  ShelfPlaceholder,
  type FeedResult,
} from "@/components/catalog-shelf";
import { catalog } from "@/lib/catalog";
const settle = (promise: ReturnType<typeof catalog>): Promise<FeedResult> =>
  promise.then(
    (value) => ({ status: "fulfilled", value }),
    (reason) => ({ status: "rejected", reason }),
  );
export default async function Home() {
  const year = new Date().getUTCFullYear();
  const popular = settle(catalog({})),
    current = settle(catalog({ year: String(year), sort: "newest" })),
    upcoming = settle(catalog({ airing: "NOT_YET_RELEASED", sort: "popular" })),
    airing = settle(catalog({ airing: "RELEASING", sort: "popular" }));
  const [language, main] = await Promise.all([viewerLanguage(), popular]);
  const features = featuredSelection(
    main.status === "fulfilled" ? main.value.titles : [],
  ).map((a) => projectFeature(a, language));
  return (
    <div className="journal-home">
      <PublicNav />
      <main id="main">
        <div className="journal-intro">
          <BorderBeam />
          <h1>
            Find anime.
            <br />
            <span>Keep your place.</span>
          </h1>
          <Link href="/app/library" className="intro-list">
            Your list <ArrowUpRight size={18} />
          </Link>
        </div>
        <nav className="browse-shortcuts" aria-label="Browse genres">
          <Link className="shortcut-all" href="/discover">
            All anime <ArrowUpRight size={15} />
          </Link>
          {["Action", "Fantasy", "Romance", "Sci-Fi", "Slice of Life"].map(
            (g) => (
              <Link key={g} href={"/discover?genre=" + encodeURIComponent(g)}>
                {g}
              </Link>
            ),
          )}
        </nav>
        <div className="home-lead">
          <FeaturedCarousel
            key={features.map((a) => a.id).join("-")}
            titles={features}
          />
          <Suspense fallback={<ShelfPlaceholder />}>
            <CatalogShelf
              result={popular}
              title="Popular with anime fans"
              href="/discover"
              language={language}
              variant="popular"
            />
          </Suspense>
        </div>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={airing}
            title="Series airing now"
            href="/discover?airing=RELEASING"
            language={language}
            rail
          />
        </Suspense>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={current}
            title={`Released in ${year}`}
            href={`/discover?year=${year}&sort=newest`}
            language={language}
            rail
          />
        </Suspense>
        <Suspense fallback={<ShelfPlaceholder />}>
          <CatalogShelf
            result={upcoming}
            title="Coming next"
            href="/discover?airing=NOT_YET_RELEASED"
            language={language}
            variant="rows"
          />
        </Suspense>
      </main>
      <footer>
        <div>
          <Brand />
          <p>Anime discovery & personal lists.</p>
        </div>
        <nav aria-label="Footer">
          <Link href="/discover">Discover</Link>
          <Link href="/app/library">Your list</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/content-policy">Content & sources</Link>
        </nav>
      </footer>
    </div>
  );
}
