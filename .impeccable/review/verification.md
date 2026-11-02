# Prism cinema verification

This review covers the electric-blue/orange theme, vertical optical-glass background, local motion rendering, streamed homepage shelves and cached feature artwork. Five widths were reviewed together: 375, 390, 768, 1280 and 1440 pixels. One collected fix batch corrected shader-test cleanup ordering, image selection dimensions and film-strip boundary states; the confirmation round passed.

- TypeScript and ESLint passed.
- 44 unit/database integration tests passed.
- 66 browser tests passed. Four duplicate shader tests were deliberately skipped; the actual WebGL shader was compiled and rendered once on desktop.
- Browser coverage includes light/dark contrast, keyboard navigation, reduced motion, native film-strip navigation, overflow, artwork failure labels, search races, expired-session refresh when returning home, season switching and sound-preference migration.
- Screenshots use a local Supabase protocol fixture. Fixture titles, release dates and synopsis strings are test data, not production catalog assertions.
- The disabled one-time artwork exporter returned HTTP 410. No runtime dependency on it remains.

Twelve homepage candidates have source-backed, pre-encoded AVIF/WebP artwork in `public/art/home`. The manifest retains source URLs and measured dimensions. Derivatives never enlarge originals. This is selective homepage caching, not a claim that all catalog artwork exists in HD. Font files, the glass texture and the native animation code are self-hosted; browser caches can retain these after the first visit. No offline-installation claim is made.

Three identical local Chromium pointer-motion samples gave median main-thread task time 1.396 seconds before and 0.679 seconds after, and median style recalculation 0.671 seconds before and 0.090 seconds after. The benchmark used the static fallback under detected software rendering, 1440×1000 viewport, 70 pointer moves, and identical timing. These are local interaction measurements, not production field Web Vitals or an all-device speed guarantee.
