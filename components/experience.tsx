"use client";
import { useEffect, useRef, useState } from "react";
import { AudioLines, Volume2, Music2, X } from "lucide-react";
type Settings = { effects: boolean; music: boolean };
const silent: Settings = { effects: false, music: false };
export function Experience() {
  const [settings, setSettings] = useState<Settings>(silent),
    [open, setOpen] = useState(false);
  const engine = useRef<AudioContext | null>(null),
    prefs = useRef(silent),
    step = useRef(0);
  function audio() {
    const ctx = (engine.current ??= new AudioContext());
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  }
  function tone(
    ctx: AudioContext,
    hz: number,
    time: number,
    length: number,
    volume: number,
    type: OscillatorType = "sine",
  ) {
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(hz, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(time);
    oscillator.stop(time + length + 0.02);
  }
  function update(key: keyof Settings) {
    const next = { ...settings, [key]: !settings[key] };
    prefs.current = next;
    setSettings(next);
    try {
      localStorage.setItem("sakuga-audio", JSON.stringify(next));
    } catch {}
    if (next.effects || next.music) audio();
    else if (engine.current) void engine.current.suspend();
  }
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem("sakuga-audio") || "null");
      if (
        value &&
        typeof value.effects === "boolean" &&
        typeof value.music === "boolean"
      ) {
        prefs.current = value;
        queueMicrotask(() => setSettings(value));
      }
    } catch {}
    const click = (event: MouseEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest("a,button,summary,select,input[type=checkbox]")
      )
        return;
      if (!prefs.current.effects && !prefs.current.music) return;
      const ctx = audio();
      if (prefs.current.effects) {
        tone(ctx, 640, ctx.currentTime, 0.055, 0.025);
        tone(ctx, 960, ctx.currentTime + 0.012, 0.04, 0.01);
      }
    };
    const visibility = () => {
      const ctx = engine.current;
      if (document.hidden && ctx) void ctx.suspend();
      else if (ctx && (prefs.current.music || prefs.current.effects))
        void ctx.resume().catch(() => {});
    };
    let lastHover = 0;
    const hover = (event: PointerEvent) => {
      if (
        !prefs.current.effects ||
        event.pointerType !== "mouse" ||
        !engine.current ||
        engine.current.state !== "running" ||
        !(event.target instanceof Element)
      )
        return;
      const target = event.target.closest("a,button,summary");
      if (
        !target ||
        target.contains(event.relatedTarget as Node) ||
        performance.now() - lastHover < 180
      )
        return;
      lastHover = performance.now();
      tone(engine.current, 1120, engine.current.currentTime, 0.035, 0.003);
    };
    const change = () => {
      const ctx = engine.current;
      if (prefs.current.effects && ctx?.state === "running") {
        tone(ctx, 780, ctx.currentTime, 0.06, 0.018);
        tone(ctx, 520, ctx.currentTime + 0.035, 0.08, 0.012);
      }
    };
    document.addEventListener("pointerover", hover, { passive: true });
    document.addEventListener("change", change);
    document.addEventListener("click", click);
    document.addEventListener("visibilitychange", visibility);
    // Original, quietly synthesized 72 BPM chord progression. No media requests or licensed recordings.
    const timer = setInterval(
      () => {
        const ctx = engine.current;
        if (
          !prefs.current.music ||
          !ctx ||
          ctx.state !== "running" ||
          document.hidden
        )
          return;
        const n = step.current++,
          t = ctx.currentTime + 0.025,
          chords = [
            [130.81, 164.81, 196, 246.94],
            [110, 130.81, 164.81, 196],
            [87.31, 110, 130.81, 164.81],
            [98, 123.47, 146.83, 196],
          ],
          chord = chords[Math.floor(n / 8) % 4];
        if (n % 8 === 0) {
          chord.forEach((hz, i) =>
            tone(ctx, hz, t + i * 0.04, 3.1, 0.009, "triangle"),
          );
          tone(ctx, chord[0] / 2, t, 1.5, 0.035);
        }
        if (n % 2 === 0) tone(ctx, 48, t, 0.15, 0.075);
        if (n % 4 === 2) {
          tone(ctx, 185, t, 0.055, 0.018, "triangle");
          tone(ctx, 310, t + 0.008, 0.07, 0.008);
        }
        tone(ctx, 3520, t, 0.027, 0.0025, "triangle");
        if (n % 4 === 1)
          tone(ctx, chord[(Math.floor(n / 4) + 1) % 4] * 4, t, 0.4, 0.007);
      },
      60000 / 72 / 2,
    );
    return () => {
      clearInterval(timer);
      document.removeEventListener("click", click);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
      void engine.current?.close();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    const root = document.documentElement,
      mq = matchMedia("(prefers-reduced-motion: reduce)"),
      fine = matchMedia("(pointer:fine)");
    let frame = 0,
      x = 50,
      y = 40;
    const render = () => {
      frame = 0;
      root.style.setProperty("--pointer-x", `${x}%`);
      root.style.setProperty("--pointer-y", `${y}%`);
      root.style.setProperty(
        "--page-scroll",
        `${Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight))}`,
      );
      root.style.setProperty(
        "--hero-drift",
        `${Math.min(scrollY * 0.12, 70)}px`,
      );
    };
    const schedule = () => {
      if (!mq.matches && !frame) frame = requestAnimationFrame(render);
    };
    const move = (e: PointerEvent) => {
      if (!fine.matches) return;
      x = (e.clientX / innerWidth) * 100;
      y = (e.clientY / innerHeight) * 100;
      schedule();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", schedule);
    };
  }, []);
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="audio-dock">
        {open && (
          <div className="audio-panel" role="group" aria-label="Sound settings">
            <button
              type="button"
              aria-pressed={settings.effects}
              onClick={() => update("effects")}
            >
              <Volume2 size={17} />
              Click sounds<span>{settings.effects ? "On" : "Off"}</span>
            </button>
            <button
              type="button"
              aria-pressed={settings.music}
              onClick={() => update("music")}
            >
              <Music2 size={17} />
              Lo-fi<span>{settings.music ? "On" : "Off"}</span>
            </button>
          </div>
        )}
        <button
          className="audio-toggle icon-control"
          type="button"
          aria-label={open ? "Close sound settings" : "Sound settings"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <AudioLines size={18} />}
          <span
            className={
              settings.effects || settings.music
                ? "sound-indicator active"
                : "sound-indicator"
            }
          />
        </button>
      </div>
    </>
  );
}
