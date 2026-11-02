import { viewerLanguage } from "@/lib/viewer";
import Link from "next/link";
import { scalarParams } from "@/lib/search";
import { PublicNav } from "@/components/public-nav";
import { AnimeCard } from "@/components/anime-card";
import { catalog } from "@/lib/catalog";
import { configured } from "@/lib/supabase";
export const metadata = { title: "Discover anime" };
export default async function Discover({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const language = await viewerLanguage();
  const p = scalarParams(await searchParams);
  let result: Awaited<ReturnType<typeof catalog>> | null = null;
  let unavailable = false;
  if (configured()) {
    try {
      result = await catalog(p);
    } catch {
      unavailable = true;
    }
  }
  const href = (n: number) => {
    const q = new URLSearchParams(
      Object.entries(p).filter(([, v]) => v !== undefined) as [
        string,
        string,
      ][],
    );
    q.set("page", String(n));
    return `/discover?${q}`;
  };
  return (
    <>
      <PublicNav />
      <main id="main" className="public-catalog">
        <div className="catalog-top">
          <div>
            <h1>Find your next obsession.</h1>
            <p>Big adventures. Quiet moments. Something that feels like you.</p>
          </div>
          {result && (
            <span>{result.count.toLocaleString()} matching titles</span>
          )}
        </div>
        <form className="filter-bar">
          <label className="search-field">
            Search anime
            <input
              name="q"
              defaultValue={p.q}
              placeholder="English, romaji, or native title…"
              maxLength={100}
            />
          </label>
          <label>
            Format
            <select name="format" defaultValue={p.format || ""}>
              <option value="">All formats</option>
              {[
                "TV",
                "MOVIE",
                "OVA",
                "ONA",
                "SPECIAL",
                "TV_SHORT",
                "MUSIC",
              ].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Genre
            <select name="genre" defaultValue={p.genre || ""}>
              <option value="">All genres</option>
              {[
                "Action",
                "Adventure",
                "Comedy",
                "Drama",
                "Fantasy",
                "Horror",
                "Mystery",
                "Romance",
                "Sci-Fi",
                "Slice of Life",
                "Sports",
                "Thriller",
              ].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Release status
            <select name="airing" defaultValue={p.airing || ""}>
              <option value="">All releases</option>
              <option value="RELEASING">Airing</option>
              <option value="NOT_YET_RELEASED">Upcoming</option>
              <option value="FINISHED">Finished</option>
            </select>
          </label>
          <label>
            Season
            <select name="season" defaultValue={p.season || ""}>
              <option value="">All seasons</option>
              {["WINTER", "SPRING", "SUMMER", "FALL"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Year
            <input
              type="number"
              name="year"
              min="1900"
              max="2100"
              defaultValue={p.year}
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              name="short"
              value="true"
              defaultChecked={p.short === "true"}
            />
            13 episodes or fewer
          </label>
          <label>
            Sort
            <select name="sort" defaultValue={p.sort || "popular"}>
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Source rating</option>
            </select>
          </label>
          <button className="button">Search</button>
          <Link href="/discover" className="text-link">
            Reset
          </Link>
        </form>
        {result?.titles.length ? (
          <>
            <div className="anime-grid">
              {result.titles.map((a) => (
                <AnimeCard
                  key={a.id}
                  anime={a}
                  language={language}
                  publicPage
                />
              ))}
            </div>
            <nav className="pagination" aria-label="Pagination">
              {result.page > 1 && (
                <Link href={href(result.page - 1)}>← Previous</Link>
              )}
              <span>
                Page {result.page} of{" "}
                {Math.max(1, Math.ceil(result.count / 24))}
              </span>
              {result.page * 24 < result.count && (
                <Link href={href(result.page + 1)}>Next →</Link>
              )}
            </nav>
          </>
        ) : (
          <div className="catalog-message" role="status">
            <h2>
              {unavailable
                ? "The catalog is taking a moment."
                : "No stories found."}
            </h2>
            <p>
              {unavailable
                ? "Please try again shortly."
                : "Try another title or broaden your filters."}
            </p>
            <Link className="button outline" href="/discover">
              Try again
            </Link>
          </div>
        )}
        <p className="art-attribution">
          Metadata: anime-offline-database (ODbL), with source attribution on
          each title. Provider refreshes add synopses and original ratings.{" "}
          <Link href="/content-policy">Content & sources</Link>
        </p>
      </main>
    </>
  );
}
