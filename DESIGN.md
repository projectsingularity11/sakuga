---
name: Sakuga journal
description: Neutral, artwork-led anime discovery and a personal media library.
colors:
  bg: "#0b0b0d"
  surface: "#141416"
  surface-raised: "#1d1d20"
  surface-hover: "#252528"
  border: "#2e2e33"
  border-strong: "#424249"
  primary: "#ff8fb8"
  primary-hover: "#ffa8c8"
  on-primary: "#0b0b0d"
  secondary: "#b9a3ff"
  text: "#f5f5f7"
  text-muted: "#a6a6af"
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
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.8rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(1.8rem, 3.3vw, 2.6rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.35rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  card-title:
    fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
  metadata:
    fontSize: "0.8125rem"
rounded:
  tag: "3px"
  thumbnail: "5px"
  control: "8px"
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

**Creative North Star: "The personal anime journal"**

Sakuga is a practical, independently voiced space for discovering anime and keeping a personal list. Neutral black and charcoal, fine rules and deliberate typography provide the structure; existing anime artwork provides the strongest color. Personality comes from the typographic wordmark, one offset frame corner, artwork proportions and concise language.

**Key Characteristics:**

- Early source artwork and compact introductions.
- Contrasting browsing and list compositions with quiet metadata.
- Neutral surfaces, restrained pink/lavender and visible interaction states.

## Colors

The frontmatter records the canonical CSS values in `app/globals.css`. Each unprefixed key maps directly to the same CSS custom property, such as `bg` → `--bg`. `light-*` records the actual light/system-light overrides; primary, primary-hover and on-primary inherit the default values in light appearance.

### Primary

Sakura pink (`primary`) marks the strongest action and selected feature controls. Its hover and readable foreground roles are `primary-hover` and `on-primary`; avoid filling every action pink.

### Secondary

Lavender (`secondary`) supports links and keyboard focus. Light appearance uses the deeper equivalent.

### Neutral

`bg` is the page ground. `surface`, `surface-raised` and `surface-hover` distinguish controls and temporary layers. `border` and `border-strong` supply quiet rules and stronger boundaries. `text` and `text-muted` establish reading hierarchy. Light appearance is neutral off-white, white and gray, without a blue or purple cast.

Status colors retain watching, completed, planned, on-hold and dropped roles, with rating and danger kept distinct in meaning. Pair every status with text. The data key remains `on_hold`, rendered “On hold” and mapped to `--on-hold`.

Saved appearance fields remain intact. The backward-compatible stored preset `Midnight` is labeled “Sakuga” in the UI. Legacy preset migration stays in `polishTheme`; explicit Custom palettes remain custom. `customAccentTokens` now writes `--primary`, `--on-primary` and `--primary-hover`, without renaming persisted preference fields. Its relative-luminance threshold (0.179) selects black or white button text; hover mixes the accent with white or black in the readable direction.

**The Text Before Color Rule.** Status, source availability and errors remain understandable without color.

## Typography

Self-host Space Grotesk at 500/700 and Manrope at 400/600 only. Space Grotesk supplies headings and the wordmark; Manrope supplies interface text, titles beneath posters and metadata. Preserve system fallbacks. The wordmark mixes 700 with a lighter 500 ending and carries one small frame corner; its mobile size is 1.65rem.

The headline and title roles govern page and section hierarchy. The compact home introduction uses `clamp(1.8rem, 3.1vw, 2.75rem)` with 1.13 line height, becoming 1.85rem on phones. Body copy stays within 72ch. Poster titles reserve two readable lines; compact metadata can use 0.75rem. Use tabular numerals for progress, scores and counts. Do not synthesize additional font weights or uppercase every label.

## Layout

Use the frontmatter spacing rhythm. Public content is centered within 1360px, with 32px side padding and 36px top padding; tablet uses 24px sides/28px top, phones 16px sides/24px top. The workspace retains its shared sidebar/header grid, 242px expanded and 82px collapsed, with a mobile drawer at 600px. Reserve header space for the existing audio control.

The home introduction is compact and followed by ruled genre navigation. A wide scene/title/actions feature sits beside a denser popular poster shelf, rather than inside a hero panel. Its content height remains intrinsic. Tablet pairs scene and text; phones stack them, retaining early artwork. Popular posters adapt to available width. Recent releases use a native horizontal poster rail; upcoming releases use cover-led rows. Retain honest general-feed labels and native page scrolling.

Discovery keeps compact, collapsible filtering and sorting. The personal library defaults to the existing list mode: small covers, textual status, selected-season progress numerals/bar and score. Keep shelf, board and genre representations, season selection and bulk actions available. Detail pages put a list action near the title/season choice and retain the full editor below. Settings, forms, statistics and collections use fine section rules where a panel adds no hierarchy.

Main adaptation breakpoints are 1100px, 800px and 600px. Choose usable poster widths, preserve visible focus and reachable controls, and prevent document overflow. Small-screen library rows retain score below progress rather than losing it.

## Elevation & Depth

Depth comes primarily from opaque neutral tones, borders and alignment. The optional ambient preference controls barely perceptible, static neutral shading: text color mixed into a single upper-right radial gradient, capped at 3%. There is no pink/purple haze or animated background.

Search popovers use `0 14px 30px #0003`; hovered/focused posters use `0 8px 18px #0004`; the mobile drawer uses `12px 0 30px #0005`. Resting content does not acquire a shadow cloud. Interaction transitions use 160ms and `cubic-bezier(0.22, 1, 0.36, 1)`; popovers enter by 5px. Loading skeletons reserve geometry and pulse opacity. Reduced motion removes movement/scaling; manual carousel control remains.

**The Quiet Ground Rule.** Artwork supplies atmosphere; the page field stays neutral and still.

## Shapes

Use 8px controls, stable 2:3 posters with 10px corners, 5px small thumbnails and 16px dialogs. Ordinary panels may use the established 12px radius, but sections do not automatically need containers. Fine rules and aligned edges do most of the grouping. The offset frame corner belongs to the wordmark and active routes; do not repeat it on every card.

## Components

### Buttons, fields and filters

Primary buttons use primary/on-primary; secondary buttons use raised neutral surfaces and a fine border. Standard controls have a 44px minimum height, with existing compact variants used deliberately. Fields use neutral fills, readable labels and lavender focus rings. Preserve search shortcuts, suggestions and filter submission contracts. Collapsible filters expose an ordinary labeled summary.

### Navigation and feedback

Keep search visible and active routes identifiable through text and the small frame corner. Mobile navigation preserves its menu state and keyboard access. Audio occupies its reserved header slot and retains the existing opt-in sound behavior. Empty/error states use a concise explanation and useful action, without large decorative artwork or unsupported promises. Native destructive confirmation remains.

### Posters and source artwork

Cards emphasize artwork with little visible outer container, persistent two-line titles and quiet metadata. Compact home cards reduce badges/source clutter; discovery and detail retain database/trailer links. Secondary list paths remain reachable by touch and keyboard. Hover lift is at most 3px and image scale at most 1.025, within clipped frames; reduced motion removes scaling.

Retain trusted source URLs, cached AVIF/WebP derivatives, source attribution and measured dimensions. Missing art and unavailable ratings stay explicit. Large cover fallback artwork is labeled as original Sakuga fallback art; tiny missing-cover thumbnails use an accessible, labeled unavailable-image icon. Never imply fallback art is the title’s source image or claim universal high-resolution coverage.

### Library and detail actions

Preserve selected season IDs, progress/status/score fields, collection membership IDs, save actions and the `LibraryEditor` key tied to `anime.id`. Presentation must not change session refresh, authentication, data or integration contracts. Concise confirmations describe the actual action completed.

## Do's and Don'ts

### Do:

- **Do** keep search, real anime artwork and useful actions early.
- **Do** distinguish general catalog feeds from the signed-in user’s list.
- **Do** preserve source provenance, selected-season behavior and existing preference fields.
- **Do** use labels alongside color and keep secondary actions available to touch and keyboard.

### Don't:

- **Don't** invent creator profiles, favorites, recommendations, ratings or personal bylines.
- **Don't** add glass, ripple, visual pointer loops, parallax, tilt, particles, glow or background animation.
- **Don't** add pink haze, decorative Japanese text, mascots or a frame corner on every card.
- **Don't** replace each route with the same panel dashboard or an oversized welcome hero.
