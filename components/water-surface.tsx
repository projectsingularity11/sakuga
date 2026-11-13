"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./use-reduced-motion";
/** An authored optical wake, not a full fluid solver. Sleeps after the last ripple. */
export function WaterSurface() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const target = canvas.current;
    const fine = matchMedia("(pointer: fine)");
    const save = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    if (!target || reduced || save) return;
    const ctx = target.getContext("2d", { alpha: true });
    if (!ctx) return;
    let frame = 0,
      last = 0,
      w = 0,
      h = 0;
    let ripples: {
      x: number;
      y: number;
      born: number;
      angle: number;
      click: boolean;
    }[] = [];
    const blooms = [...document.querySelectorAll<HTMLElement>(".fluid-bloom")];
    const animations = new Map<HTMLElement, Animation>();
    function resize() {
      w = innerWidth;
      h = innerHeight;
      // Limit fill rate on retina displays and large monitors.
      const scale = Math.min(1.25, devicePixelRatio, 1600 / w);
      target!.width = Math.round(w * scale);
      target!.height = Math.round(h * scale);
      ctx!.setTransform(scale, 0, 0, scale, 0, 0);
    }
    function draw(now: number) {
      frame = 0;
      ctx!.clearRect(0, 0, w, h);
      if (document.hidden) {
        ripples = [];
        return;
      }
      const light =
        getComputedStyle(document.documentElement).colorScheme === "light";
      ripples = ripples.filter((r) => now - r.born < 1000);
      for (const r of ripples) {
        const t = (now - r.born) / 1000,
          radius = 5 + t * (r.click ? 110 : 65);
        ctx!.save();
        ctx!.translate(r.x, r.y);
        ctx!.rotate(r.angle);
        ctx!.globalAlpha = (1 - t) ** 2 * (r.click ? 0.55 : 0.28);
        for (let band = 0; band < 3; band++) {
          ctx!.beginPath();
          ctx!.ellipse(
            0,
            band - 1,
            radius + band * 3,
            (radius + band * 3) * 0.62,
            0,
            0,
            Math.PI * 2,
          );
          ctx!.strokeStyle = light
            ? band === 1
              ? "#9b513b"
              : "#394f65"
            : band === 1
              ? "#ffe3bc"
              : "#91d9ff";
          ctx!.lineWidth = band === 1 ? 1.5 : 0.65;
          ctx!.stroke();
        }
        ctx!.restore();
      }
      if (ripples.length) frame = requestAnimationFrame(draw);
    }
    function move(event: PointerEvent) {
      if (document.hidden || !fine.matches || event.pointerType !== "mouse")
        return;
      const now = performance.now(),
        click = event.type === "pointerdown";
      if (!click && now - last < 45) return;
      last = now;
      ripples.push({
        x: event.clientX,
        y: event.clientY,
        born: now,
        angle: Math.atan2(event.movementY || 1, event.movementX || 1),
        click,
      });
      if (ripples.length > 18) ripples.shift();
      if (!frame) frame = requestAnimationFrame(draw);
      blooms.forEach((el, index) => {
        const from = getComputedStyle(el).transform;
        animations.get(el)?.cancel();
        const x = (event.clientX / w - 0.5) * (index ? -130 : 190),
          y = (event.clientY / h - 0.5) * (index ? 170 : 110);
        const next = `translate(${x}px,${y}px) rotate(${(event.clientX / w - 0.5) * 24}deg)`;
        el.style.transform = next;
        animations.set(
          el,
          el.animate([{ transform: from }, { transform: next }], {
            duration: 1000,
            easing: "cubic-bezier(.16,1,.3,1)",
          }),
        );
        el.style.setProperty(
          "--fluid-hue",
          `${Math.round((event.clientX / w) * 65 - 25)}deg`,
        );
      });
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      ripples = [];
      ctx!.clearRect(0, 0, w, h);
      animations.forEach((a) => a.cancel());
    }
    function visibility() {
      if (document.hidden) stop();
    }
    resize();
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    document.documentElement.addEventListener("pointerleave", stop);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      stop();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", move);
      document.removeEventListener("visibilitychange", visibility);
      document.documentElement.removeEventListener("pointerleave", stop);
      window.removeEventListener("resize", resize);
      blooms.forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("--fluid-hue");
      });
    };
  }, [reduced]);
  return <canvas className="water-surface" ref={canvas} aria-hidden="true" />;
}
