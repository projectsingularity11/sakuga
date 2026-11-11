# Kinetic Sakuga verification

Verified November 11, 2026 UTC (November 10 in America/Chicago). This packet covers the implemented motion layer and detail spacing. It distinguishes local fixture evidence from production deployment metadata.

## Completed local checks

- Production build: passed with Next.js 16.4.3 / webpack; TypeScript generation and all 27 static-page outputs completed. Client animation code remains in deferred chunks.
- Type checking and ESLint: passed.
- Vitest: 45 tests across 11 files passed, including the existing database integration tests using PGlite.
- Playwright: final clean run passed all 75 scenarios across 375, 390, 768, 1280 and 1440px widths (4.3 minutes). No hydration-mismatch warnings appeared in the final log.
- Browser coverage includes keyboard and automated accessibility checks in dark/light appearance, search races/errors, expired-session refresh and returning home, season selection/editor persistence, sidebar resizing, source/trailer destinations, audio preference migration, carousel pause/manual/reduced-motion controls, horizontal rails and filters.
- New assertions measure full-width show synopsis geometry at all five sizes; pointer reflection and cover hover; sampled easing after an idle gap; back-to-top; reduced-motion switching; and subsequent navigation without hydration errors.
- Additional Chromium spot checks: native coarse-pointer scrolling with no document overflow; visible homepage content with JavaScript disabled; zero JavaScript RAF requests during a settled 400ms observation. These are local checks, not Core Web Vitals or production frame-rate measurements.

## Bundle evidence

The production build emitted two deferred chunks containing Lenis, Motion mini and the effects runtime:

| Chunk | Raw bytes | Local gzip bytes |
| --- | ---: | ---: |
| `4794.556a43366d20479a.js` | 26,833 | 8,209 |
| `5894.78460475a321bbb8.js` | 3,905 | 1,674 |
| Combined | 30,738 | 9,883 (about 9.7 KiB) |

This is the deferred animation code, not the total application payload or a measured transfer response. The main client entry, CSS, images and fonts are separate. No external animation CDN or continuously running JavaScript frame loop was added. CSS frame lights run only on visible frames and pause in hidden tabs.

## Review and provenance

The implementer's source and bounded visual review is in `kinetic-review.md`. The React review checked effect cleanup, stable primitive dependencies, transient pointer work outside React state, deferred imports, shared reduced-motion subscriptions, semantic controls, decorative aria-hidden markup and preserved server boundaries. No remaining material findings were identified in that scope. Research of 17 public repositories, exact source links, README blob fingerprints and the adapted Magic UI MIT notice are in `docs/research/`.

## Production target and limits

Publishing uses the existing Git-linked main branch for `projectsingularity11/sakuga`, Vercel team `team_zQJh0y9soqRrLxA9F2AChFKO`, project `prj_jigbpVE0uZadIAZoRyhYPViHW2gc`, production domain `sakuga-anime.vercel.app`. The preceding deployed main commit was checked before publication; no alternate project or environment is being introduced.

Deployment state, commit, aliases and runtime-error scan are checked after the source revision is pushed and reported with the deployment result. They do not establish a live browser or real-account end-to-end test. Direct production HTTP/browser access has been restricted by this environment; local fixtures do not prove live catalog completeness, real-account flows or production performance. No backend schema, catalog ingestion or authorization logic changed in this update.
