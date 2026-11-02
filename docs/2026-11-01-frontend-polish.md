# Frontend polish verification

This release removes lo-fi and its repeating audio scheduler, raises click-sound gain from 0.025 to 0.095, and preserves the effects preference while migrating old audio storage to version 2 without a music field. One icon directly toggles effects. No music recording, oscillator loop or lo-fi control remains.

The sidebar bug came from changing grid columns on a flex container while the workspace retained a fixed 235px margin and width. The shell now uses a real grid and one shared sidebar-width variable. The sidebar, toggle, header and content reflow together. Browser assertions check the 82px collapsed boundary and increased content width at desktop/tablet sizes; phones retain an overlay menu and full-width content when closed.

A geometric two-contour eye and forward-cut aperture replace the sketch ticks and rough duplicate strokes. The favicon matches. All visible Sakuga wordmarks omit the trailing period. Syne, Unbounded and Space Mono replace the old fonts; the old font packages and declarations are removed. Iris violet is the single default accent, with dark/light variants. Existing legacy brand defaults display as Iris, while custom color choices remain available.

Navigation retains clear discovery, library and account destinations. Search is shared with workspace headers and accepts / or Ctrl/Cmd+K without intercepting normal input typing. The first review caught a minimum-width overflow in the phone header; the final grid keeps every control inside the glass shell at 375px.

The homepage shuffles an immutable copy of catalog results, selects up to six distinct non-mature shows and prefers actual artwork. It does not replace provider data or populate the live catalog with fixtures. It auto-advances every 7.5 seconds, pauses for hover/focus, a hidden tab or manual navigation, and provides previous, next, slide and pause/play controls. Reduced motion disables auto-advance and transitions while preserving manual navigation. A fixed phone frame prevents slide titles from moving the page.

Pointer input drives a smoothed refracting lens, artwork-plane tilt, feature lighting and background parallax without React re-renders. Card hover sweeps a reflected highlight over the poster. Opaque surface fallbacks, reduced transparency, coarse-pointer behavior and reduced motion remain supported.

Validation completed:

- 42 Vitest tests passed, including feature selection immutability and custom-theme preservation, plus the existing database, search, privacy and session regressions.
- 55 Playwright checks passed at 375, 390, 768, 1280 and 1440 pixels. Coverage includes sound migration/persistence, carousel navigation and timing, reduced motion, stable frame height, menu visibility, keyboard shortcuts, header bounds, sidebar reflow, dark/light accessibility, session refresh and season-specific progress.
- Lint, TypeScript and the production webpack build passed.
- Visual inspection was bounded to an initial desktop/tablet/mobile review and one confirmation after the collected fixes. No continuing aesthetic iteration followed.

Screenshots in .impeccable/review use test-only Supabase protocol fixtures and existing cover assets. They demonstrate layout, not live metadata completeness or real-account email delivery. No database migrations or catalog changes are part of this release.
