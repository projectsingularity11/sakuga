import { it, expect } from "vitest";
import {
  mediaLinks,
  trailerLink,
  englishSynopsis,
  releaseDescription,
} from "../lib/media";
import { qualifiedCover } from "../lib/metadata";
import type { Anime } from "../lib/domain";
const anime = {
  id: 1,
  title: "Fate/stay night",
  year: 2006,
  format: "TV",
  episodes: 24,
  studios: ["Studio DEEN"],
  genres: ["Fantasy"],
  source_mappings: [],
  cover_url: "https://cdn.myanimelist.net/test.jpg",
  cover_width: 460,
  cover_height: 650,
} as unknown as Anime;
it("provides honest encoded searches when external matches are unknown", () => {
  const links = mediaLinks(anime);
  expect(links.imdbVerified).toBe(false);
  expect(new URL(links.imdb).searchParams.get("q")).toBe(
    "Fate/stay night 2006",
  );
  expect(links.malVerified).toBe(false);
  expect(links.trailer).toBeNull();
  expect(
    new URL(links.trailerSearch).searchParams.get("search_query"),
  ).toContain("official trailer");
});
it("uses validated direct sources and trailers without accepting executable links", () => {
  const links = mediaLinks({
    ...anime,
    imdb_id: "tt0409591",
    source_mappings: [
      {
        provider: "mal",
        url: "https://myanimelist.net/anime/356",
        verified: true,
      },
    ],
    trailer_url: "https://www.youtube.com/watch?v=abcdefghijk",
  });
  expect(links.imdbVerified).toBe(true);
  expect(links.malVerified).toBe(true);
  expect(links.trailer).not.toBeNull();
  expect(trailerLink("javascript:alert(1)")).toBeNull();
  expect(
    trailerLink("https://www.youtube.com.evil.test/watch?v=abcdefghijk"),
  ).toBeNull();
});
it("keeps smaller real originals and distinguishes release facts from missing story text", () => {
  expect(qualifiedCover(anime)).toBe(anime.cover_url);
  expect(
    englishSynopsis({ ...anime, synopsis: "日本語のあらすじです。" }),
  ).toBeNull();
  expect(
    englishSynopsis({ ...anime, synopsis: "A story about a journey." }),
  ).toBe("A story about a journey.");
  expect(releaseDescription(anime)).toContain("24 episodes");
  expect(releaseDescription(anime)).toContain("Studio DEEN");
});
