"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { UISoundPlayer } from "./ui-sound-player";
export function Experience() {
  const [enabled, setEnabled] = useState(false);
  const preference = useRef(false),
    player = useRef<UISoundPlayer | null>(null);
  function soundPlayer() {
    try {
      const current = (player.current ??= new UISoundPlayer());
      current.enable();
      current.prepare();
      return current;
    } catch {
      return null;
    }
  }
  function toggle() {
    const next = !preference.current;
    preference.current = next;
    setEnabled(next);
    try {
      localStorage.setItem(
        "sakuga-audio",
        JSON.stringify({ version: 2, effects: next }),
      );
    } catch {}
    if (next) void soundPlayer()?.play("switch");
    else player.current?.mute();
  }
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("sakuga-audio") || "null");
      if (typeof stored?.effects === "boolean") {
        preference.current = stored.effects;
        queueMicrotask(() => setEnabled(stored.effects));
      }
      if (stored)
        localStorage.setItem(
          "sakuga-audio",
          JSON.stringify({ version: 2, effects: stored.effects === true }),
        );
    } catch {}
    const click = (event: MouseEvent) => {
      if (!preference.current || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("a,button,summary");
      if (
        !target ||
        target.closest("[data-ui-audio]") ||
        target.matches(":disabled,[aria-disabled=true]")
      )
        return;
      const kind = target.matches("a[href]:not([href^='#'])")
        ? "navigate"
        : target.matches("summary,[aria-expanded],[aria-pressed]")
          ? "switch"
          : "click";
      void soundPlayer()?.play(kind);
    };
    const change = (event: Event) => {
      if (
        !preference.current ||
        !(event.target instanceof Element) ||
        !event.target.matches("select,input[type=checkbox],input[type=radio]")
      )
        return;
      void soundPlayer()?.play("switch");
    };
    const visibility = () => {
      if (document.hidden) player.current?.mute();
    };
    document.addEventListener("click", click);
    document.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
      player.current?.dispose();
      player.current = null;
    };
  }, []);
  return (
    <div className="audio-dock">
      <button
        className="audio-toggle icon-control"
        data-ui-audio
        type="button"
        aria-label={enabled ? "Mute click sounds" : "Enable click sounds"}
        aria-pressed={enabled}
        title={enabled ? "Mute click sounds" : "Enable click sounds"}
        onClick={toggle}
      >
        {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  );
}
