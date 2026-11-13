"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "./use-reduced-motion";
const WaterSurface = dynamic(
  () => import("./water-surface").then((m) => m.WaterSurface),
  { ssr: false },
);
/** Static paper paints before the optional cursor-driven material renderer loads. */
export function AmbientBackground() {
  const reduced = useReducedMotion();
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="paper-fibers" />
      {!reduced && <WaterSurface />}
    </div>
  );
}
