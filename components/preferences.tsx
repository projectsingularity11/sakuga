"use client";
import { useState, useTransition, useEffect } from "react";
import { savePreferences, importLibrary, previewImport } from "@/app/actions";
import { polishTheme } from "@/lib/appearance";
import { presets, themeSchema, parseImport } from "@/lib/domain";
export function ThemeApply({ theme }: { theme: unknown }) {
  useEffect(() => {
    const p = themeSchema.safeParse(theme);
    if (!p.success) return;
    const t = polishTheme(p.data);
    const dark =
      t.mode === "dark" ||
      (t.mode === "system" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.appearance = dark ? "dark" : "light";
    if (t.preset === "Prism")
      document.documentElement.style.removeProperty("--accent");
    else document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--ambient", `${t.intensity}%`);
  }, [theme]);
  return null;
}
export function Preferences({
  name,
  preferences,
}: {
  name: string;
  preferences: Record<string, unknown>;
}) {
  const initial = themeSchema.safeParse(preferences.theme);
  const [theme, setTheme] = useState(
    initial.success
      ? polishTheme(initial.data)
      : {
          preset: "Prism" as const,
          mode: "dark" as "light" | "dark" | "system",
          intensity: 8,
          accent: presets.Prism,
        },
  );
  const [display_name, setName] = useState(name);
  const [language, setLanguage] = useState(
    (preferences.language as "english" | "romaji" | "native") || "english",
  );
  const [hide_mature, setHide] = useState(!!preferences.hide_mature);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <>
      <ThemeApply theme={theme} />
      <form
        className="stack editor"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              await savePreferences({
                theme,
                display_name,
                language,
                hide_mature,
              });
              setMessage("Preferences saved.");
            } catch {
              setMessage("Could not save preferences. Please retry.");
            }
          });
        }}
      >
        <h2>Your profile</h2>
        <label>
          Display name
          <input
            value={display_name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </label>
        <label>
          Preferred title language
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
          >
            <option value="english">English</option>
            <option value="romaji">Romaji</option>
            <option value="native">Native</option>
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={hide_mature}
            onChange={(e) => setHide(e.target.checked)}
          />
          Hide artwork on mature titles
        </label>
        <h2>Appearance</h2>
        <div className="swatches">
          {Object.entries(presets).map(([name, color]) => (
            <button
              type="button"
              aria-pressed={theme.preset === name}
              onClick={() =>
                setTheme({
                  ...theme,
                  preset: name as typeof theme.preset,
                  accent: color,
                })
              }
              key={name}
            >
              <i style={{ background: color }} />
              {name}
              {theme.preset === name ? " ✓" : ""}
            </button>
          ))}
        </div>
        <div className="form-grid">
          <label>
            Appearance
            <select
              value={theme.mode}
              onChange={(e) =>
                setTheme({
                  ...theme,
                  mode: e.target.value as typeof theme.mode,
                })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
          <label>
            Accent color
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
            />
          </label>
        </div>
        <label>
          Ambient tint
          <input
            type="range"
            min="0"
            max="30"
            value={theme.intensity}
            onChange={(e) =>
              setTheme({ ...theme, intensity: Number(e.target.value) })
            }
          />
        </label>
        <div className="theme-preview">
          <h3>A little room for your favorites.</h3>
          <p>Your content stays readable. Your color sets the mood.</p>
          <span className="tag">Watching</span>
          <progress value={6} max={12} />
        </div>
        <button
          type="button"
          className="text-link"
          onClick={() =>
            setTheme({ ...theme, accent: presets[theme.preset], intensity: 8 })
          }
        >
          Reset this palette
        </button>
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : "Save my preferences"}
        </button>
        <p role="status">{message}</p>
      </form>
    </>
  );
}
export function Importer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [merge, setMerge] = useState<"skip" | "replace">("skip");
  const [pending, start] = useTransition();
  const [valid, setValid] = useState(false);
  return (
    <section className="editor">
      <h2>Bring your stories home.</h2>
      <p>
        Import a Sakuga v1 JSON export. Maximum 2 MB and 2,000 rows. Only
        published catalog IDs can be imported; duplicates use the last row.
      </p>
      <label>
        Choose JSON file
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            setValid(false);
            setSummary("");
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 2_000_000) {
              setSummary("This file exceeds 2 MB.");
              return;
            }
            try {
              const value = await file.text();
              parseImport(value);
              const p = await previewImport(value);
              setText(value);
              setValid(true);
              setSummary(
                `${p.rows} rows: ${p.matched} matched catalog IDs, ${p.unmatched.length} unmatched (${p.unmatched.slice(0, 20).join(", ") || "none"}), ${p.existing} already in your library, ${p.invalidProgress.length} invalid progress totals. Unmatched and invalid entries will be skipped.`,
              );
            } catch {
              setSummary(
                "This file is not a valid Sakuga v1 export. No changes were made.",
              );
            }
          }}
        />
      </label>
      <label>
        Existing titles
        <select
          value={merge}
          onChange={(e) => setMerge(e.target.value as typeof merge)}
        >
          <option value="skip">Keep my existing entries</option>
          <option value="replace">Replace matching entries</option>
        </select>
      </label>
      <button
        className="button outline"
        disabled={!valid || pending}
        onClick={() => {
          if (
            !confirm("Import these entries using the selected merge behavior?")
          )
            return;
          start(async () => {
            try {
              const r = await importLibrary(text, merge);
              setSummary(
                `${r.imported} imported. ${r.skipped} skipped (duplicate, existing, unmatched, or invalid progress).`,
              );
              setValid(false);
            } catch {
              setSummary("Import failed. Please retry or check the file.");
            }
          });
        }}
      >
        {pending ? "Importing…" : "Confirm import"}
      </button>
      <p role="status">{summary}</p>
    </section>
  );
}
