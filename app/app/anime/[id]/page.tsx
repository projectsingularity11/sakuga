import Image from "next/image";
import { notFound } from "next/navigation";
import { account, membership, reportContent } from "@/app/actions";
import { LibraryEditor } from "@/components/library-editor";
import {
  trustedImage,
  trustedSource,
  type Anime,
  type Entry,
} from "@/lib/domain";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { client, user } = await account();
  const [{ data }, { data: entry }, { data: collections }, { data: profile }] =
    await Promise.all([
      client
        .from("anime")
        .select("*,ratings(*),source_mappings(*)")
        .eq("id", id)
        .single(),
      client
        .from("library")
        .select("*")
        .eq("user_id", user.id)
        .eq("anime_id", id)
        .maybeSingle(),
      client
        .from("collections")
        .select("id,name")
        .eq("user_id", user.id)
        .is("rules", null),
      client.from("profiles").select("preferences").eq("id", user.id).single(),
    ]);
  if (!data) notFound();
  const anime = data as Anime;
  const image =
    profile?.preferences?.hide_mature && anime.mature
      ? null
      : trustedImage(anime.cover_url);
  return (
    <>
      <div className="dossier">
        <div className="dossier-cover">
          {image ? (
            <Image
              src={image}
              alt={`${anime.title} cover`}
              width={300}
              height={440}
            />
          ) : (
            <div className="cover-placeholder">Artwork unavailable</div>
          )}
        </div>
        <div>
          <p className="muted">
            {anime.format || "Anime"} · {anime.year || "Release unknown"} ·{" "}
            {anime.episodes ?? "Unknown"} episodes
          </p>
          <h1>{anime.title}</h1>
          <p className="alternate">
            {[anime.title_romaji, anime.title_native]
              .filter((t) => t && t !== anime.title)
              .join(" / ")}
          </p>
          <div className="tags">
            {anime.genres.map((g) => (
              <span key={g}>{g}</span>
            ))}
            {anime.mature && <span>Mature themes</span>}
          </div>
          <p className="synopsis">
            {anime.synopsis ||
              "A synopsis is not available from the source yet."}
          </p>
          <p className="muted">
            {anime.studios.join(" · ")}{" "}
            {anime.duration && ` · ${anime.duration} minutes per episode`}
          </p>
          <h2>Different audiences. Different perspectives.</h2>
          <div className="ratings">
            {anime.ratings.length ? (
              anime.ratings.map((r) => {
                const source = anime.source_mappings.find(
                  (s) => s.provider === r.provider,
                );
                const url = source ? trustedSource(source.url) : null;
                return (
                  <article key={r.provider}>
                    <span>{r.provider.toUpperCase()}</span>
                    <strong>
                      {r.score === null ? "Unavailable" : r.score}
                      <small>{r.score !== null && ` / ${r.scale}`}</small>
                    </strong>
                    <p>
                      {r.votes === null
                        ? "Sample size unavailable"
                        : `${r.votes.toLocaleString()} ratings`}
                    </p>
                    <small>
                      Refreshed{" "}
                      {new Date(r.refreshed_at).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </small>
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer">
                        View source ↗
                      </a>
                    )}
                  </article>
                );
              })
            ) : (
              <p>
                No source ratings available. A missing score is never shown as
                zero.
              </p>
            )}
          </div>
          <p className="muted">
            Original source scales are shown. Audiences and scoring methods
            differ; these scores are not a consensus.
          </p>
        </div>
      </div>
      <div className="detail-lower">
        <LibraryEditor
          id={anime.id}
          total={anime.episodes}
          entry={entry as Entry | undefined}
        />
        <div>
          {entry && (
            <section className="editor">
              <h2>Give it a collection.</h2>
              {collections?.length ? (
                <form action={membership} className="stack">
                  <input type="hidden" name="anime_id" value={id} />
                  <label>
                    Collection
                    <select name="collection_id">
                      {collections.map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button outline">Add to collection</button>
                </form>
              ) : (
                <p>Create your first collection from Collections.</p>
              )}
            </section>
          )}
          <details className="report">
            <summary>Something doesn’t look right?</summary>
            <form action={reportContent} className="stack">
              <input type="hidden" name="anime_id" value={id} />
              <label>
                Report a content or metadata issue
                <textarea
                  name="reason"
                  minLength={5}
                  maxLength={2000}
                  required
                />
              </label>
              <button className="button outline">Send report</button>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}
