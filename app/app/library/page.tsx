import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
  const page = Math.max(1, Math.min(10000, Math.floor(Number(p.page) || 1)));
  const { data: result, error } = await client.rpc("library_show_page", {
    filters: {
      ...p,
      status: statuses.includes(p.status as Entry["status"]) ? p.status : "",
    },
    page_number: page,
  });
  if (error) throw Error("Library could not be loaded");
  const data = result?.entries || [],
    count = Number(result?.count || 0);
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
          <h1>My library</h1>
          <p>
            {count || 0} {count === 1 ? "show / film" : "shows & films"}
          </p>
        </div>
        <Link href="/app/discover" className="button">
          Discover anime <ArrowUpRight size={16} />
        </Link>
      </div>
      <details
        className="library-filters"
        open={Object.keys(p).some((key) => key !== "page")}
      >
        <summary>Filters & sorting</summary>
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
      </details>
      {entries.length ? (
        <LibraryViews
          entries={entries}
          hideMature={profile?.preferences?.hide_mature}
          language={profile?.preferences?.language || "english"}
        />
      ) : (
        <div className="empty-state">
          <h2>No saved anime</h2>
          <p>Add anime from Discover, or change your filters.</p>
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
