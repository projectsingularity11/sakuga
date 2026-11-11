# Kinetic Sakuga review

Date: November 10, 2026 (America/Chicago). Scope: current GitHub research, animation runtime, CSS effects, show-detail spacing and responsive fixture screenshots. This is the implementer's review, not an independent audit or a production performance benchmark.

## Change and evidence

- Reviewed 17 public GitHub projects and selected Lenis 1.3.27, Motion 14.12.0 mini and an attributed MIT adaptation of Magic UI border-light geometry. Exact source links, decisions and README blob fingerprints are in `docs/research/`.
- Added fine-pointer wheel easing, once-per-element card/section reveals, artwork/caption transitions, visible frame lights, local pointer reflections, button sheen/press feedback, row/drawer/save entrances, scroll progress and back-to-top. The existing carousel pause/focus/manual behavior and opt-in click sounds stay in place.
- Show titles, synopses and season selection fill the remaining detail column. Desktop uses a responsive poster column, tablet reserves 150px and phones stack. The editor fills its lower-grid column.
- Preserved current Chakra Petch / Zen Kaku Gothic New typography, palette, catalog grouping, search semantics, source/trailer destinations, selected-season editor key, session refresh, collections and saved preferences.

## Source review

The animation chunk is deferred; server-rendered content remains visible before enhancement. A shared IntersectionObserver releases each reveal target after entry. The mutation observer scans added subtrees only. Pointer events coalesce into a single requested frame with no per-frame React state. Route cleanup destroys Lenis, observers, listeners and animation controls. No new data query, authentication boundary or database schema was added.

The Lenis RAF stops at idle and pauses for hidden tabs. A bounded clock delta prevents idle time becoming one large first easing step. Two client-owned visibility observers gate the CSS border lights; they avoid modifying streamed server attributes before React hydrates. Reduced motion destroys the smooth-scroll driver and clears active reveals, while native touch and data-saving fallbacks keep document scrolling. The new regression checks scroll samples after idle and runtime reduced-motion changes.

## Bounded visual review

Reviewed initial desktop/mobile home and show-detail fixture captures, then the confirmation captures after fixes. No font or palette redesign was introduced. The visible controls remain within their navigation grid, headings/actions are distinct from the spectrum surfaces, posters retain stable geometry and mobile editor fields remain reachable. The fixture deliberately contains missing art and short descriptions; its unavailable-art treatment is not evidence of production catalog completeness. Width assertions verify the text-column geometry directly.

Three implementation issues were corrected: decoration attributes racing streamed hydration, the initial scroll step after an idle gap, and separate media-query subscriptions that could leave the deferred layer out of sync. The carousel and effects layer now share one React external-store preference source. An additional test initially expected “Discover” instead of the actual “Discover anime” heading; that assertion was corrected. The final browser run is performed after source edits stop, to avoid accepting development hot-reload behavior as final evidence.

## Local performance and fallback spot checks

A headless Chromium fixture profile recorded zero JavaScript requestAnimationFrame calls over 400ms after settling. After a 700px wheel input, successive sampled scroll positions were 340, 469, 616 and 698px, confirming easing after idle. These timing samples are illustrative and depend on machine load; they are not frame-rate or Core Web Vitals claims. Coarse-pointer emulation retained native scrolling with no horizontal document overflow. With JavaScript disabled, the homepage heading and 21 fixture cards remained present and visible.

## Verification

Final browser/build/deployment results are recorded in `kinetic-verification.md`. Fixture checks do not prove live account flows, live catalog accuracy or production performance. Direct production HTTP access is subject to the environment's network restrictions; Vercel state and aliases must be described separately from browser verification.
