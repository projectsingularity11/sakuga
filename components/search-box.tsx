"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Anime } from "@/lib/domain";
import { resolveTitle, formatLabel, qualifiedCover } from "@/lib/metadata";
import { CoverImage } from "./cover-image";
import { trustedImage } from "@/lib/domain";
import { normalizeSearch } from "@/lib/search";
const cache = new Map<string, { expires: number; items: Anime[] }>();
export function SearchBox({
  initial = "",
  language = "english",
}: {
  initial?: string;
  language?: string;
}) {
  const [value, setValue] = useState(initial),
    [items, setItems] = useState<Anime[]>([]),
    [state, setState] = useState("idle"),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const generation = useRef(0),
    router = useRouter(),
    id = useId();
  useEffect(() => {
    const current = ++generation.current;
    const controller = new AbortController();
    const query = value.trim();
    if (!query) {
      return () => controller.abort();
    }
    const timer = setTimeout(async () => {
      const key = normalizeSearch(query),
        hit = cache.get(key);
      if (hit && hit.expires > Date.now()) {
        setItems(hit.items);
        setState(hit.items.length ? "success" : "empty");
        return;
      }
      try {
        const response = await fetch(
          "/api/search?q=" + encodeURIComponent(query),
          { signal: controller.signal },
        );
        if (!response.ok) throw Error("unavailable");
        const body = await response.json();
        if (current !== generation.current || controller.signal.aborted) return;
        const list = [
          ...new Map((body.titles as Anime[]).map((a) => [a.id, a])).values(),
        ].slice(0, 6);
        if (cache.size >= 50) cache.delete(cache.keys().next().value!);
        cache.set(key, { expires: Date.now() + 60000, items: list });
        setItems(list);
        setState(list.length ? "success" : "empty");
      } catch {
        if (current === generation.current && !controller.signal.aborted)
          setState("error");
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);
  const navigate = (url: string) => {
    setOpen(false);
    router.push(url);
  };
  return (
    <div
      className="search-combo"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <form
        action="/discover"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/discover?q=" + encodeURIComponent(value));
        }}
      >
        <Search size={18} />
        <input
          name="q"
          role="combobox"
          aria-label="Search anime"
          aria-expanded={open && !!value.trim()}
          aria-controls={id}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
          placeholder="Search anime, English or Japanese…"
          autoComplete="off"
          maxLength={100}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            generation.current++;
            setItems([]);
            setActive(-1);
            setState(e.target.value.trim() ? "loading" : "idle");
            setValue(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(items.length - 1, i + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            }
            if (e.key === "Enter" && open && active >= 0 && items[active]) {
              e.preventDefault();
              navigate("/anime/" + items[active].id);
            }
          }}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              generation.current++;
              setValue("");
              setState("idle");
              setActive(-1);
              setItems([]);
              setOpen(false);
            }}
          >
            <X size={16} />
          </button>
        )}
        <button type="submit" aria-label="Submit search">
          <Search size={16} />
        </button>
      </form>
      {open && value.trim() && (
        <div className="search-menu">
          <div role="status">
            {state === "loading"
              ? "Searching…"
              : state === "empty"
                ? "No matches. Try another title."
                : state === "error"
                  ? "Search failed. Press Enter to retry in full results."
                  : null}
          </div>
          <div role="listbox" id={id} aria-label="Anime suggestions">
            {items.map((a, i) => (
              <button
                type="button"
                role="option"
                id={`${id}-${i}`}
                aria-selected={active === i}
                key={a.id}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => navigate("/anime/" + a.id)}
              >
                <span className="suggestion-cover">
                  <CoverImage
                    src={trustedImage(qualifiedCover(a))}
                    title={resolveTitle(a, language)}
                  />
                </span>
                <span>{resolveTitle(a, language)}</span>
                <small>
                  {a.year || "Year unknown"} · {formatLabel(a.format)}
                </small>
              </button>
            ))}
          </div>
          <button
            className="all-results"
            onClick={() => navigate("/discover?q=" + encodeURIComponent(value))}
          >
            See all results for “{value}”
          </button>
        </div>
      )}
    </div>
  );
}
