# Sakuga series, session and experience release

The homepage always rendered a login link, and its route was excluded from Supabase session refresh. The proxy now refreshes public pages too, forwards cookie writes to the response and marks authenticated responses private. A request-scoped viewer supplies the account link, title language and appearance.

Verified AniList PREQUEL/SEQUEL edges now establish show identities across narrative formats, including finale specials and films. The import checked all 20,687 stored IDs, receiving 20,686 available provider records. Music, side stories, alternative versions and title similarity do not establish membership. Existing anime IDs and all library rows remain intact. Search and private-library pagination group before selecting a page. Legacy season links resolve to the show with the season selected. Editors remount by season ID, preventing a new selection from retaining the previous season's draft or save target.

A full-provider pass stored 8,670 chronology edges. The initial grouping snapshot represented 20,216 published releases as 16,114 entries, including 2,002 multi-part series. These counts change with the existing scheduled metadata refresh, which now also maintains chronology. The library row count remained 32; this release never rewrote user progress, notes, scores or collections.

The suspended navigation, integrated search, large cover grids and single feature composition replace overlapping poster stacks and promotional text. Space Grotesk and Manrope are self-hosted. Mouse lighting, background parallax and scroll progress respect reduced motion. Navigation, filters and the workspace sidebar collapse. Explicit light appearance now survives returning to public pages.

The persistent sound dock controls optional click/hover/selection sounds and an original synthesized 72 BPM lo-fi loop independently. Both default off, preferences persist locally, hidden tabs suspend playback, and stopped audio nodes disconnect. Browser autoplay rules still require a permitted user gesture.

Verification:

- 40 Vitest tests passed, including real Postgres-compatible migrations, private library ownership, moderation and verified-source exclusion, series selection and cookie refresh.
- Browser coverage at 375, 390, 768, 1280 and 1440 pixels. The 45-check full run passed 43 checks; the two affected scenarios were then rerun across all five widths and all 10 passed. Coverage includes keyboard/axe checks, dark and light contrast, search races, sound preferences, legacy season redirects, expired-session refresh, grouped library shelves and resetting season-specific editor progress.
- Lint, TypeScript and production webpack build passed.
- Public Supabase REST calls returned HTTP 200 for the full catalog, Attack on Titan, Frieren and the conservative typo “jujutsu kaisne.” The full import exposed two performance issues: correlated graph cleanup exceeded the service timeout, and grouped lookup expressions plus generic search plans caused public timeouts. One-pass graph updates, materialized show keys and a read-only canonical projection with explicit published/verified filters and per-query plans resolved those checks. A final read-only definer projects canonical public fields with explicit publication and verified-source checks, avoiding the trigram RLS planning barrier; it uses custom query plans. Private tables remain governed by RLS; the public projection references no user tables.

Screenshots in .impeccable/review use deterministic protocol fixtures. They are layout evidence, not live catalog or real-account evidence. The browser auth test uses a test-only Supabase protocol server; real email delivery was not exercised for this release.

Source limitations remain: not every release has genuine promotional artwork, a measured HD original, an official English name/story synopsis, an IMDb match or a trailer. Real provider images take priority; absent art has a labeled Sakuga background. Unmatched external actions are explicitly named searches. No universal coverage or invented metadata is claimed.
