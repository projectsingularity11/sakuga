import { it, expect, vi, afterEach } from "vitest";
import { anilistPage, providerFetch, plainSynopsis } from "../lib/providers";
afterEach(() => vi.unstubAllGlobals());
it("uses canonical cross-provider identifier and preserves missing score", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              Page: {
                pageInfo: { hasNextPage: false },
                media: [
                  {
                    id: 1,
                    idMal: 22,
                    title: { english: null, romaji: "A", native: null },
                    synonyms: [],
                    description: null,
                    format: "TV",
                    seasonYear: null,
                    season: null,
                    status: null,
                    episodes: null,
                    duration: null,
                    genres: [],
                    isAdult: false,
                    popularity: 10,
                    averageScore: null,
                    coverImage: { large: null },
                    studios: { nodes: [] },
                  },
                ],
              },
            },
          }),
        ),
      ),
  );
  const data = await anilistPage(1);
  expect(data.media[0].idMal).toBe(22);
  expect(data.media[0].averageScore).toBeNull();
});
it("does not retry authorization failures", async () => {
  const f = vi.fn().mockResolvedValue(new Response("", { status: 403 }));
  vi.stubGlobal("fetch", f);
  await expect(providerFetch("https://graphql.anilist.co")).rejects.toThrow(
    "403",
  );
  expect(f).toHaveBeenCalledTimes(1);
});
it("removes provider markup before rendering it as plain text", () =>
  expect(plainSynopsis("<b>Story</b><script>alert(1)</script>")).not.toContain(
    "<",
  ));
