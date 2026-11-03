---
name: Sakuga — Midnight Sakura
description: A quiet, artwork-led anime discovery and personal library system.
colors:
  paper: "#0f1220"
  surface: "#191d30"
  raised: "#242a42"
  line: "#353d5b"
  accent: "#ff8fb8"
  accent-hover: "#ffa8c8"
  accent-on: "#0f1220"
  secondary: "#b9a3ff"
  ink: "#f3f4fc"
  muted: "#a7afc9"
  watching: "#7dcfff"
  completed: "#7ee0b8"
  planned: "#b9a3ff"
  on-hold: "#f3ca7a"
  dropped: "#ff929b"
  rating: "#f3ca7a"
  danger: "#ff929b"
  light-paper: "#f5f4fa"
  light-surface: "#ffffff"
  light-raised: "#ebe9f4"
  light-line: "#d0cee1"
  light-ink: "#1d2037"
  light-muted: "#5f647c"
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
    fontFamily: 'Syne, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.8rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(1.8rem, 3.3vw, 2.6rem)"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontSize: "1.35rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  card-title:
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontSize: "0.875rem"
    fontWeight: 500
  metadata:
    fontSize: "0.8125rem"
rounded:
  tag: "6px"
  input: "8px"
  control: "10px"
  panel: "12px"
  poster: "14px"
  feature: "16px"
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-on}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.raised}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "10px 12px"
  navigation-active:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.input}"
    padding: "12px 14px"
  tag:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.tag}"
    padding: "3px 10px"
  poster:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.poster}"
---

# Design System: Sakuga — Midnight Sakura

## Overview

**Creative North Star: "The late-night anime journal"**

Midnight Sakura is atmospheric, crisp and restrained. Opaque midnight and indigo surfaces support readable product text; real anime artwork supplies the strongest color and visual interest. The same foundations serve public discovery, authentication, private library operations and supporting routes.

This replaces the retired Prism world. The eye/aperture mark and lowercase wordmark remain; optical glass, oversized display lettering and pointer-driven scenery do not belong to the current identity.

**Key Characteristics:**

- Artwork-led browsing with persistent titles and direct list paths.
- Compact navigation, visible search and aligned, responsive content.
- Opaque surfaces, quiet static ambience and accessible state feedback.

## Colors

The frontmatter records the normative values from `app/globals.css`; unprefixed colors are the dark defaults. `light-*` values replace their corresponding roles in light appearance. Primary pink, its hover color and midnight button text remain unchanged in the default light palette.

### Primary

Sakura pink (`accent`) identifies primary actions and selected feature controls. `accent-hover` brightens hover; `accent-on` supplies their text.

### Secondary

Lavender (`secondary`) identifies supporting links, selection, keyboard focus and secondary controls. Light appearance uses the deeper lavender equivalent.

### Neutral

Midnight (`paper`), indigo (`surface`) and raised indigo (`raised`) establish background, contained work and active layers. `line` separates surfaces; `ink` and `muted` distinguish reading priority without hiding metadata.

Status roles are watching, completed, planned, on hold and dropped. Rating uses the amber role; danger follows dropped. Always pair status color with its label. The stored/API key `on_hold` maps to the CSS `--on-hold` token and the visible label “On hold”; never rename that contract to `paused`.

Light, dark and system appearance remain supported. Saved custom accents use `customAccentTokens` in `lib/appearance.ts`: relative luminance above 0.179 selects black control text, otherwise white; hover mixes 88% accent with white or black in the same readable direction. Preserve this foreground calculation when changing custom palettes. `polishTheme` migrates legacy Prism/Iris/default accent values to Midnight, while explicit Custom palettes remain custom.

**The Text Before Color Rule.** Status, source availability and errors must remain understandable without their color.

## Typography

All product text uses the system sans stack in the frontmatter. Only Syne 700 is self-hosted, for the established wordmark and branded artwork fallback. Ordinary headings, controls and metadata use no decorative face; Unbounded and Space Mono are removed.

Page headings use the headline role; section headings use title; poster titles stay readable below their artwork. Body paragraphs have a maximum width of 72ch. Small metadata may step to 0.75rem for compact source labels; keep the muted role and explicit meaning. Numbers in ratings, progress tables and statistics use tabular numerals. Headings balance wrapping; long titles and source strings must wrap without overflow.

## Layout

Use the central spacing rhythm in the frontmatter. Public content is centered within 1360px, with 24px horizontal padding and 32px top padding; narrow screens use 16px and 24px. Workspace content has a 1500px maximum and responsive side padding.

The private shell is one real grid: `242px minmax(0, 1fr)`, collapsing to `82px minmax(0, 1fr)`. Header and content share the second column. At 600px and below the sidebar becomes a fixed 242px drawer; it starts closed unless a saved user choice says otherwise. Keep the collapse control and its accessible state synchronized.

The public header keeps search visible: below 800px it occupies its own full-width row, and below 600px route links use a menu toggle. Main adaptation breakpoints are 1100px, 800px and 600px. Desktop catalog grids have five columns, then four, three and two; the workspace uses fewer columns where its sidebar consumes space. Mobile poster grids remain two columns.

The discovery feature is a compact bordered panel with a 144px poster, content and a right-hand scene on wide desktops. The scene disappears below 1100px; mobile uses an 88px poster and a reserved 330px minimum content frame. Keep real metadata, synopsis, direct actions and feature controls available. Genre shortcuts lead directly into the first poster shelf. Rails use native horizontal scrolling and bounded previous/next controls, without taking over page scroll.

## Elevation & Depth

Opaque tonal layers and fine borders establish structure. Background ambience is two static CSS radial gradients: lavender at 6% near the upper right, pink near the upper left at half the saved ambient intensity, capped at 5% (default 4%). It never tracks input or animates. No grain, glass or backdrop blur is required.

Shadows are localized: search popovers use `0 14px 30px #0003`, focused/hovered posters use `0 8px 18px #0004`, and the mobile drawer uses `12px 0 30px #0005`. Resting poster cards have no shadow cloud.

## Shapes

Posters keep a reserved 2:3 frame and the poster radius. Features use the largest radius; panels, controls, inputs and tags step down according to role. Thin borders and clipped images make the shape; do not distort artwork or rotate card planes.

## Components

### Buttons and fields

Primary buttons use sakura fill and computed readable text; secondary buttons use a solid surface and border, brightening to raised on hover. Standard buttons and fields have a 44px minimum height; compact buttons use 40px. Disabled buttons reduce opacity to 0.5 and show the unavailable cursor. Pending operations retain clear labels and status feedback.

Fields have visible labels, opaque backgrounds, clear borders, lavender carets and muted placeholders. Search uses a solid surface, a 46px frame and its own focus-within ring. Global keyboard focus is a 2px lavender outline with 4px offset; search uses 2px offset. Keep existing Lucide icons and accessible icon-button names.

### Navigation, tags and filters

Workspace active routes use raised indigo and lavender text; public active routes use raised indigo and main text. Tags use restrained raised surfaces and lavender labels. Collapsible discovery filters and segmented library views retain their real selected state. Search retains `/` and Ctrl/Cmd+K shortcuts without intercepting typing in editable fields; suggestions must stay above feature content.

### Artwork and discovery

Poster titles, metadata, list-management links and separate source destinations remain reachable without hover or nested interactive elements. Fine-pointer hover/focus may lift the poster by at most 3px, brighten its border and add the localized shadow; only its clipped image scales to 1.025. Touch users keep direct actions.

The feature retains visible manual selection and pause/play. Its existing 7.5-second content rotation pauses on hover, focus, hidden tabs, manual selection and reduced motion. This content carousel is separate from the static background. Skeletons reserve poster dimensions and may pulse gently while real content loads.

### State and accessibility

State transitions use `--fast` (160ms) and `--ease` (`cubic-bezier(0.22, 1, 0.36, 1)`); `--panel` is reserved at 220ms. Popovers enter from 5px below. Buttons may press to 0.98. Reduced motion removes animations, transitions, poster lift/scaling, press scaling and smooth rail scrolling; the carousel retains manual navigation. Do not add entrance delays to real data or animate whole catalog grids.

List feedback, empty/error states and explicitly unavailable artwork must remain meaningful. Destructive removal and import retain native confirmation behavior. Opt-in click/hover/selection audio remains available through its compact toggle; its pointerover listener supplies sound only and is not a visual pointer effect. No music or ambient visual loop is part of the system.

## Do's and Don'ts

### Do:

- **Do** use shared foundations and real artwork across every route.
- **Do** preserve visible titles, search, focus and season-specific list paths on touch and keyboard.
- **Do** keep the shared sidebar grid and readable light/system/custom palettes intact.
- **Do** preserve source attribution, cached-art provenance, measured derivatives and explicit unavailable labels.
- **Do** preserve authentication/session refresh, verified season grouping, selected-season editor keys and original anime IDs for progress, scores, notes and collection membership.

### Don't:

- **Don't** restore Prism glass, shaders, canvas scenery, refracting lenses, visual pointer loops, tilt, parallax, ripple or animated backgrounds.
- **Don't** introduce oversized marketing panels, fabricated ratings, statistics or activity.
- **Don't** apply Syne to ordinary UI text or restore Unbounded and Space Mono.
- **Don't** hide essential actions behind hover or communicate status through color alone.
- **Don't** discard real smaller source art, enlarge cached originals or treat fallback Sakuga artwork as the anime's poster.
