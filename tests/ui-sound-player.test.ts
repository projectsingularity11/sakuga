import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UISoundPlayer } from "../components/ui-sound-player";
class Source {
  active = false;
  buffer: unknown;
  onended: (() => void) | null = null;
  disconnect = vi.fn();
  connect<T>(target: T) {
    return target;
  }
  start() {
    this.active = true;
  }
  stop() {
    this.active = false;
    this.onended?.();
  }
}
const contexts: Context[] = [];
class Context {
  state = "running";
  destination = {};
  sources: Source[] = [];
  decodeAudioData = vi.fn(async () => ({ duration: 0.1 }));
  resume = vi.fn(async () => {
    this.state = "running";
  });
  suspend = vi.fn(async () => {
    this.state = "suspended";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });
  constructor() {
    contexts.push(this);
  }
  createBufferSource() {
    const source = new Source();
    this.sources.push(source);
    return source;
  }
  createGain() {
    return { gain: { value: 0 }, connect: vi.fn(), disconnect: vi.fn() };
  }
}
let now = 1000;
beforeEach(() => {
  contexts.length = 0;
  now = 1000;
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("document", { hidden: false });
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(new ArrayBuffer(8))),
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("sampled interface audio", () => {
  it("does not play a decoding sound after the user mutes", async () => {
    const player = new UISoundPlayer(),
      context = contexts[0];
    let finish!: (value: { duration: number }) => void;
    context.decodeAudioData.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const playback = player.play("click");
    await vi.waitFor(() => expect(context.decodeAudioData).toHaveBeenCalled());
    player.mute();
    finish({ duration: 0.1 });
    await playback;
    expect(context.sources).toHaveLength(0);
    player.dispose();
  });
  it("bounds overlapping sounds and reuses decoded audio", async () => {
    const player = new UISoundPlayer(),
      context = contexts[0];
    for (let index = 0; index < 7; index++) {
      now += 80;
      await player.play("click");
      expect(
        context.sources.filter((source) => source.active).length,
      ).toBeLessThanOrEqual(3);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(context.decodeAudioData).toHaveBeenCalledTimes(1);
    player.mute();
    expect(context.sources.every((source) => !source.active)).toBe(true);
    player.dispose();
    expect(context.close).toHaveBeenCalledOnce();
  });
  it("recovers from an unavailable asset without rejecting playback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Unavailable", { status: 503 }),
    );
    const player = new UISoundPlayer();
    await expect(player.play("navigate")).resolves.toBeUndefined();
    now += 80;
    await player.play("navigate");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(contexts[0].sources.some((source) => source.active)).toBe(true);
    player.dispose();
  });
  it("aborts pending downloads when the player is disposed", async () => {
    vi.mocked(fetch).mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const player = new UISoundPlayer(),
      playback = player.play("switch");
    player.dispose();
    await expect(playback).resolves.toBeUndefined();
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(contexts[0].close).toHaveBeenCalledOnce();
    expect(contexts[0].sources).toHaveLength(0);
  });
});
