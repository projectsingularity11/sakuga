"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
export function FilmRail({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const rail = useRef<HTMLDivElement>(null),
    id = useId();
  const [bounds, setBounds] = useState({ start: true, end: false });
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const update = () => {
      const start = el.scrollLeft <= 2,
        end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      setBounds((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);
  function move(direction: number) {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="film-rail-shell">
      <div className="film-rail-controls">
        <button
          className="icon-control"
          type="button"
          aria-label={`Previous ${label}`}
          aria-controls={id}
          disabled={bounds.start}
          onClick={() => move(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          className="icon-control"
          type="button"
          aria-label={`Next ${label}`}
          aria-controls={id}
          disabled={bounds.end}
          onClick={() => move(1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <div
        className="film-rail"
        id={id}
        ref={rail}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
