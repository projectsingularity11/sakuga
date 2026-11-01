import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { catalog } from "@/lib/catalog";
import { AnimeCard } from "@/components/anime-card";
import { account } from "@/app/actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const [{ titles, count, page }, { client, user }] = await Promise.all([
    catalog(p),
    account(),
  ]);
  const { data: profile } = await client
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();
  function href(n: number) {
    const q = new URLSearchParams(
      Object.entries(p).filter(([, v]) => v !== undefined) as [
        string,
        string,
      ][],
    );
    q.set("page", String(n));
    return `/app/discover?${q}`;
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>A new story awaits.</h1>
          <p>Explore the catalog. Follow your curiosity.</p>
        </div>
        <span>{count.toLocaleString()} published titles</span>
      </div>
      <form className="filter-bar">
        <label className="search-field">
          Search titles
          <input
            name="q"
            placeholder="English, romaji, or native title…"
            defaultValue={p.q}
            maxLength={100}
          />
        </label>
        <label>
          Format
          <select name="format" defaultValue={p.format || ""}>
            <option value="">All formats</option>
            {["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "TV_SHORT", "MUSIC"].map(
              (f) => (
                <option key={f}>{f}</option>
              ),
            )}
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
          Year
          <input
            type="number"
            name="year"
            min="1900"
            max="2100"
            defaultValue={p.year}
          />
        </label>
        <label>
          Rating source
          <select name="source" defaultValue={p.source || ""}>
            <option value="">All sources</option>
            <option value="anilist">AniList</option>
            <option value="mal">MyAnimeList</option>
          </select>
        </label>
        <label>
          Minimum score / 10
          <input
            type="number"
            name="rating"
            min="0"
            max="10"
            step="0.5"
            defaultValue={p.rating}
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
        <button className="button">Explore</button>
      </form>
      <p className="muted">
        Popularity follows AniList membership counts where available. Ratings
        retain their original source scales. The minimum filter converts your
        selected source to /10; choose a source to apply it.
      </p>
      {titles.length ? (
        <div className="anime-grid">
          {titles.map((anime) => (
            <div key={anime.id}>
              <AnimeCard
                anime={anime}
                hideMature={profile?.preferences?.hide_mature}
                language={profile?.preferences?.language}
              />
              <QuickAdd id={anime.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {count === 0 && !p.q
              ? "No published titles yet."
              : "No stories found."}
          </h2>
          <p>
            {p.q
              ? "Try another title or a broader filter."
              : "The catalog will appear after the operator completes provider review and ingestion. No sample titles or ratings are substituted."}
          </p>
        </div>
      )}
      <nav className="pagination" aria-label="Pagination">
        {page > 1 && <Link href={href(page - 1)}>← Previous</Link>}
        <span>Page {page}</span>
        {page * 24 < count && <Link href={href(page + 1)}>Next →</Link>}
      </nav>
    </>
  );
}
