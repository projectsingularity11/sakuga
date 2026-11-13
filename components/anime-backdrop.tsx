"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { artworkFor } from "@/lib/home-artwork";
import { useReducedMotion } from "./use-reduced-motion";
import { ArtPicture } from "./art-picture";

/** Static blur, compositor-only scroll fade. Never substitutes unrelated artwork. */
export function AnimeBackdrop({ src, id }: { src: string | null; id: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || reduced || !src || failed) return;
    const animation = element.animate(
      [{ filter: "opacity(0)" }, { filter: "opacity(1)" }],
      { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" },
    );
    return () => animation.cancel();
  }, [src, failed, reduced]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const available = document.documentElement.scrollHeight - innerHeight;
      const distance = Math.max(
        1,
        Math.min(available, Math.max(400, Math.min(innerHeight * 0.85, 850))),
      );
      element.style.opacity = String(Math.max(0, 1 - scrollY / distance));
    };
    const update = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [src, failed]);
  if (!src || failed) return null;
  const cached = artworkFor(id)?.cover;
  return (
    <div
      ref={ref}
      className="anime-atmosphere"
      data-anime-id={id}
      aria-hidden="true"
    >
      {cached ? (
        <ArtPicture
          art={cached}
          kind="cover"
          eager
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width:600px) 44vw,(max-width:1000px) 28vw,16vw"
          loading="eager"
          unoptimized={/^https:\/\/(cdn\.myanimelist\.net|cdn\.anime-planet\.com|cdn\.anisearch\.com)/.test(
            src,
          )}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
