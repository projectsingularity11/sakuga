import { account } from "@/app/actions";
import { labels } from "@/lib/domain";
type Stats = {
  total: number;
  episodes: number;
  statuses: Record<string, number>;
  scores: Record<string, number>;
  genres: Record<string, number>;
  formats: Record<string, number>;
};
export default async function Page() {
  const { client } = await account();
  const { data, error } = await client.rpc("personal_statistics");
  if (error) throw Error("Statistics could not be loaded");
  const s = data as Stats;
  return (
    <>
      <h1>A little perspective.</h1>
      <p>
        Your watch history, at your own pace. Computed across your entire
        library.
      </p>
      <section className="editor">
        <h2>Your library</h2>
        {Object.entries(labels).map(([status, label]) => (
          <div className="stat-row" key={status}>
            <span>{label}</span>
            <progress value={s.statuses[status] || 0} max={s.total || 1} />
            <strong>{s.statuses[status] || 0}</strong>
          </div>
        ))}
        <p>{s.episodes.toLocaleString()} episodes recorded.</p>
        <p className="muted">
          Rewatches are not added to episode totals. No watch-time estimate is
          shown when duration coverage is incomplete.
        </p>
      </section>
      {[
        ["Your scores", s.scores],
        ["The genres you return to", s.genres],
        ["Formats", s.formats],
      ].map(([title, values]) => (
        <section className="editor" key={String(title)}>
          <h2>{String(title)}</h2>
          {Object.entries(values).map(([key, count]) => (
            <div className="stat-row" key={key}>
              <span>{key}</span>
              <progress value={Number(count)} max={s.total || 1} />
              <span>{Number(count)}</span>
            </div>
          ))}
          {!Object.keys(values).length && <p>No entries yet.</p>}
        </section>
      ))}
      <p className="muted">
        Scores group to the nearest whole point. Unrated titles are omitted. A
        title can contribute to more than one genre.
      </p>
    </>
  );
}
