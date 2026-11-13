"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./use-reduced-motion";
/** Bounded ink impressions on activated controls; only this leaf's nodes are animated. */
export function InkFeedback() {
  const ref = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    const layer = ref.current;
    if (
      !layer ||
      reduced ||
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData
    )
      return;
    const marks = [...layer.children] as HTMLElement[];
    let index = 0;
    function impress(event: PointerEvent | MouseEvent) {
      if (document.hidden || !(event.target instanceof Element)) return;
      const control = event.target.closest<HTMLElement>(
        "a[href],button:not(:disabled),summary",
      );
      if (
        !control ||
        control.closest(".skip") ||
        (event.type === "pointerdown" &&
          "pointerType" in event &&
          event.pointerType !== "mouse")
      )
        return;
      const keyboard = event.type === "click" && event.detail === 0;
      if (event.type === "click" && !keyboard) return;
      const rect = keyboard ? control.getBoundingClientRect() : null;
      const x = rect ? rect.x + rect.width / 2 : event.clientX,
        y = rect ? rect.y + rect.height / 2 : event.clientY;
      const mark = marks[index++ % marks.length];
      mark.getAnimations().forEach((a) => a.cancel());
      mark.style.left = `${x}px`;
      mark.style.top = `${y}px`;
      mark.animate(
        [
          {
            opacity: 0.36,
            transform: "translate(-50%,-50%) rotate(-12deg) scale(.25)",
          },
          {
            opacity: 0.15,
            offset: 0.35,
            transform: "translate(-50%,-50%) rotate(2deg) scale(.9)",
          },
          {
            opacity: 0,
            transform: "translate(-50%,-50%) rotate(7deg) scale(1.35)",
          },
        ],
        { duration: 620, easing: "cubic-bezier(.16,1,.3,1)" },
      );
    }
    const stop = () =>
      marks.forEach((m) => m.getAnimations().forEach((a) => a.cancel()));
    document.addEventListener("pointerdown", impress, { passive: true });
    document.addEventListener("click", impress);
    document.addEventListener("visibilitychange", stop);
    return () => {
      stop();
      document.removeEventListener("pointerdown", impress);
      document.removeEventListener("click", impress);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [reduced]);
  return (
    <div ref={ref} className="ink-feedback" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <span key={n} />
      ))}
    </div>
  );
}
