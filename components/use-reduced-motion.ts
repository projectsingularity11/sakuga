"use client";
import { useSyncExternalStore } from "react";
let media: MediaQueryList | undefined;
const query = () => (media ??= matchMedia("(prefers-reduced-motion: reduce)"));
const subscribe = (notify: () => void) => {
  const current = query();
  current.addEventListener("change", notify);
  return () => current.removeEventListener("change", notify);
};
const snapshot = () => query().matches;
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
