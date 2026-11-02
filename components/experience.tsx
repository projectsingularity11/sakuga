"use client";
import { useEffect, useRef, useState } from "react";
import { GlassField } from "./glass-field";
import { Volume2, VolumeX } from "lucide-react";
export function Experience() {
  const [enabled, setEnabled] = useState(false);
  const preference = useRef(false),
    engine = useRef<AudioContext | null>(null),
    lens = useRef<HTMLDivElement>(null);
  function audio() {
    const ctx = (engine.current ??= new AudioContext());
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  }
  function tone(
    ctx: AudioContext,
    hz: number,
    delay: number,
    length: number,
    level: number,
  ) {
    const t = ctx.currentTime + delay,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.frequency.setValueAtTime(hz, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(gain).connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(t);
    osc.stop(t + length + 0.01);
  }
  function toggle() {
    const next = !enabled;
    preference.current = next;
    setEnabled(next);
    try {
      localStorage.setItem(
        "sakuga-audio",
        JSON.stringify({ version: 2, effects: next }),
      );
    } catch {}
    if (next) audio();
    else if (engine.current) void engine.current.suspend();
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
      if (
        !preference.current ||
        !(event.target instanceof Element) ||
        !event.target.closest("a,button,summary,select,input[type=checkbox]")
      )
        return;
      const ctx = audio();
      tone(ctx, 680, 0, 0.065, 0.095);
      tone(ctx, 1020, 0.012, 0.05, 0.04);
    };
    let lastHover = 0;
    const hover = (event: PointerEvent) => {
      if (
        !preference.current ||
        event.pointerType !== "mouse" ||
        engine.current?.state !== "running" ||
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
      tone(engine.current, 1160, 0, 0.03, 0.008);
    };
    const change = () => {
      if (preference.current && engine.current?.state === "running") {
        tone(engine.current, 780, 0, 0.06, 0.045);
        tone(engine.current, 520, 0.035, 0.08, 0.03);
      }
    };
    const visibility = () => {
      if (document.hidden && engine.current) void engine.current.suspend();
    };
    document.addEventListener("click", click);
    document.addEventListener("pointerover", hover, { passive: true });
    document.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
      void engine.current?.close();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion:reduce)"),
      fine = matchMedia("(pointer:fine)");
    let frame = 0,
      x = innerWidth * 0.5,
      y = innerHeight * 0.4,
      tx = x,
      ty = y,
      visible = false;
    let gallery: HTMLElement | null = null,
      backdrop: HTMLElement | null = null,
      maxScroll = 1;
    const progress = document.querySelector<HTMLElement>(".scroll-progress");
    const measure = () => {
      maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
    };
    const render = () => {
      frame = 0;
      if (reduce.matches || document.hidden) return;
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (lens.current) {
        lens.current.style.transform = `translate3d(${x}px,${y}px,0)`;
        lens.current.dataset.visible = String(visible);
      }
      if (!gallery?.isConnected)
        gallery = document.querySelector<HTMLElement>(".hero-gallery");
      if (!backdrop?.isConnected)
        backdrop = document.querySelector<HTMLElement>(".featured-backdrop");
      const mx = (x / innerWidth - 0.5) * 2,
        my = (y / innerHeight - 0.5) * 2;
      if (gallery)
        gallery.style.transform = `perspective(1200px) rotateX(${my * -3}deg) rotateY(${mx * 4}deg)`;
      if (backdrop)
        backdrop.style.transform = `translate3d(${mx * -7}px,${Math.min(scrollY * 0.08, 45) + my * -4}px,0) scale(1.04)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.2)
        frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!reduce.matches && !frame && !document.hidden)
        frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== "mouse") return;
      visible = true;
      tx = event.clientX;
      ty = event.clientY;
      if (lens.current)
        lens.current.dataset.active = String(
          event.target instanceof Element &&
            !!event.target.closest("a,button,summary,input,select"),
        );
      schedule();
    };
    const scroll = () => {
      if (progress)
        progress.style.transform = `scaleX(${Math.min(1, scrollY / maxScroll)})`;
      schedule();
    };
    const leave = () => {
      visible = false;
      if (lens.current) lens.current.dataset.visible = "false";
    };
    const stop = () => {
      if (document.hidden || reduce.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        leave();
        if (gallery) gallery.style.transform = "none";
        if (backdrop) backdrop.style.transform = "none";
      } else schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    measure();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", stop);
    reduce.addEventListener("change", stop);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", stop);
      reduce.removeEventListener("change", stop);
    };
  }, []);
  return (
    <>
      <GlassField />
      <div className="scroll-progress" aria-hidden="true" />
      <div className="pointer-lens" ref={lens} aria-hidden="true">
        <span />
      </div>
      <div className="audio-dock">
        <button
          className="audio-toggle icon-control"
          type="button"
          aria-label={enabled ? "Mute click sounds" : "Enable click sounds"}
          aria-pressed={enabled}
          title={enabled ? "Mute click sounds" : "Enable click sounds"}
          onClick={toggle}
        >
          {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </>
  );
}
