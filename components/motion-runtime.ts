import Lenis from "lenis";
import { animate } from "motion/mini";
/** Native animation controls + a demand-driven Lenis loop. No per-frame React state. */
export function startMotion(
  progress: HTMLElement,
  top: HTMLButtonElement,
  reducedMotion: boolean,
) {
  const root = document.documentElement;
  const fine = matchMedia("(pointer: fine)");
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  let lenis: Lenis | undefined,
    frame = 0,
    awake = 0,
    destroyed = false,
    clock = 0,
    previousFrame = 0;
  let pointerFrame = 0,
    pointer: { element: HTMLElement; x: number; y: number } | undefined;
  let tilted: HTMLElement | undefined;
  function resetTilt() {
    tilted?.style.removeProperty("--tilt-x");
    tilted?.style.removeProperty("--tilt-y");
    tilted = undefined;
    pointer = undefined;
  }
  const active = new Map<HTMLElement, ReturnType<typeof animate>>();
  const watched = new WeakSet<Element>();
  const revealSelector =
    ".journal-intro,.catalog-section,.shelf-heading,.anime-card,.anime-row,.dossier>div:last-child,.page-heading,.editor";
  function finishAnimations() {
    active.forEach((control, element) => {
      control.stop();
      element.style.removeProperty("transform");
      element.style.removeProperty("opacity");
    });
    active.clear();
  }
  function render(now: number) {
    frame = 0;
    if (destroyed || document.hidden || reducedMotion) return;
    // An idle gap must not become a huge easing step on the first wheel frame.
    clock += previousFrame ? Math.min(now - previousFrame, 64) : 16;
    previousFrame = now;
    lenis?.raf(clock);
    if (lenis && (lenis.isScrolling || now < awake))
      frame = requestAnimationFrame(render);
  }
  function wake() {
    awake = performance.now() + 1000;
    if (!frame && lenis && !document.hidden && !reducedMotion) {
      previousFrame = 0;
      frame = requestAnimationFrame(render);
    }
  }
  function updateProgress() {
    const maximum = Math.max(1, root.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, scrollY / maximum)})`;
    top.hidden = scrollY < 550;
    wake();
  }
  function configure() {
    cancelAnimationFrame(frame);
    frame = 0;
    lenis?.destroy();
    lenis = undefined;
    const disabled = reducedMotion || saveData;
    root.dataset.motion = disabled ? "reduced" : "full";
    root.dataset.smoothScroll = "native";
    if (disabled) finishAnimations();
    if (!disabled && fine.matches) {
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.115,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: -100 },
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: (node) =>
          node.matches(
            "textarea,select,.search-menu,.sidebar,[data-lenis-prevent]",
          ),
      });
      root.dataset.smoothScroll = "lenis";
    }
    updateProgress();
  }
  const observer = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (!entry.isIntersecting) continue;
        observer.unobserve(element);
        if (reducedMotion || saveData) continue;
        const card = element.matches(".anime-card,.anime-row");
        const row = element.matches(".anime-row");
        const control = animate(
          element,
          {
            opacity: [row ? 0.65 : 0.96, 1],
            transform: [
              `translateY(${row ? 14 : card ? 22 : 16}px)`,
              "translateY(0px)",
            ],
          },
          {
            duration: row ? 0.68 : card ? 0.46 : 0.52,
            delay: Math.min(order++ * (row ? 0.04 : 0.024), 0.16),
            ease: [0.16, 1, 0.3, 1],
          },
        );
        active.set(element, control);
        void control.then(() => {
          if (active.get(element) === control) {
            active.delete(element);
            element.style.removeProperty("transform");
            element.style.removeProperty("opacity");
          }
        });
      }
    },
    { threshold: 0.06 },
  );
  function watch(element: Element) {
    if (watched.has(element)) return;
    watched.add(element);
    observer.observe(element);
  }
  function scan(scope: ParentNode = document) {
    if (scope instanceof Element && scope.matches(revealSelector)) watch(scope);
    scope.querySelectorAll(revealSelector).forEach(watch);
  }
  // Child-list only: animated style updates cannot trigger a rescan loop.
  const mutation = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes)
        if (node instanceof Element) scan(node);
  });
  mutation.observe(document.body, { childList: true, subtree: true });
  function pointerMove(event: PointerEvent) {
    if (
      reducedMotion ||
      saveData ||
      event.pointerType !== "mouse" ||
      !(event.target instanceof Element)
    )
      return;
    const element = event.target.closest<HTMLElement>(
      ".poster-link[data-pointer-ready]",
    );
    if (!element) {
      resetTilt();
      pointer = undefined;
      return;
    }
    if (tilted && tilted !== element) resetTilt();
    pointer = { element, x: event.clientX, y: event.clientY };
    if (!pointerFrame)
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!pointer?.element.isConnected) return;
        const rect = pointer.element.getBoundingClientRect();
        pointer.element.style.setProperty(
          "--shine-x",
          `${pointer.x - rect.left}px`,
        );
        pointer.element.style.setProperty(
          "--shine-y",
          `${pointer.y - rect.top}px`,
        );
        if (pointer.element.matches(".poster-link")) {
          tilted = pointer.element;
          const x = Math.max(
            -1,
            Math.min(1, ((pointer.x - rect.left) / rect.width) * 2 - 1),
          );
          const y = Math.max(
            -1,
            Math.min(1, ((pointer.y - rect.top) / rect.height) * 2 - 1),
          );
          tilted.style.setProperty("--tilt-x", `${-y * 4}deg`);
          tilted.style.setProperty("--tilt-y", `${x * 4.5}deg`);
        }
      });
  }
  function focus(event: FocusEvent) {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>(revealSelector);
    const control = element && active.get(element);
    if (control && element) {
      control.stop();
      active.delete(element);
      element.style.removeProperty("transform");
      element.style.removeProperty("opacity");
    }
  }
  function visibility() {
    root.dataset.motionPaused = String(document.hidden);
    if (document.hidden) {
      resetTilt();
      cancelAnimationFrame(frame);
      frame = 0;
      lenis?.stop();
      finishAnimations();
    } else {
      lenis?.start();
      updateProgress();
    }
  }
  function scrollTop() {
    lenis?.scrollTo(0, { duration: 0.85 });
    wake();
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("wheel", wake, { passive: true });
  window.addEventListener("keydown", wake);
  document.addEventListener("click", wake);
  document.addEventListener("pointermove", pointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetTilt);
  document.addEventListener("focusin", focus);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("sakuga:scroll-top", scrollTop);
  fine.addEventListener("change", configure);
  configure();
  scan();
  visibility();
  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(pointerFrame);
    resetTilt();
    mutation.disconnect();
    observer.disconnect();
    finishAnimations();
    lenis?.destroy();
    window.removeEventListener("scroll", updateProgress);
    window.removeEventListener("wheel", wake);
    window.removeEventListener("keydown", wake);
    document.removeEventListener("click", wake);
    document.removeEventListener("pointermove", pointerMove);
    document.documentElement.removeEventListener("pointerleave", resetTilt);
    document.removeEventListener("focusin", focus);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("sakuga:scroll-top", scrollTop);
    fine.removeEventListener("change", configure);
    delete root.dataset.motion;
    delete root.dataset.smoothScroll;
    delete root.dataset.motionPaused;
  };
}
