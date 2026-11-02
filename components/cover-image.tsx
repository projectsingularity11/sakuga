"use client";
import Image from "next/image";
import { useState } from "react";
export function CoverImage({
  src,
  title,
  priority = false,
}: {
  src: string | null;
  title: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <Image
      src={src}
      alt={`${title} cover`}
      fill
      sizes="(max-width:600px) 44vw,(max-width:1000px) 28vw,16vw"
      priority={priority}
      unoptimized={/^https:\/\/(cdn\.myanimelist\.net|cdn\.anime-planet\.com|cdn\.anisearch\.com)/.test(
        src,
      )}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="cover-fallback">
      <Image
        src="/art/sakuga-city.png"
        alt="Original Sakuga artwork, used because this title’s cover is unavailable"
        priority={priority}
        fill
        sizes="(max-width:600px) 44vw,16vw"
      />
      <div />
      <span>sakuga</span>
      <small>Cover artwork unavailable</small>
    </div>
  );
}
