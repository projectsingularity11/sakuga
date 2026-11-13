"use client";
import { useEffect, useRef } from "react";
import { animate } from "motion/mini";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "./use-reduced-motion";
/** One shared cover highlight; Motion mini preserves continuity when its target changes. */
export function PosterFlow() {
  const ref = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion(),
    pathname = usePathname();
  useEffect(() => {
    const frame = ref.current;
    if (
      !frame ||
      reduced ||
      !matchMedia("(pointer:fine)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData
    )
      return;
    frame.style.opacity = "0";
    let owner: Element | null = null,
      scrollFrame = 0,
      timer: ReturnType<typeof setTimeout> | undefined,
      control: ReturnType<typeof animate> | undefined;
    const hide = () => {
      clearTimeout(timer);
      if (!owner) return;
      owner = null;
      control?.stop();
      control = animate(frame, { opacity: 0 }, { duration: 0.24 });
    };
    function follow(event: PointerEvent | FocusEvent) {
      if (
        document.hidden ||
        !(event.target instanceof Element) ||
        ("pointerType" in event && event.pointerType !== "mouse")
      )
        return;
      const next = event.target.closest(".poster-link");
      if (!next) {
        clearTimeout(timer);
        timer = setTimeout(hide, 100);
        return;
      }
      clearTimeout(timer);
      if (next === owner) return;
      const cover = next.querySelector(".cover");
      if (!cover) return;
      const r = cover.getBoundingClientRect(),
        first = !owner && getComputedStyle(frame!).opacity === "0";
      owner = next;
      control?.stop();
      if (first)
        Object.assign(frame!.style, {
          left: `${r.x - 5}px`,
          top: `${r.y - 5}px`,
          width: `${r.width + 10}px`,
          height: `${r.height + 10}px`,
        });
      control = animate(
        frame!,
        {
          left: `${r.x - 5}px`,
          top: `${r.y - 5}px`,
          width: `${r.width + 10}px`,
          height: `${r.height + 10}px`,
          opacity: 1,
        },
        { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
      );
    }
    document.addEventListener("pointermove", follow, { passive: true });
    document.addEventListener("focusin", follow);
    const scroll = () => {
      if (!owner || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const cover = owner?.querySelector(".cover");
        if (!cover) return;
        const r = cover.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) {
          hide();
          return;
        }
        control?.stop();
        control = animate(
          frame,
          {
            left: `${r.x - 5}px`,
            top: `${r.y - 5}px`,
            width: `${r.width + 10}px`,
            height: `${r.height + 10}px`,
            opacity: 1,
          },
          { duration: 0.14, ease: "easeOut" },
        );
      });
    };
    frame.dataset.ready = "true";
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", hide);
    document.addEventListener("visibilitychange", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(scrollFrame);
      frame.removeAttribute("data-ready");
      control?.stop();
      document.removeEventListener("pointermove", follow);
      document.removeEventListener("focusin", follow);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", hide);
      document.removeEventListener("visibilitychange", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, [reduced, pathname]);
  return <div ref={ref} className="poster-flow" aria-hidden="true" />;
}
