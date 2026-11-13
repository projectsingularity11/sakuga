# Final material polish

The user asked to restore anime borders and vertical alignment, retain the paper cursor, bring back glass navigation, and finish the Japanese calligraphic direction.

- All poster cards now have a fine outer frame, inset mat and bordered artwork. Removed alternating vertical offsets in grids and shelves; equal row heights and reserved caption space keep artwork aligned. Compact card titles use the calligraphic display face at a readable size.
- Public/private headers use a translucent material with 20px backdrop blur, slight saturation, a refracted edge and solid reduced-transparency fallback. Browser testing caught a generated CSS issue where manually specifying the vendor alias discarded the standard blur declaration. Keeping the standard declaration lets the build emit the correct browser rules; Chromium confirms the computed blur/saturation.
- The wordmark gains a small Japanese 作 seal using the existing local calligraphic subset. Active/hover/focus navigation, collection and source links use brush-shaped underline feedback. No decorative copy or new fonts/assets were added.
- A dynamically imported, pointer-transparent ink-feedback leaf adds short impressions when users activate links/buttons/summary controls. Keyboard activation gets the same feedback at the control center. Six marks maximum, native WAAPI, no render loop or per-frame React state. Its own hydrated nodes are animated; no styles are written into streamed links. Reduced motion/data saving skip the effects, hidden tabs cancel them, and listeners/animations are cleaned up.
- The WebGL paper cursor, texture fallbacks, existing fonts, pre-encoded artwork, account/session behavior, season grouping and search/discover routes remain intact. No backend changes or new dependencies.

Desktop/mobile checks verify card/cover border widths, row alignment and equal heights, glass navigation, keyboard ink feedback, reduced-motion teardown, accessibility and responsive layouts. Initial checks caught the glass declaration issue; targeted confirmation follows the fix. Source review confirms the new effect has no idle drawing or scroll loop. This release does not claim an awards outcome or a new production page-load measurement.

Keyboard testing also caught that Chromium emits keyboard clicks as PointerEvents with an empty pointer type. The mouse filter now applies only to pointerdown, allowing keyboard impressions. Final visual review restored four/three/two poster columns at desktop/tablet/phone sizes; older mobile rules had squeezed the framed cards into three columns. These column counts are covered by the layout check.

Validation: 20 unique selected desktop/mobile browser cases passed across the targeted runs, including both appearances, automated accessibility, session refresh, seasons, shelf navigation, pointer effects, ink activation and motion preferences. The final alignment/column-count/feedback cases passed together after the mobile correction. Lint passed; production build and emitted glass declaration are verified before the release push. Desktop/mobile framed-card captures were visually reviewed.

Final production webpack/TypeScript build passed. The emitted CSS contains the standard backdrop-filter blur(20px) declaration.
