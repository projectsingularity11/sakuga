# Paper-scroll frontend rebuild

The user requested a complete visual-first redesign around the TORII reference. The full-size Dribbble image was inaccessible through browsing and direct image retrieval (403). TORII's published description, palette and available reference listing were inspected in the preceding pass; this release does not claim pixel-for-pixel equivalence. The user was informed of that limitation while implementation continued.

## New composition

Replaced the intro panel and side-by-side hero/catalog with an oversized calligraphic masthead, vertical Japanese Sakuga lettering, a large ink-wash anime scene, open feature captions and a full-width collection index. The collection follows as staggered poster artwork and editorial shelves. Existing carousel controls, actual title metadata, library links, genre navigation and source/trailer routes remain functional. Fonts throughout use Japanese-designed Yuji Mai and Shippori Mincho instead of the technical sans pairing. Fresh anonymous visits start in paper mode; saved account modes and the local appearance switch still take precedence.

## Material and cursor interaction

Replaced the procedural paper-noise look with licensed raster rice-paper and black-paper textures from [Subtle Patterns](https://github.com/atlemo/SubtlePatterns/tree/gh-pages), CC BY-SA 3.0. Local 1024px WebP conversions total 81,428 bytes; only the active mode is required. Texture derivatives retain that license, with a public attribution/license notice and footer link. These are raster texture assets, not a claim to have physically scanned paper in this session. Wikimedia public-domain paper photography was researched, but its download was blocked and was not shipped.

The previous decorative Canvas2D cursor rings were replaced with an authored WebGL paper-displacement shader. Pointer movement and clicks bend the sampled fiber texture with radial waves and lighting; page text is not distorted. Eight impulses maximum, a 2.2-second lifetime, sampled pointer input, capped render resolution and no idle RAF. Renderer code is dynamically loaded. Reduced motion, data saving, coarse pointers, unavailable WebGL and context loss use the static textured paper fallback. GPU resources, listeners, animation frames and pending image handlers are cleaned up. A generation counter prevents a slow texture load from overwriting a later theme selection.

The scene's ink edge uses a small authored static SVG displacement mask. No animation engine was added. The Japanese masthead characters use local subsets of Yuji Mai totaling 3,288 bytes; Latin text loads the self-hosted Latin subset only. Font licenses are provided under `/licenses/`. The old background's artwork intersection/mutation observers and scroll listener have been removed entirely.

## Validation and practical limits

Local Chromium 1440×1000 confirmed a linked WebGL renderer and 89 nonzero displacement-uniform updates during the pointer test. In that sample, 91 draw submissions had median 0.1ms, p95 0.2ms and max 0.5ms CPU callback time; there were zero additional draws during the final 500ms idle window. These timings exclude GPU execution/compositing and are not an FPS, CWV or production page-load claim. Static paper remains available independently of the shader.

The previous database query performance fix and cached local AVIF/WebP anime images remain. No backend/schema work was performed in this frontend release. Full-size reference verification remains limited by the blocked Dribbble asset.

Browser testing also exposed pointer style mutations before streamed Next links hydrated. PosterLink now enables pointer-driven styles only after its hydration effect; the pointer runtime no longer modifies arbitrary client buttons. Static CSS hover still works immediately. Mobile captions reserve two title lines so slide changes do not shift the carousel controls. Mobile hero imagery uses the cached cover source to keep characters in frame.

45 unit/database tests passed. The full desktop/mobile suite initially passed 34 of 36 cases; the two carousel checks exposed a duplicated accessible region name. After correcting that name, targeted follow-ups verified all 36 unique cases across runs, including fixes for mobile title-height stability and hydration-safe pointer input. The final affected eight desktop/mobile cases passed together. Additional Chromium checks passed for fresh-visit paper mode, no horizontal overflow at 1440/390px, missing WebGL and context-loss fallback. The default paper and dark viewport captures were visually reviewed. Lint and TypeScript checks passed before the production build.

The production webpack build, including TypeScript validation, passed.
