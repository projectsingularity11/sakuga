"use client";
import Link from "next/link";
import { resolveTitle } from "@/lib/metadata";
import { useState } from "react";
import { groupEntries, animeHref } from "@/lib/series";
import { AnimeCard } from "./anime-card";
import { labels, statuses, type Entry } from "@/lib/domain";
import { saveEntry } from "@/app/actions";
export function LibraryViews({
  entries,
  hideMature,
  language,
}: {
  entries: Entry[];
  hideMature: boolean;
  language: string;
}) {
  const [seasons, setSeasons] = useState<Record<number, number>>({});
  const groups = groupEntries(entries);
  const visibleEntries = groups.map(
    (g) =>
      g.find((e) => e.anime_id === seasons[e.anime?.series_id || e.anime_id]) ||
      g[0],
  );
  function seasonSelect(entry: Entry) {
    const group = groups.find((g) =>
      g.some((e) => e.anime_id === entry.anime_id),
    )!;
    if (group.length < 2) return null;
    const key = entry.anime?.series_id || entry.anime_id;
    return (
      <label className="library-season">
        Season / part
        <select
          value={entry.anime_id}
          onChange={(event) =>
            setSeasons({ ...seasons, [key]: Number(event.target.value) })
          }
        >
          {group.map((e) => (
            <option key={e.anime_id} value={e.anime_id}>
              {e.anime ? resolveTitle(e.anime, language) : e.anime_id} ·{" "}
              {labels[e.status]} · {e.progress}/{e.anime?.episodes ?? "?"}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const [view, setView] = useState("shelf");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  async function bulk(status: Entry["status"]) {
    setMessage("Saving selected titles…");
    let saved = 0;
    try {
      for (const e of entries.filter((e) => selected.includes(e.anime_id))) {
        await saveEntry({ ...e, status });
        saved++;
      }
      setMessage(`${saved} titles updated.`);
      setSelected([]);
    } catch {
      setMessage(
        `${saved} titles saved. The remaining updates failed; retry those titles.`,
      );
    }
  }
  return (
    <>
      <div className="view-toolbar">
        <div className="segmented" aria-label="Library representation">
          {["shelf", "list", "board", "genre"].map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <span>
          {groups.length} shows · {entries.length} saved seasons / films
        </span>
      </div>
      {selected.length > 0 && (
        <div className="bulk">
          <label>
            Move {selected.length} selected
            <select
              defaultValue=""
              onChange={(e) => {
                if (
                  e.target.value &&
                  confirm("Update status for the selected titles?")
                )
                  void bulk(e.target.value as Entry["status"]);
              }}
            >
              <option value="">Choose status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {labels[s]}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => setSelected([])}>Clear selection</button>
        </div>
      )}
      <p role="status">{message}</p>
      {view === "shelf" ? (
        <div className="anime-grid">
          {visibleEntries.map((e) => (
            <div key={e.anime_id}>
              {e.anime ? (
                <AnimeCard
                  anime={e.anime}
                  hideMature={hideMature}
                  language={language}
                />
              ) : (
                <p>Unavailable title · {e.anime_id}</p>
              )}
              {seasonSelect(e)}
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={selected.includes(e.anime_id)}
                  onChange={(ev) =>
                    setSelected(
                      ev.target.checked
                        ? [...selected, e.anime_id]
                        : selected.filter((id) => id !== e.anime_id),
                    )
                  }
                />
                {labels[e.status]} · {e.progress}/{e.anime?.episodes ?? "?"}
              </label>
            </div>
          ))}
        </div>
      ) : view === "list" ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Your score</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((e) => (
                <tr key={e.anime_id}>
                  <td>
                    <Link
                      href={
                        e.anime
                          ? animeHref(e.anime, true)
                          : `/app/anime/${e.anime_id}`
                      }
                    >
                      {e.anime
                        ? resolveTitle(e.anime, language)
                        : "Unavailable title"}
                    </Link>
                    {seasonSelect(e)}
                  </td>
                  <td>{labels[e.status]}</td>
                  <td>
                    {e.progress}/{e.anime?.episodes ?? "?"}
                  </td>
                  <td>{e.score ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={view === "board" ? "status-board" : "genre-groups"}>
          {(view === "board"
            ? [...statuses]
            : [...new Set(entries.flatMap((e) => e.anime?.genres || []))]
          ).map((group) => (
            <section key={group}>
              <h2>{labels[group] || group}</h2>
              {visibleEntries
                .filter((e) =>
                  view === "board"
                    ? e.status === group
                    : e.anime?.genres.includes(group),
                )
                .map((e) => (
                  <div key={e.anime_id}>
                    <Link
                      className="board-entry"
                      href={
                        e.anime
                          ? animeHref(e.anime, true)
                          : `/app/anime/${e.anime_id}`
                      }
                      key={e.anime_id}
                    >
                      <strong>
                        {e.anime
                          ? resolveTitle(e.anime, language)
                          : "Unavailable title"}
                      </strong>
                      <span>
                        {e.progress} episodes · {labels[e.status]}
                      </span>
                    </Link>
                    {seasonSelect(e)}
                  </div>
                ))}
            </section>
          ))}
        </div>
      )}
      {view === "genre" && (
        <p className="muted">
          A title can appear in multiple genre groups. It still has one library
          entry.
        </p>
      )}
    </>
  );
}
