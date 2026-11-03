# Sakuga journal verification

Current redesign evidence recorded for 2026-11-02 (America/Chicago). This replaces the retired visual-world verification; older build, deployment and performance results are not current-run evidence.

| Check | Current result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | Passed: 45 unit/database tests |
| Final browser matrix | 68/70 passed initially; two feature bounding-height checks failed at 1280/1440px because transparent grid content stretched |
| Focused geometry/carousel rerun | Passed: 10/10 across all five widths in 22.5s after `align-self: start` corrected the feature height |
| Browser scenario disposition | Every one of the 70 scenarios passed after the focused rerun; no single 70/70 final matrix run is claimed |
| `npm run build` | Passed |
| Production deployment | Pending for this redesign |

Browser coverage includes 375, 390, 768, 1280 and 1440px, light/dark appearance, keyboard access, reduced motion, navigation, search races, filter submissions, source/image fallbacks, carousel behavior, season switching, session refresh, saved progress and preferences across reload, and cancellation of native list-removal confirmation. Authenticated flows use a local Supabase protocol fixture. Fixture titles, profile values, dates and synopsis strings are test data; no live customer data was mutated.

The independent [journal review](journal-review.md) returned **ship**, with no material fixes at its source-and-16-required-capture scope. Required captures include five public viewports, desktop/mobile full pages, small/tablet/desktop library, small/desktop detail and settings, and desktop statistics/collections. That reviewer did not run the browser matrix or a detector. The review recorded the focused rerun as pending; the passing result above is later evidence. Direct craft-floor inspection was performed. No automated detector ran because the Impeccable launcher was absent; no detector result is claimed.

The interface uses the neutral journal ground, self-hosted Space Grotesk 500/700 and Manrope 400/600, typographic frame-corner identity, asymmetric discovery lead, native release rail, upcoming rows and list-first library. Static neutral shading replaces colored haze. No glass, visual pointer loop, ripple, tilt, parallax or background animation appears in the reviewed implementation. The retained opt-in audio pointerover listener supplies hover sound only. Reduced motion removes movement and scaling; manual carousel control remains available.

Existing source-backed artwork, cached AVIF/WebP derivatives, source URLs, attribution and measured dimensions remain. Large fallback artwork is explicitly labeled; tiny missing-cover thumbnails use a labeled unavailable-image icon. This does not establish universal artwork quality, provider permissions or catalog coverage. Selected-season IDs/editor keys, progress/status/score, collection membership, session/auth behavior, stored preference fields and existing integrations retain their contracts. The stored `Midnight` preset remains compatible while the UI labels it Sakuga.

No successful live HTTP, deployed authentication, production persistence, real provider integration or launch catalog-coverage claim is made. Previous connector/proxy restrictions prevented live fetching; those attempts were not rerun for this documentation pass. No current production performance benchmark is claimed.
