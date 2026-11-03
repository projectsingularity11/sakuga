"use client";
import { useState, useTransition } from "react";
import { saveEntry, removeEntry } from "@/app/actions";
import { labels, statuses, type Entry } from "@/lib/domain";
export function LibraryEditor({
  id,
  total,
  entry,
}: {
  id: number;
  total: number | null;
  entry?: Entry;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [exists, setExists] = useState(!!entry);
  const [value, setValue] = useState({
    anime_id: id,
    status: entry?.status || "planned",
    progress: entry?.progress || 0,
    score: entry?.score ?? null,
    favorite: entry?.favorite || false,
    priority: entry?.priority || 0,
    notes: entry?.notes || "",
    tags: entry?.tags || [],
    rewatches: entry?.rewatches || 0,
    started_on: entry?.started_on || null,
    completed_on: entry?.completed_on || null,
  });
  function save() {
    start(async () => {
      try {
        await saveEntry(value);
        setExists(true);
        setMessage("Saved to your library.");
      } catch (e) {
        setMessage(
          e instanceof Error ? e.message : "Could not save. Please retry.",
        );
      }
    });
  }
  return (
    <section className="editor" id="list-entry">
      <h2>{exists ? "Your list entry" : "Add to library"}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="stack"
      >
        <div className="form-grid">
          <label>
            Status
            <select
              value={value.status}
              onChange={(e) =>
                setValue({
                  ...value,
                  status: e.target.value as Entry["status"],
                })
              }
            >
              {statuses.map((s) => (
                <option value={s} key={s}>
                  {labels[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Episodes watched {total !== null && `/ ${total}`}
            <div className="stepper">
              <input
                type="number"
                value={value.progress}
                min={0}
                max={total ?? undefined}
                onChange={(e) =>
                  setValue({ ...value, progress: Number(e.target.value) })
                }
              />
              <button
                type="button"
                aria-label="Record next episode"
                disabled={total !== null && value.progress >= total}
                onClick={() =>
                  setValue({ ...value, progress: value.progress + 1 })
                }
              >
                +1
              </button>
            </div>
          </label>
          <label>
            Your score / 10
            <input
              type="number"
              step="0.5"
              min={0}
              max={10}
              value={value.score ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  score: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            Priority
            <select
              value={value.priority}
              onChange={(e) =>
                setValue({ ...value, priority: Number(e.target.value) })
              }
            >
              <option value="0">Whenever</option>
              <option value="1">Interested</option>
              <option value="2">Soon</option>
              <option value="3">Next up</option>
            </select>
          </label>
          <label>
            Started
            <input
              type="date"
              value={value.started_on || ""}
              onChange={(e) =>
                setValue({ ...value, started_on: e.target.value || null })
              }
            />
          </label>
          <label>
            Completed
            <input
              type="date"
              value={value.completed_on || ""}
              onChange={(e) =>
                setValue({ ...value, completed_on: e.target.value || null })
              }
            />
          </label>
          <label>
            Rewatches
            <input
              type="number"
              min={0}
              value={value.rewatches}
              onChange={(e) =>
                setValue({ ...value, rewatches: Number(e.target.value) })
              }
            />
          </label>
        </div>
        {value.status === "completed" &&
          total !== null &&
          value.progress !== total && (
            <button
              type="button"
              className="text-link"
              onClick={() => setValue({ ...value, progress: total })}
            >
              Set progress to all {total} episodes
            </button>
          )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={value.favorite}
            onChange={(e) => setValue({ ...value, favorite: e.target.checked })}
          />{" "}
          A favorite
        </label>
        <label>
          Personal tags, separated by commas
          <input
            value={value.tags.join(", ")}
            onChange={(e) =>
              setValue({
                ...value,
                tags: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label>
          Private notes
          <textarea
            value={value.notes}
            maxLength={10000}
            onChange={(e) => setValue({ ...value, notes: e.target.value })}
          />
        </label>
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : exists ? "Save changes" : "Add to my library"}
        </button>
      </form>
      {exists && (
        <button
          className="danger text-link"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                "Remove this title and its collection memberships? Viewing history remains until account deletion.",
              )
            )
              return;
            start(async () => {
              try {
                await removeEntry(id);
                setExists(false);
                setMessage("Removed from your library.");
              } catch {
                setMessage("Removal failed. Please retry.");
              }
            });
          }}
        >
          Remove from library
        </button>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
