---
name: Sakuga journal
description: A colorful spectrum anime journal with Japanese editorial and technical character.
colors:
  bg: "#131316"
  surface: "#1b1b20"
  surface-raised: "#24242b"
  surface-hover: "#252528"
  border: "#2e2e33"
  border-strong: "#424249"
  primary: "#ff8fb8"
  primary-hover: "#ffa8c8"
  on-primary: "#0b0b0d"
  secondary: "#d0b9ff"
  spectrum-cool: "#91d9ff"
  spectrum-violet: "#b5a2ff"
  text: "#f5f5f7"
  text-muted: "#c4bfd1"
  watching: "#7dcfff"
  completed: "#7ee0b8"
  planned: "#b9a3ff"
  on-hold: "#f3ca7a"
  dropped: "#ff929b"
  rating: "#f3ca7a"
  danger: "#ff929b"
  light-bg: "#f6f6f7"
  light-surface: "#ffffff"
  light-surface-raised: "#ededf0"
  light-surface-hover: "#e4e4e8"
  light-border: "#d0d0d5"
  light-border-strong: "#a3a3ad"
  light-text: "#202024"
  light-text-muted: "#626269"
  light-secondary: "#6744b2"
  light-watching: "#185c8a"
  light-completed: "#176545"
  light-planned: "#6744b2"
  light-on-hold: "#805b12"
  light-dropped: "#a52742"
  light-rating: "#805b12"
  light-danger: "#a52742"
typography:
  wordmark:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: 'Chakra Petch, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(1.8rem, 3.3vw, 2.6rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontFamily: 'Chakra Petch, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.35rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  card-title:
    fontFamily: 'Zen Kaku Gothic New, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: 'Zen Kaku Gothic New, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Zen Kaku Gothic New, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
  metadata:
    fontSize: "0.8125rem"
rounded:
  tag: "3px"
  thumbnail: "5px"
  control: "8px"
  genre: "6px"
  feature: "14px"
  poster: "10px"
  panel: "12px"
  dialog: "16px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
  space-8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  navigation-active:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  poster:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.poster}"
---

# Design System: Sakuga journal

## Overview

**Creative North Star: "The spectrum anime journal"**

Sakuga is a practical, independently voiced space for discovering anime and keeping a personal list. A broad black-and-charcoal canvas, Japanese editorial body typography and angular technical headings support real anime artwork. Full pink, violet and cool-blue gradients coordinate the introduction, feature, browsing sections, navigation and workspace forms. A still gradient atmosphere, selective translucency and kinetic artwork, border lights and interaction feedback give the product a vivid identity while solid text and readable controls keep it useful. The typographic wordmark, one offset frame corner and concise language hold the varied hues together.

**Key Characteristics:**

- Early source artwork and compact introductions.
- Contrasting browsing and list compositions with quiet metadata.
- A broad canvas, coordinated spectrum surfaces and selective translucency.

## Colors

The frontmatter records canonical CSS values. `app/globals.css` owns the base roles; `app/spectrum.css` brightens dark secondary to #d0b9ff and muted text to #c4bfd1 for readable atmosphere surfaces. The cohesive `app/spectrum.css` layer is imported afterward by `app/layout.tsx` and owns the coordinated component treatments. The following `app/kinetic.css` layer owns motion and full-width detail text; preserve the explicit import order. Each unprefixed key maps directly to the same CSS custom property, such as `bg` → `--bg`. `light-*` records the actual light/system-light overrides; primary, primary-hover and on-primary inherit the default values in light appearance.

### Primary

Sakura pink (`primary`) marks the strongest action and selected feature controls. Primary buttons blend pink toward spectrum violet; the navigation/footer spectrum connects pink, violet and cool blue. Section surfaces vary their leading hue while retaining the same palette. The solid fallback and readable foreground roles remain `primary`, `primary-hover` and `on-primary`; keep supporting actions quieter.

### Secondary

Lavender (`secondary`) supports links, keyboard focus and layered surfaces; light appearance uses the deeper equivalent. Spectrum violet (`spectrum-violet`) and cool blue (`spectrum-cool`) widen the accent range without introducing unrelated colors. Both spectrum tokens inherit their default values in light appearance. The shared `--spectrum` gradient runs at 115 degrees from primary through spectrum violet at 52% to cool blue. Static pink/lavender atmosphere sits over the base in both appearances.

### Neutral

`bg` is the page ground. `surface`, `surface-raised` and `surface-hover` distinguish controls and temporary layers. `border` and `border-strong` supply quiet rules and stronger boundaries. `text` and `text-muted` establish reading hierarchy. Light appearance retains off-white, white and gray base tokens while sharing the accent atmosphere.

Status colors retain watching, completed, planned, on-hold and dropped roles, with rating and danger kept distinct in meaning. Pair every status with text. The data key remains `on_hold`, rendered “On hold” and mapped to `--on-hold`.

Saved appearance fields remain intact. The backward-compatible stored preset `Midnight` is labeled “Sakuga” in the UI. Legacy preset migration stays in `polishTheme`; explicit Custom palettes remain custom. `customAccentTokens` now writes `--primary`, `--on-primary` and `--primary-hover`, without renaming persisted preference fields. Its relative-luminance threshold (0.179) selects black or white button text; hover mixes the accent with white or black in the readable direction.

**The Text Before Color Rule.** Status, source availability and errors remain understandable without color.

## Typography

Self-host Chakra Petch Latin at 500/700 and Zen Kaku Gothic New Latin at 400/700. Chakra Petch supplies angular headings and the wordmark; Zen Kaku Gothic New supplies a Japanese editorial character to interface text, poster titles and metadata. The current English interface imports Latin subsets; this is not evidence of bundled Japanese glyph coverage. Preserve system fallbacks. The wordmark mixes 700 with a lighter 500 ending and carries one small frame corner; its mobile size is 1.65rem. Current CSS also requests 600 for compact title/control emphasis; the imported body assets are 400/700.

The headline and title roles govern page and section hierarchy. The home introduction uses `clamp(2rem, 3vw, 3rem)` with 1.08 line height, becoming 1.65rem on phones. Both intro lines retain solid text; feature titles use 700 for stronger hierarchy. General explanatory copy stays within 72ch; show titles, synopses, metadata and season pickers use the full available detail column. Poster titles reserve two readable lines; compact metadata can use 0.75rem. Use tabular numerals for progress, scores and counts. Keep uppercase labels selective and retain the two-family hierarchy.

## Layout

Use the frontmatter spacing rhythm. Public and workspace content no longer have a maximum canvas width. Public content uses 30px top padding and `clamp(16px, 2vw, 40px)` horizontal gutters; the existing tablet/phone overrides retain 24px/16px sides and 28px/24px top. Public navigation and its reserved audio slot follow the same fluid gutter. Workspace content uses `clamp(20px, 3vw, 48px)` horizontal padding and retains the shared sidebar/header grid, 242px expanded and 82px collapsed, with a mobile drawer at 600px. Let content use lateral space; show details deliberately fill their available text column.

The home introduction sits in a compact spectrum panel followed by useful genre chips. A wide scene/title/actions feature sits in its own gradient frame beside a denser popular poster shelf with a colored heading. Its content height remains intrinsic. Tablet pairs scene and text; phones stack them, retaining early artwork. Popular posters adapt to available width. At 1700px and above the popular shelf gains five columns, the release rail eight visible poster widths and the full catalog seven columns. Series airing now and recent releases use native horizontal poster rails, with up to 12 real catalog records each; upcoming releases use up to eight cover-led rows. The home route starts its existing catalog queries concurrently, settles failures independently and streams each secondary feed through its own Suspense boundary. “Series airing now” uses `airing=RELEASING`; it is a general catalog feed, not a personal selection. Rows show up to two source genres and available episode/year metadata. When a filter matches a different season or part, rows identify a multi-part series and suppress the root release’s year/episode count; a finished root is not presented as an upcoming release. Retain honest feed labels, section-specific unavailable/empty states and native document layout and scroll position.

Discovery keeps compact, collapsible filtering and sorting. The personal library defaults to the existing list mode: small covers, textual status, selected-season progress numerals/bar and score. Keep shelf, board and genre representations, season selection and bulk actions available. Detail pages put a list action near the title/season choice and retain the full editor below. Editors and billing use coordinated gradient panels; filters and list headers carry related tones. Settings, statistics and collections retain task-specific grouping and useful information density.

Main adaptation breakpoints are 1700px, 1100px, 800px and 600px. Choose usable poster widths, preserve visible focus and reachable controls, and prevent document overflow. Small-screen library rows retain score below progress rather than losing it.

## Elevation & Depth

Depth combines full-viewport pink, violet and blue fields, brighter section gradients, tinted borders and selective translucency. `body:before` is a fixed, static field behind the page, so color remains present below the introduction. The field mixes primary 36%, secondary 36% and cool blue 29% into the base, over a related diagonal foundation. Light/system-light fields use 16%, 16% and 19% respectively. Dark secondary and muted text are lighter for contrast. The intro uses 52% pink, 46% secondary and 40% cool blue; the feature uses 19% pink, 9% secondary and 17% cool blue. Release panels and editors use related stronger tints. Public and workspace headers use 84% base opacity with 12px blur. Search surfaces stay readable and turn solid on focus; the sidebar blends 16% secondary and 7% cool blue into the surface. Reduced transparency makes headers and synopsis surfaces opaque and hides the artwork backdrop. Saved appearance/custom-accent preferences remain compatible.

Search popovers use `0 14px 30px #0003`; hovered posters use `0 14px 28px #0005`; the mobile drawer uses `12px 0 30px #0005`. Resting content does not acquire a shadow cloud. Interaction transitions use 160ms and `cubic-bezier(0.22, 1, 0.36, 1)`; popovers enter by 5px. Loading skeletons reserve geometry and pulse opacity. Reduced motion removes movement/scaling; manual carousel control remains.

**The Still Atmosphere Rule.** The full-viewport color field stays still. Detail artwork fades with scroll; motion belongs to artwork, visible border lights and controls.

## Motion

The latest request adds expressive motion while keeping the current typography, palette, useful content and behavior. Research of 17 public GitHub projects, selected source files and licenses is recorded in `docs/research/motion.md` with blob fingerprints in `animation-sources.json`.

`MotionExperience` defers the pinned Lenis 1.3.27 and Motion 14.12.0 mini runtime into a separate dynamic chunk. Fine-pointer wheel input uses Lenis with 0.115 interpolation; touch retains native inertia. The custom RAF wakes on interaction, settles and stops, pauses when hidden, and is disposed on route changes. Nested text areas, selects, suggestion menus and sidebar scrolling remain native. Reduced motion or data saving keeps native scrolling and removes the runtime reveals. A shared `useSyncExternalStore` preference source keeps the carousel and effects layer in sync; changes take effect without a reload.

One shared IntersectionObserver triggers 460–520ms WAAPI card/section reveals with a capped 160ms stagger, then releases each observed target. Child-list observation handles streamed and newly filtered results by scanning only added subtrees. Content is visible before enhancement and if loading the runtime fails. Keyboard focus cancels an active reveal on its target. Pointer reflections are local to hovered covers/rows/buttons and coalesce into one requested frame without React state.

The introduction and feature frame carry a five-second masked border light adapted from Magic UI's MIT pattern. Hydrated client observers run it only while the parent is visible; hidden tabs pause it, and reduced motion hides it. Carousel artwork enters over 650ms, captions over 450ms, rows over 350ms, drawers over 250ms and save feedback over 300ms. Buttons have a short sheen, hover lift and press feedback. Preserve carousel pause/focus/manual controls. The active feature marker fills over the same 7.5-second autoplay interval; pausing or focusing stops the timer treatment. Opt-in interface audio uses the licensed samples below.

A thin scroll progress rule and a back-to-top control appear without moving page content. Show detail grids reserve a responsive 190–290px poster column on desktop, a 150px column on tablet and one column on phones. The remaining column, including synopsis and title, has no reading-width cap. Editors fill their assigned lower grid columns.

## Shapes

Use 8px controls, stable 2:3 posters with 10px corners, 5px small thumbnails and 16px dialogs. Intro, release sections and editor panels use 12px corners; the feature frame uses 14px and genre chips 6px. Coordinated tinted borders, gradients and aligned edges group content without obscuring its hierarchy. The offset frame corner belongs to the wordmark and active routes; do not repeat it on every card.

## Components

### Buttons, fields and filters

Primary buttons use readable on-primary text over a 110-degree gradient from primary pink toward a 78% pink/spectrum-violet mix. Secondary buttons and icon controls use lightly translucent raised surfaces and a fine border. Standard controls have a 44px minimum height, with existing compact variants used deliberately. Fields retain readable fills, labels and lavender focus rings; editors use a 15% secondary-to-surface gradient, while collapsible filter shells use 95% surface opacity. Preserve search shortcuts, suggestions and filter submission contracts. Collapsible filters expose an ordinary labeled summary.

### Navigation and feedback

Keep search visible and active routes identifiable through text and the small frame corner. The translucent public header ends in a 2px spectrum rule; active public/sidebar routes gain a matching pink/lavender surface. Preserve the opaque reduced-transparency alternative. Mobile navigation preserves its menu state and keyboard access. The site is silent. No audio toggle, playback code or sound assets ship; headers use the full available width. Empty/error states use a concise explanation and useful action, without large decorative artwork or unsupported promises. Native destructive confirmation remains.

### Posters and source artwork

Cards emphasize artwork with little visible outer container, persistent two-line titles and quiet metadata. Compact home cards reduce badges/source clutter; discovery and detail retain database/trailer links. Secondary list paths remain reachable by touch and keyboard. Hover lift is at most 4px and image scale at most 1.045, within clipped frames; reduced motion removes scaling.

Retain trusted source URLs, cached AVIF/WebP derivatives, source attribution and measured dimensions. Missing art and unavailable ratings stay explicit. Large cover fallback artwork is labeled as original Sakuga fallback art; tiny missing-cover thumbnails use an accessible, labeled unavailable-image icon. Never imply fallback art is the title’s source image or claim universal high-resolution coverage.

### Library and detail actions

List headers blend secondary 14% and cool blue 9% into the surface; hovered rows use a 6% lavender tint. Keep solid status, progress and score text readable over these treatments. Preserve selected season IDs, progress/status/score fields, collection membership IDs, save actions and the `LibraryEditor` key tied to `anime.id`. A selected-season `AnimeBackdrop` uses trusted source cover art (and existing cached derivatives) behind both public and signed-in details. The foreground and backdrop share image selection/sizing. Static 18px blur and 1.3 saturation sit under a 74% base veil, or 92% in light appearance. Scroll opacity falls to zero over 400–850px based on viewport height, capped by the available scroll range on shorter pages, and returns when scrolling up. Broken, missing or hidden covers leave the gradient; unrelated fallback art is not substituted. Synopsis text has a translucent reading surface that retains the full text-column width. Presentation must not change session refresh, authentication, data or integration contracts. Concise confirmations describe the actual action completed.

## Do's and Don'ts

### Do:

- **Do** keep search, real anime artwork and useful actions early.
- **Do** use the broader canvas and coordinated spectrum gradients across discovery and workspace controls, with readable text and opaque fallbacks.
- **Do** distinguish general catalog feeds from the signed-in user’s list.
- **Do** preserve source provenance, selected-season behavior and existing preference fields.
- **Do** use labels alongside color and keep secondary actions available to touch and keyboard.

### Don't:

- **Don't** invent creator profiles, favorites, recommendations, ratings or personal bylines.
- **Don't** add a permanent render loop, full-screen pointer field, scroll trapping or layout shifts to deliver animation.
- **Don't** use decorative Japanese text, mascots or a frame corner on every card.
- **Don't** replace each route with the same panel dashboard or an oversized welcome hero.


## Final restraint pass

The approved spectrum is softened to 70% of its previous color mixes against base/surface tokens. The full-viewport field, artwork fade, typography and interaction behavior remain. Authentication pages no longer render the generated city-image decoration; the existing brand and form layout stay intact.

The final shipping direction uses a stronger #131316 charcoal base, #1b1b20 surfaces and restrained corner accents. All interface audio, its toggle, runtime and bundled files are removed. The header reserves no sound-control space. This supersedes the earlier sampled-audio direction.

Discover now presents a featured anime and separate recent/popular/airing/upcoming shelves. Search owns text queries, filtering and pagination on /search and /app/search. Legacy filtered discover links redirect to their search equivalents; signed-in search preserves QuickAdd. Miruro page text was accessible, but its current Discover visual layout was not exposed, so literal visual parity is not verified.
