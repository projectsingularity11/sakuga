"use client";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { artworkFor } from "@/lib/home-artwork";
import { ArtPicture } from "./art-picture";
import { useState } from "react";
export function CoverImage({
  src,
  id,
  title,
  priority = false,
  compact = false,
}: {
  src: string | null;
  id?: number;
  title: string;
  priority?: boolean;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const cached = src && id ? artworkFor(id)?.cover : undefined;
  if (cached && !failed)
    return (
      <ArtPicture
        art={cached}
        className="cached-cover"
        alt={`${title} cover`}
        eager={priority}
        kind="cover"
        onError={() => setFailed(true)}
      />
    );
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
  ) : compact ? (
    <span
      className="cover-unavailable"
      role="img"
      aria-label={`${title} cover unavailable`}
    >
      <ImageOff size={16} />
    </span>
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
