"use client";
import Link from "next/link";
import { resolveTitle } from "@/lib/metadata";
import { useState } from "react";
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
        <span>{entries.length} shown</span>
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
          {entries.map((e) => (
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
              {entries.map((e) => (
                <tr key={e.anime_id}>
                  <td>
                    <Link href={`/app/anime/${e.anime_id}`}>
                      {e.anime
                        ? resolveTitle(e.anime, language)
                        : "Unavailable title"}
                    </Link>
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
              {entries
                .filter((e) =>
                  view === "board"
                    ? e.status === group
                    : e.anime?.genres.includes(group),
                )
                .map((e) => (
                  <Link
                    className="board-entry"
                    href={`/app/anime/${e.anime_id}`}
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
