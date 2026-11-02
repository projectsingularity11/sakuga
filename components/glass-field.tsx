"use client";
import { useEffect, useRef } from "react";
export function GlassField() {
  const canvas = useRef<HTMLCanvasElement>(null),
    field = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion:reduce)"),
      save = (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData;
    let clean: (() => void) | undefined,
      cancelled = false;
    const load = () => {
      if (
        cancelled ||
        reduce.matches ||
        save ||
        !canvas.current ||
        navigator.hardwareConcurrency < 4
      )
        return;
      void import("./glass-renderer")
        .then(({ startGlass }) => {
          if (cancelled || !canvas.current) return;
          clean = startGlass(canvas.current, () => {
            if (field.current) field.current.dataset.renderer = "css";
          });
        })
        .catch(() => {
          if (field.current) field.current.dataset.renderer = "css";
        });
    };
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(load, { timeout: 1800 })
        : window.setTimeout(load, 350);
    return () => {
      cancelled = true;
      clean?.();
      if (typeof window.cancelIdleCallback === "function")
        window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);
  return (
    <div className="glass-field" ref={field} aria-hidden="true">
      <div className="glass-light glass-light-blue" />
      <div className="glass-light glass-light-orange" />
      <div className="glass-ribs" />
      <canvas ref={canvas} />
    </div>
  );
}
