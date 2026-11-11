"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { useReducedMotion } from "./use-reduced-motion";
export function MotionExperience() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const progress = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const idle = window.setTimeout(() => {
      void import("./motion-runtime")
        .then(({ startMotion }) => {
          if (!cancelled && progress.current && top.current)
            dispose = startMotion(progress.current, top.current, reducedMotion);
        })
        .catch(() => {
          if (!cancelled) document.documentElement.dataset.motion = "reduced";
        });
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(idle);
      dispose?.();
    };
  }, [pathname, reducedMotion]);
  return (
    <>
      <div ref={progress} className="reading-progress" aria-hidden="true" />
      <button
        ref={top}
        hidden
        type="button"
        className="back-to-top icon-control"
        aria-label="Back to top"
        onClick={() => {
          if (document.documentElement.dataset.smoothScroll === "lenis")
            window.dispatchEvent(new Event("sakuga:scroll-top"));
          else
            window.scrollTo({
              top: 0,
              behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
                ? "instant"
                : "smooth",
            });
        }}
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
}
