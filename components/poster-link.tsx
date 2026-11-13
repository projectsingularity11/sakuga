"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
/** Pointer styles are allowed only after this Link has hydrated. */
export function PosterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (node) node.dataset.pointerReady = "true";
    return () => {
      node?.removeAttribute("data-pointer-ready");
    };
  }, []);
  return (
    <Link ref={ref} href={href} className="poster-link">
      {children}
    </Link>
  );
}
