import { describe, it, expect } from "vitest";
import {
  eligible,
  normalize,
  progressValid,
  safeReturn,
  parseImport,
  ruleSchema,
  matches,
  themeTokens,
  trustedImage,
  trustedSource,
  type Entry,
} from "../lib/domain";
const entry = {
  anime_id: 1,
  status: "watching",
  progress: 3,
  score: 8,
  favorite: true,
  priority: 0,
  notes: "private",
  tags: [],
  rewatches: 0,
  started_on: null,
  completed_on: null,
} as const;
describe("ratings", () => {
  it("preserves missing values rather than turning them into zero", () =>
    expect(normalize(null, 100)).toBeNull());
  it("converts original scales transparently", () => {
    expect(normalize(85, 100)).toBe(8.5);
    expect(normalize(8.5, 10)).toBe(8.5);
  });
  it("rejects impossible ratings", () => {
    expect(() => normalize(101, 100)).toThrow();
    expect(() => normalize(1, 0)).toThrow();
  });
});
describe("publication boundary", () => {
  it("excludes pornography even with contradictory flags", () =>
    expect(eligible({ genres: ["Hentai"], adult: false }).state).toBe(
      "excluded",
    ));
  it("quarantines ambiguous adult flags", () => {
    expect(eligible({ genres: [], adult: true }).state).toBe("quarantine");
    expect(eligible({ genres: [], adult: null }).state).toBe("quarantine");
  });
  it("retains mature nonpornographic genres", () =>
    expect(
      eligible({ genres: ["Ecchi", "Drama", "Horror"], adult: false }).state,
    ).toBe("published"));
  it("recognizes explicit classifications", () =>
    expect(
      eligible({ genres: [], adult: false, classification: "Rx" }).state,
    ).toBe("excluded"));
  it("rejects untrusted images and links", () => {
    expect(trustedImage("https://evil.test/a.jpg")).toBeNull();
    expect(trustedImage("javascript:alert(1)")).toBeNull();
    expect(trustedSource("https://anilist.co.evil.test/1")).toBeNull();
    expect(trustedSource("https://anilist.co/anime/1")).toBeTruthy();
  });
});
describe("private library validation", () => {
  it("allows unknown totals without inventing them", () =>
    expect(progressValid(100, null)).toBe(true));
  it("rejects invalid totals and fractional progress", () => {
    expect(progressValid(13, 12)).toBe(false);
    expect(progressValid(-1, null)).toBe(false);
    expect(progressValid(1.2, 12)).toBe(false);
  });
  it("does not allow arbitrary SQL rules", () => {
    expect(ruleSchema.safeParse({ sql: "drop table anime" }).success).toBe(
      false,
    );
    expect(ruleSchema.safeParse({ minScore: 11 }).success).toBe(false);
  });
  it("evaluates conjunctions and excludes unknown episode totals", () => {
    const e = {
      ...entry,
      anime: { episodes: 12, genres: ["Drama"] },
    } as unknown as Entry;
    expect(
      matches(e, {
        status: "watching",
        favorite: true,
        maxEpisodes: 13,
        genre: "Drama",
        minScore: 8,
      }),
    ).toBe(true);
    expect(matches(e, { status: "planned" })).toBe(false);
    expect(matches({ ...e, anime: null }, { maxEpisodes: 13 })).toBe(false);
  });
});
describe("untrusted imports and redirects", () => {
  it("parses only documented exports", () => {
    expect(
      parseImport(JSON.stringify({ version: 1, entries: [entry] })).entries,
    ).toHaveLength(1);
    expect(() => parseImport('{"version":2,"entries":[]}')).toThrow();
    expect(() =>
      parseImport(
        JSON.stringify({ version: 1, entries: [{ ...entry, progress: -1 }] }),
      ),
    ).toThrow();
  });
  it("limits import row and byte counts", () => {
    expect(() => parseImport("x".repeat(2_000_001))).toThrow();
    expect(() =>
      parseImport(
        JSON.stringify({ version: 1, entries: Array(2001).fill(entry) }),
      ),
    ).toThrow();
  });
  it("blocks external and malformed redirects", () => {
    for (const s of [
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "/app\n",
    ])
      expect(safeReturn(s)).toBe("/app");
    expect(safeReturn("/app/library?status=watching")).toBe(
      "/app/library?status=watching",
    );
  });
});
describe("theme derivation", () => {
  it("accepts valid color and bounds intensity", () =>
    expect(themeTokens("#123ABC", 90)).toEqual({
      accent: "#123ABC",
      intensity: 30,
    }));
  it("rejects CSS injection", () =>
    expect(() => themeTokens("red;display:none", 10)).toThrow());
});
