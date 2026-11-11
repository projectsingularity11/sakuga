"use client";
import { useEffect, useRef, useState } from "react";
/** CSS adaptation of Magic UI's MIT border-beam pattern; see docs/research/motion.md. */
export function BorderBeam() {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      className="border-beam"
      data-visible={visible}
      aria-hidden="true"
    >
      <span />
    </span>
  );
}
