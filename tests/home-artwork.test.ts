import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { homeArtwork } from "../lib/home-artwork";
it("ships the exact pre-encoded, content-hashed artwork referenced by the homepage", () => {
  expect(Object.keys(homeArtwork).length).toBeGreaterThanOrEqual(10);
  for (const art of Object.values(homeArtwork))
    for (const picture of [art.banner, art.cover]) {
      expect(picture?.width).toBeGreaterThan(0);
      expect(picture?.height).toBeGreaterThan(0);
      expect(new URL(picture!.source).hostname).toMatch(
        /^(s4\.anilist\.co|media\.kitsu\.(app|io))$/,
      );
      for (const path of [
        picture!.webp,
        picture!.avif,
        picture!.smallWebp!,
        picture!.smallAvif!,
      ]) {
        const bytes = readFileSync("public" + path);
        const hash = createHash("sha256")
          .update(bytes)
          .digest("hex")
          .slice(0, 12);
        expect(path).toContain(hash);
        expect(bytes.length).toBeGreaterThan(100);
      }
    }
});
