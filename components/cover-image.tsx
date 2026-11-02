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
      sizes="(max-width:600px) 44vw,(max-width:1000px) 28vw, 16vw"
      priority={priority}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="cover-placeholder">
      <span>sakuga.</span>
      <small>HD artwork unavailable</small>
    </div>
  );
}
