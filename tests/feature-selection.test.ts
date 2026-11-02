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
    accent: "#b6a1ff",
    preset: "Iris",
  });
  expect(polishTheme({ accent: "#123456", preset: "Ocean" })).toEqual({
    accent: "#123456",
    preset: "Ocean",
  });
});
