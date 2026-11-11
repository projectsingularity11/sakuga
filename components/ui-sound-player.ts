// Unmodified CC0 Kenney assets. Provenance: public/audio/kenney/v1/provenance.json.
export type UISound = "click" | "navigate" | "switch";
const files: Record<UISound, string> = {
  click: "click3.wav",
  navigate: "click1.wav",
  switch: "switch7.wav",
};
export class UISoundPlayer {
  private context = new AudioContext();
  private buffers = new Map<UISound, Promise<AudioBuffer>>();
  private voices = new Set<AudioBufferSourceNode>();
  private abort = new AbortController();
  private enabled = true;
  private disposed = false;
  private epoch = 0;
  private last = 0;
  constructor() {
    void this.context.resume().catch(() => {});
  }
  private load(sound: UISound) {
    let buffer = this.buffers.get(sound);
    if (!buffer) {
      buffer = fetch(`/audio/kenney/v1/${files[sound]}`, {
        signal: this.abort.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Sound unavailable");
          return response.arrayBuffer();
        })
        .then((data) => this.context.decodeAudioData(data))
        .catch((error: unknown) => {
          this.buffers.delete(sound);
          throw error;
        });
      this.buffers.set(sound, buffer);
    }
    return buffer;
  }
  prepare() {
    for (const sound of Object.keys(files) as UISound[])
      void this.load(sound).catch(() => {});
  }
  async play(sound: UISound) {
    if (
      !this.enabled ||
      this.disposed ||
      document.hidden ||
      performance.now() - this.last < 65
    )
      return;
    this.last = performance.now();
    const requestedAt = this.last;
    const epoch = this.epoch;
    try {
      if (this.context.state === "suspended") await this.context.resume();
      const buffer = await this.load(sound);
      if (
        !this.enabled ||
        this.disposed ||
        document.hidden ||
        epoch !== this.epoch ||
        performance.now() - requestedAt > 500 ||
        this.context.state !== "running"
      )
        return;
      // Keep rapid clicks bounded; no looping or idle audio work.
      if (this.voices.size >= 3) {
        const oldest = this.voices.values().next().value;
        if (oldest) {
          this.voices.delete(oldest);
          oldest.stop();
        }
      }
      const source = this.context.createBufferSource(),
        gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = sound === "switch" ? 0.45 : 0.6;
      source.connect(gain).connect(this.context.destination);
      this.voices.add(source);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        this.voices.delete(source);
      };
      source.start();
    } catch {
      /* Sound failure never interrupts navigation or saving. */
    }
  }
  mute() {
    this.enabled = false;
    this.epoch++;
    for (const source of this.voices) source.stop();
    this.voices.clear();
    if (!this.disposed) void this.context.suspend().catch(() => {});
  }
  enable() {
    this.enabled = true;
    if (!this.disposed) void this.context.resume().catch(() => {});
  }
  dispose() {
    this.mute();
    this.disposed = true;
    this.abort.abort();
    void this.context.close().catch(() => {});
  }
}
