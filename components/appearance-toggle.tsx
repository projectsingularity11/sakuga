"use client";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-appearance"],
  });
  const media = matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", notify);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", notify);
  };
};
const light = () =>
  document.documentElement.dataset.appearance === "light" ||
  (document.documentElement.dataset.appearance === "system" &&
    matchMedia("(prefers-color-scheme: light)").matches);
export function AppearanceToggle() {
  const isLight = useSyncExternalStore(subscribe, light, () => false);
  return (
    <button
      type="button"
      className="appearance-toggle icon-control"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => {
        const mode = isLight ? "dark" : "light";
        document.documentElement.dataset.appearance = mode;
        document.cookie = `sakuga-appearance=${mode}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      }}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
