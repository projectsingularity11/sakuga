import { notFound } from "next/navigation";
import {
  account,
  membership,
  deleteCollection,
  updateCollection,
  orderCollection,
} from "@/app/actions";
import { matches, ruleSchema, type Entry } from "@/lib/domain";
import { AnimeCard } from "@/components/anime-card";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { client, user } = await account();
  const { data: c } = await client
    .from("collections")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!c) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const offset = (page - 1) * 100;
  let entries: Entry[] = [];
  const positions = new Map<number, number>();
  if (c.rules) {
    const rule = ruleSchema.parse(c.rules);
    let q = client
      .from("library")
      .select("*,anime:anime!inner(*,ratings(*),source_mappings(*))")
      .eq("user_id", user.id);
    if (rule.status) q = q.eq("status", rule.status);
    if (rule.favorite !== undefined) q = q.eq("favorite", rule.favorite);
    if (rule.minScore !== undefined) q = q.gte("score", rule.minScore);
    if (rule.maxEpisodes !== undefined)
      q = q.lte("anime.episodes", rule.maxEpisodes);
    if (rule.genre) q = q.contains("anime.genres", [rule.genre]);
    const { data, error } = await q
      .order("anime_id")
      .range(offset, offset + 99);
    if (error) throw Error("Smart collection could not be loaded");
    entries = ((data || []) as Entry[]).filter((e) => matches(e, rule));
  } else {
    const { data: members, error } = await client
      .from("collection_members")
      .select("anime_id,position")
      .eq("collection_id", id)
      .eq("user_id", user.id)
      .order("position")
      .order("anime_id")
      .range(offset, offset + 99);
    if (error) throw Error("Collection could not be loaded");
    members?.forEach((m) => positions.set(m.anime_id, m.position));
    if (members?.length) {
      const { data, error } = await client
        .from("library")
        .select("*,anime:anime(*,ratings(*),source_mappings(*))")
        .eq("user_id", user.id)
        .in(
          "anime_id",
          members.map((m) => m.anime_id),
        );
      if (error) throw Error("Collection titles could not be loaded");
      entries = ((data || []) as Entry[]).sort(
        (a, b) =>
          (positions.get(a.anime_id) || 0) - (positions.get(b.anime_id) || 0) ||
          a.anime_id - b.anime_id,
      );
    }
  }
  const { data: profile } = await client
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();
  return (
    <>
      <h1>{c.name}</h1>
      <p>
        {c.rules
          ? "A smart collection, updated from your library automatically."
          : "Your private collection. Add titles from their detail pages."}
      </p>
      <p>{c.description}</p>
      <details className="report">
        <summary>Edit this collection</summary>
        <form action={updateCollection} className="stack">
          <input type="hidden" name="id" value={id} />
          <label>
            Name
            <input name="name" defaultValue={c.name} maxLength={100} required />
          </label>
          <label>
            Description
            <textarea
              name="description"
              defaultValue={c.description}
              maxLength={1000}
            />
          </label>
          <label className="check-label">
            <input type="checkbox" name="pinned" defaultChecked={c.pinned} />
            Pin this collection
          </label>
          <button className="button outline">Save collection</button>
        </form>
      </details>
      <div className="anime-grid">
        {entries.map((e) => (
          <div key={e.anime_id}>
            {e.anime ? (
              <AnimeCard
                anime={e.anime}
                hideMature={profile?.preferences?.hide_mature}
              />
            ) : (
              <p>Unavailable title</p>
            )}
            {!c.rules && (
              <div>
                <form action={orderCollection} className="order-form">
                  <input type="hidden" name="collection_id" value={id} />
                  <input type="hidden" name="anime_id" value={e.anime_id} />
                  <label>
                    Position
                    <input
                      type="number"
                      name="position"
                      min="0"
                      max="100000"
                      defaultValue={positions.get(e.anime_id) || 0}
                    />
                  </label>
                  <button className="button small outline">Save order</button>
                </form>
                <form action={membership}>
                  <input type="hidden" name="collection_id" value={id} />
                  <input type="hidden" name="anime_id" value={e.anime_id} />
                  <input type="hidden" name="remove" value="true" />
                  <button className="text-link">Remove from collection</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
      {!entries.length && (
        <div className="empty-state">
          <h2>Room for your favorites.</h2>
          <p>
            {c.rules
              ? "No library titles match this rule yet."
              : "Add titles to your library, then choose this collection on their detail pages."}
          </p>
        </div>
      )}
      <nav className="pagination">
        {page > 1 && <a href={`?page=${page - 1}`}>Previous</a>}
        <span>Page {page}</span>
        {entries.length === 100 && <a href={`?page=${page + 1}`}>Next</a>}
      </nav>
      <details className="report">
        <summary>Delete collection</summary>
        <p>
          Titles will remain in your library. Only this collection is deleted.
        </p>
        <form action={deleteCollection}>
          <input type="hidden" name="id" value={id} />
          <button className="danger">Permanently delete collection</button>
        </form>
      </details>
    </>
  );
}
