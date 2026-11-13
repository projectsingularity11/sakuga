# Open spacing, rounded imagery and fluid transitions

The user clarified that borders belong on anime images rather than complete cards, requested more space throughout the UI/detail pages, rounded boxes, restored artwork-colored backdrops, gliding poster hover feedback and a neutral-black dark mode.

## Changes

- Removed outer card borders, mats, backgrounds and padding while retaining aligned row heights. Covers keep a 1px image border and 16px corners. Catalog gaps, shelf spacing and caption spacing are increased. Controls, form panels, menus, trailer/table surfaces and rating tiles have rounded corners.
- Detail pages have wider cover/text gutters, explicit vertical spacing between content groups, roomier rating/source controls and separate mobile cover/title sections. Descriptions retain the full available horizontal column without a surrounding box.
- Restored more visible blurred cover color behind details (38px static image blur and stronger saturation), a 650ms entrance and the existing scroll-to-paper fade. Missing/hidden artwork stays absent; no unrelated backdrop is substituted.
- Neutral-black surface tokens and a neutral grayscale paper shader/fallback replace the green-gray dark material. Light paper remains intact.
- A single shared cover-only highlight glides between hovered/focused posters. Motion mini stops from the current animated value before moving to the next target. A short leave grace period bridges gaps. Scroll geometry updates use a coalesced event-driven frame only while a cover is active. The leaf animates only its own hydrated DOM, leaving streamed links untouched. Reduced motion/data saving skip it, and cleanup removes controls/listeners/timers.
- Carousel artwork now retains the outgoing layer for a short crossfade while the incoming artwork appears. No route/auth/navigation replacement, extra font, animation CDN or new package was introduced.

## GitHub research

Reviewed current [Motion README](https://github.com/motiondivision/motion/blob/main/packages/motion/README.md) and [native WAAPI implementation](https://github.com/motiondivision/motion/blob/main/packages/motion-dom/src/animation/NativeAnimation.ts), along with [Lenis](https://github.com/darkroomengineering/lenis). Kept the existing Motion mini/Lenis dependencies and their native animation/scroll integration. Current Motion view-transition examples require React 19.3+, so they were not introduced into this React 19.2 application. Vaul's README says it is unmaintained; it was not adopted. An initially guessed animate-mini source path returned 404; the actual animation directory and NativeAnimation implementation were then inspected. No upstream demo is claimed to have been executed or copied wholesale.

## Verification

Desktop/mobile browser coverage checks image-only borders, aligned columns, rounding, animated hover travel, detail gutters/vertical spacing, backdrop loading/fade/cleanup, carousel pause/reduced motion, accessibility and account behavior. Initial backdrop tests still expected the old blur value and were updated to the new contract. The shared hover was verified through smooth scroll movement rather than hiding on every scroll event. Static texture and reduced-motion fallbacks remain available. No field load-time or frame-rate improvement is claimed; the new effects remain bounded and introduce no idle drawing loop.

22 unique selected desktop/mobile cases passed across the targeted runs. The final eight affected cases passed together, including shared hover travel, account-session continuity, smooth scrolling and theme persistence. The restored backdrop checks passed on both sizes after updating the blur contract. Detail screenshots were visually reviewed in both layouts, and the last review removed a legacy synopsis border. Lint passed; production TypeScript/build validation follows before release.

Final production webpack/TypeScript build passed after correcting Motion’s easing-name type. Working tree checked for whitespace errors before release.

Final client-side navigation checks passed on desktop and mobile: clicking the second poster opens the detail route, clears the shared hover frame and retains the restored backdrop and spacing. The highlight leaf resets its animation/listeners on pathname changes so an old poster frame cannot linger over the next page.
