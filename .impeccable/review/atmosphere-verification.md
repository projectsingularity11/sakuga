# Sakuga atmosphere verification

November 10, 2026, America/Chicago. Scope: the brighter spectrum, selected-anime blur/fade, replacement sampled audio and associated control details.

## Local results

- Final Playwright confirmation: **90 passed** across 375, 390, 768, 1280 and 1440px widths, in 5.3 minutes. No hydration-mismatch warnings were present. This is fixture-backed Chromium coverage, not a live-account test.
- The matrix covers existing auth/session refresh, search, source/trailer links, season edits, sidebar layout, library persistence, carousel pause/reduced motion, filters and horizontal rails. New cases verify actual source images, scroll fade endpoints and restoration, removal on navigation, missing-art behavior, real AudioBuffer playback, no oscillator playback, no downloads before opting in, mute and failed audio requests.
- A batched artwork-detail accessibility check at 375/1440px returned no WCAG A/AA violations in dark or light appearance. Visual inspection covered initial and confirmation desktop/mobile home and artwork detail captures. Source-art variation means this is not a universal contrast certification for every title.
- Final Vitest run: **49 passed** in 12 files, including database integration checks, audio cancellation/overlap/retry/disposal and static/public/protected route matching. The public-audio matcher adjustment followed the visual confirmation; these matcher/session tests were rerun afterward.
- Type checking, ESLint and the Next.js 16.4.3 production build passed. No package dependency was added.
- The audio asset HEAD check returned HTTP 200, `Content-Type: audio/wav` and `Cache-Control: public, max-age=31536000, immutable`.

## Performance and provenance

The background gradient and 18px image blur are static. Scroll changes only artwork opacity, using a passive listener and one coalesced requested frame; listeners and frames are disposed on route/season changes. The fade reaches zero even when the page is shorter than a viewport of scrolling. Existing Lenis/Motion behavior and reduced-motion support remain intact; reduced transparency hides the artwork backdrop.

The three unmodified WAV files total **71,658 bytes**, load only after enabling/interacting with enabled audio, and use the existing mute preference. They are CC0 Kenney samples, pinned to upstream commit `8c3d81b9159d058c444f89d12d518276b0b09345`; license, original filenames and SHA-256 fingerprints are in `public/audio/kenney/v1/`. The earlier synthesized click/hover tones and all hover audio were removed. No external sound CDN, generated music or extra animation runtime was introduced.

The implementation review is in `atmosphere-review.md`; sound research is in `docs/research/interface-audio.md`. Existing saved fixture art-unavailable states and short descriptions are intentional test data, not production catalog evidence.

## Production publication

The checked baseline main commit was `d9006ba9ee07487848c681cd9bf2ae0979103d41`, READY on the existing Vercel production project. Publication continues through `projectsingularity11/sakuga` main, team `team_zQJh0y9soqRrLxA9F2AChFKO`, project `prj_jigbpVE0uZadIAZoRyhYPViHW2gc`, canonical domain `sakuga-anime.vercel.app`.

The newly published commit, Vercel build status, canonical aliases and post-deploy runtime-error scan are checked after push and reported with the deployment result. Direct live access is checked separately; local fixtures and deployment metadata do not establish production performance or real-account end-to-end success. No database schema or catalog ingestion changed.
