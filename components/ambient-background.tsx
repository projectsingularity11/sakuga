"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "./use-reduced-motion";

/** Reflections reuse displayed artwork. No canvas readback, extra image API or idle loop. */
export function AmbientBackground() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const left = useRef<HTMLDivElement>(null),
    right = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pools = [left.current, right.current];
    const images = new Set<HTMLImageElement>();
    const visible = new Set<HTMLImageElement>();
    const selector =
      ".featured-backdrop img,img.featured-backdrop,.cover img,.dossier-cover img";
    let frame = 0,
      disposed = false;
    const sources = ["", ""];
    const paint = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const candidates = [...visible].flatMap((img) => {
        if (!img.isConnected) {
          visible.delete(img);
          images.delete(img);
          observer.unobserve(img);
          return [];
        }
        if (
          !img.complete ||
          !img.naturalWidth ||
          img.closest(".cover-fallback")
        )
          return [];
        const rect = img.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight) return [];
        return [{ img, rect }];
      });
      pools.forEach((pool, index) => {
        if (!pool) return;
        const x = innerWidth * (index ? 0.85 : 0.15),
          y = innerHeight * (index ? 0.7 : 0.25);
        const selected = candidates.reduce<{
          img: HTMLImageElement;
          distance: number;
        } | null>((best, { img, rect }) => {
          const distance = Math.hypot(
            rect.x + rect.width / 2 - x,
            rect.y + rect.height / 2 - y,
          );
          return !best || distance < best.distance ? { img, distance } : best;
        }, null);
        const source = selected?.img.currentSrc || "";
        if (sources[index] === source) return;
        sources[index] = source;
        pool.style.backgroundImage = source
          ? `url(${JSON.stringify(source)})`
          : "none";
        if (!reduced) {
          pool.getAnimations().forEach((animation) => animation.cancel());
          pool.animate([{ opacity: 0.03 }, { opacity: 0.16 }], {
            duration: 450,
            easing: "ease-out",
          });
        }
      });
    };
    const update = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const img = entry.target as HTMLImageElement;
        if (entry.isIntersecting) visible.add(img);
        else visible.delete(img);
      });
      update();
    });
    const scan = (scope: ParentNode) => {
      const nodes = [...scope.querySelectorAll<HTMLImageElement>(selector)];
      if (scope instanceof HTMLImageElement && scope.matches(selector))
        nodes.push(scope);
      nodes.forEach((img) => {
        if (!images.has(img)) {
          images.add(img);
          observer.observe(img);
        }
      });
    };
    const mutation = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (node instanceof Element) scan(node);
      for (const img of images)
        if (!img.isConnected) {
          observer.unobserve(img);
          images.delete(img);
          visible.delete(img);
        }
      update();
    });
    scan(document);
    mutation.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    document.addEventListener("load", update, true);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("load", update, true);
      document.removeEventListener("visibilitychange", update);
      pools.forEach((pool) => {
        pool?.getAnimations().forEach((animation) => animation.cancel());
        pool?.style.removeProperty("background-image");
      });
    };
  }, [pathname, reduced]);
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-halo ambient-halo-left" />
      <div className="ambient-halo ambient-halo-right" />
      <div ref={left} className="ambient-pool ambient-pool-left" />
      <div ref={right} className="ambient-pool ambient-pool-right" />
      <div className="ambient-glass" />
    </div>
  );
}
