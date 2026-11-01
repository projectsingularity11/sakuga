import Link from "next/link";
import { account } from "@/app/actions";
import { LibraryViews } from "@/components/library-views";
import { labels, statuses, type Entry } from "@/lib/domain";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const p = await searchParams;
  const { client, user } = await account();
  let q = client
    .from("library")
    .select("*,anime:anime!inner(*,ratings(*),source_mappings(*))", {
      count: "exact",
    })
    .eq("user_id", user.id);
  if (statuses.includes(p.status as Entry["status"]))
    q = q.eq("status", p.status);
  if (p.q) {
    const search = p.q
      .trim()
      .slice(0, 100)
      .replace(/[%_,().]/g, "");
    q = q.ilike("anime.search_text", `%${search}%`);
  }
  if (p.favorite === "true") q = q.eq("favorite", true);
  const page = Math.max(1, Number(p.page) || 1);
  const { data, count, error } = await q
    .order(p.sort === "score" ? "score" : "updated_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("anime_id")
    .range((page - 1) * 100, page * 100 - 1);
  if (error) throw Error("Library could not be loaded");
  const { data: profile } = await client
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();
  const entries = (data || []) as Entry[];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Your stories, together.</h1>
          <p>{count || 0} titles. Every one has a place.</p>
        </div>
        <Link href="/app/discover" className="button">
          Find a story ↗
        </Link>
      </div>
      <form className="filter-bar">
        <label className="search-field">
          Search your library
          <input
            name="q"
            defaultValue={p.q}
            placeholder="Find a story…"
            maxLength={100}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={p.status || ""}>
            <option value="">All stories</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {labels[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select name="sort" defaultValue={p.sort || "updated"}>
            <option value="updated">Recently updated</option>
            <option value="score">Personal score</option>
          </select>
        </label>
        <label className="check-label">
          <input
            name="favorite"
            value="true"
            type="checkbox"
            defaultChecked={p.favorite === "true"}
          />
          Favorites only
        </label>
        <button className="button outline">Apply filters</button>
      </form>
      {entries.length ? (
        <LibraryViews
          entries={entries}
          hideMature={profile?.preferences?.hide_mature}
          language={profile?.preferences?.language || "english"}
        />
      ) : (
        <div className="empty-state">
          <h2>A little room for something wonderful.</h2>
          <p>Your library is empty here. Add a story from Discover.</p>
        </div>
      )}
      <nav className="pagination" aria-label="Library pages">
        {page > 1 && (
          <Link
            href={`?${new URLSearchParams({ ...p, page: String(page - 1) })}`}
          >
            ← Previous
          </Link>
        )}
        <span>Page {page}</span>
        {page * 100 < (count || 0) && (
          <Link
            href={`?${new URLSearchParams({ ...p, page: String(page + 1) })}`}
          >
            Next →
          </Link>
        )}
      </nav>
      <p className="muted">
        Each view shows this page of your library. Use filters to focus a larger
        collection.
      </p>
    </>
  );
}
