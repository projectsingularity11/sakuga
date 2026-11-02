import { expect, it } from "vitest";
import { featuredSelection } from "../lib/feature-selection";
import { polishTheme } from "../lib/appearance";
import type { Anime } from "../lib/domain";
it("chooses distinct illustrated shows without mutating shared catalog data", () => {
  const titles = [
    { id: 1, series_id: 1, cover_url: "a" },
    { id: 2, series_id: 1, cover_url: "b" },
    { id: 3, cover_url: "c" },
    { id: 4, mature: true, cover_url: "d" },
    { id: 5, cover_url: null },
  ] as Anime[];
  const saved = JSON.stringify(titles);
  const a = featuredSelection(titles, () => 0),
    b = featuredSelection(titles, () => 0.999);
  expect(a.map((a) => a.id)).not.toEqual(b.map((a) => a.id));
  expect(a).toHaveLength(2);
  expect(a.every((a) => !a.mature && a.cover_url)).toBe(true);
  expect(JSON.stringify(titles)).toBe(saved);
  expect(featuredSelection([], () => 0)).toEqual([]);
});
it("updates legacy brand defaults without changing custom palette choices", () => {
  expect(polishTheme({ accent: "#fa9877", preset: "Ember" })).toEqual({
    accent: "#72b9ff",
    preset: "Prism",
  });
  expect(polishTheme({ accent: "#123456", preset: "Ocean" })).toEqual({
    accent: "#123456",
    preset: "Ocean",
  });
});

it("projects only the fields needed by the interactive feature", async () => {
  const { projectFeature } = await import("../lib/home-feature");
  const a = {
    id: 16498,
    title: "Attack on Titan",
    title_english: "Attack on Titan",
    title_romaji: null,
    title_native: null,
    format: "TV",
    year: 2013,
    series_count: 9,
    synopsis: "English plot. ".repeat(100),
    cover_url: null,
    banner_url: null,
    genres: ["Action"],
    studios: [],
    episodes: 25,
    synonyms: Array(300).fill(
      "Long source alias used only for indexing and search",
    ),
    ratings: [],
    source_mappings: [],
  } as unknown as Anime;
  const feature = projectFeature(a, "english");
  expect(feature.title).toBe("Attack on Titan");
  expect(feature.parts).toBe("9 seasons / parts");
  expect(feature.synopsis.length).toBeLessThanOrEqual(420);
  expect(feature).not.toHaveProperty("synonyms");
  expect(feature).not.toHaveProperty("ratings");
  expect(feature).not.toHaveProperty("source_mappings");
  expect(JSON.stringify(feature).length).toBeLessThan(
    JSON.stringify(a).length * 0.3,
  );
  expect(feature.art?.banner?.width).toBeGreaterThanOrEqual(1500);
});

it("prefers a small set of genuine wide banners over shallow popular artwork", () => {
  const titles = [16498, 21519, 21507, 101922, 113415, 21, 1535].map((id) => ({
    id,
    cover_url: "https://s4.anilist.co/example.jpg",
  })) as Anime[];
  const selection = featuredSelection(titles, () => 0.5);
  expect(selection.map((a) => a.id).sort((a, b) => a - b)).toEqual([
    16498, 21507, 21519,
  ]);
});
