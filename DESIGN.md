# Sakuga visual system

Sakuga is a personal anime sanctuary: an editorial book jacket around a functional personal shelf. Porcelain backgrounds, pine ink, persimmon accents, fine rules, and restrained landscape illustration establish its atmosphere. This records the implemented interface, not production readiness. Machine-readable values are in `.impeccable/design.json`.

## Modes and composition

**Marketing — Persuade.** The homepage combines a generous two-column hero, an original CSS landscape presented as a personal shelf, an empty-library preview, feature columns, and a supporter strip. Italic display phrases and a slightly rotated shelf carry the personality. The illustration represents no fabricated anime or ratings; a new library explicitly starts empty. The primary action is “Start your collection.” Supporter messaging remains secondary.

**Workspace — Operate.** Persistent navigation, smaller headings, compact forms, real catalog covers, status, and progress serve library work. Shelf, table, status-board, and genre views organize the same library. Source scores show provider labels and original scales; null scores remain unavailable. There are currently no dedicated provider color tokens. Empty states, missing artwork, and unavailable source data remain explicit.

## Semantic color

| CSS token   | Role                                           | Light             | Dark                        |
| ----------- | ---------------------------------------------- | ----------------- | --------------------------- |
| `--paper`   | Canvas and inverse control text                | `#f4f2eb`         | `#19241f`                   |
| `--surface` | Panels, forms, navigation, covers              | `#faf9f5`         | `#21312a`                   |
| `--ink`     | Primary text, filled controls, focus, progress | `#203d32`         | `#f0f0e5`                   |
| `--muted`   | Secondary text                                 | `#596158`         | `#bac6bc`                   |
| `--line`    | Borders, rules, progress track                 | `#d6d9ce`         | `#45574b`                   |
| `--accent`  | Editorial emphasis, wordmark dot, ambient tint | `#a74729` default | Selected accent retained    |
| `--ambient` | Accent contribution to canvas                  | `8%` default      | Selected intensity retained |

`--wash` is `color-mix(in srgb, var(--accent) var(--ambient), var(--paper))`; it supplies the page background and theme preview. Explicit dark appearance replaces the five neutral tokens. System appearance uses `prefers-color-scheme: dark`. The CSS root defaults to light.

Fixed illustration colors are sage `#d5dfcf`, sun `#d9a77a`, hills `#70897a` / `#385547`, artwork ink `#263e31`, caption `#e7eddf`, and paper note `#e4dfc9`. The supporter strip is `#e2e5d9`; auth uses fixed pine `#203d32`, porcelain `#f4f2eb`, and sand `#d5b899`. Danger text is `#b2382d`. These fixed values are not neutral theme overrides; their presence does not establish complete dark-mode visual coverage.

## Typography and brand

Fonts are self-hosted through `@fontsource` imports in `app/layout.tsx`: Newsreader regular 400 and italic 400; DM Sans regular 400 and medium 500. Display uses `"Newsreader", Georgia, serif`; body uses `"DM Sans", Arial, sans-serif`. Georgia is a fallback, not the primary display font.

| Role                    | Size                            | Line height / tracking  |
| ----------------------- | ------------------------------- | ----------------------- |
| Body                    | `15px`                          | `1.6`                   |
| Primary display         | `clamp(2.8rem, 5.6vw, 5.7rem)`  | `1.12`, `-0.035em`      |
| Secondary display       | `clamp(1.8rem, 3vw, 3.1rem)`    | `1.12`, `-0.025em`      |
| Interface heading       | `1.15rem`                       | `1.35`                  |
| Workspace title         | `clamp(2.4rem, 3.5vw, 3.7rem)`  | Inherits display rhythm |
| Small text              | `0.78rem`                       | Inherits body rhythm    |
| Button / compact button | `0.9rem` / `0.8rem`, weight 500 | Inherits body rhythm    |
| Brand                   | `2rem`, weight 700              | `1`, `-0.04em`          |

Headings balance wrapping. Paragraphs cap at `70ch`, narrowed to `39ch` for hero copy and `40ch` for feature copy. Source scores, ratings, and tables use tabular numerals. The brand pairs a lowercase wordmark and accent dot with a `28 × 30` folded-ribbon outline SVG. The home link has an accessible name. The brand requests Newsreader 700 in CSS, although only 400 is currently imported; there is no separately loaded 700 font file.

## Space, shape, and layout

CSS spacing is component-specific rather than a strict 8px scale. Repeated small gaps include `4`, `8`, `10`, `12`, `15`, `20`, `25`, and `30px`; form stacks use `19px`, form grids `18px`. Desktop hero padding is `60px 6% 85px`; features use `110px 8%` with a `100px` gap; details use `25px 8% 100px`. Marketing containers cap at `1440px`, the values rule at `1265px`, and workspace content at `1450px`.

| Element                                                      | Radius | Dimensions                                   |
| ------------------------------------------------------------ | ------ | -------------------------------------------- |
| Form fields                                                  | `6px`  | Minimum height `44px`, padding `11px 12px`   |
| Buttons                                                      | `7px`  | Minimum height `46px`, padding `14px 23px`   |
| Compact buttons                                              | `7px`  | Minimum height `40px`, padding `10px 17px`   |
| Tags, artwork, progress                                      | `5px`  | Tag padding `4px 9px`                        |
| Covers, board entries, segmented group, theme preview        | `8px`  | Cover ratio `2/3`                            |
| Shelf art, library preview, editor, empty state, collections | `12px` | Editor padding `28px`, maximum width `760px` |

`--radius: 12px` is declared; component radii currently use literal values. Fine `1px` rules and flat surfaces are the main separators. Hero shelf and note shadows are `0 24px 55px -25px #203d3250` and `0 10px 25px -15px #203d3240`. Functional panels remain quiet. The desktop sidebar is `235px`; workspace header `78px`; main padding `48px 4% 80px`. The catalog defaults to four columns with `30px 22px` gaps. Status boards preserve five columns of at least `180px` and scroll horizontally; tables have an overflow wrapper.

## Responsive rules

| Query               | Implemented behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `min-width: 1600px` | Catalog grows to five columns.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `max-width: 1100px` | Public section navigation hides. Hero gap becomes `30px`, title `4.3rem`, artwork height `380px`. Sidebar narrows to `190px`; catalog becomes three columns, collections two; page headings stack and detail lower sections become one column.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `max-width: 700px`  | Marketing sections stack; hero title uses `clamp(3.5rem, 12vw, 5.4rem)`, artwork height `340px`. Shelf note moves into flow with `20px` top margin to avoid the caption. Header signup button hides while login and hero action remain. Sidebar becomes a sticky full-width top bar with horizontally scrolling navigation; secondary sidebar links hide. Workspace header becomes `48px`, main padding `30px 5% 70px`, title `2.5rem`; catalog becomes two columns with `25px 15px` gaps. Collections, dossiers, and genre groups stack; palette swatches become two columns; filters wrap and search fills a row. Auth aside reduces to the brand. |

## Theme controls

“Set the atmosphere” previews preferences immediately across the document through `ThemeApply`. Its preview contains a status tag and progress bar. “Save my preferences” persists values and reports success or failure through `role="status"`. Saved valid preferences are also applied in the server root layout.

Controls expose Light / Dark / System appearance, a custom six-digit hex accent, and Ambient tint from `0` to `30%`. Named accents in `lib/domain.ts` are Ink `#344b44`, Porcelain `#71614b`, Sakura `#984b62`, Matcha `#4f633a`, Ocean `#316579`, Ember `#a74729`, Lavender `#70538c`, and Slate `#526372`. Preset buttons expose `aria-pressed`, an outline, and a checkmark. “Reset this palette” restores the selected preset's accent and `8%` intensity while retaining appearance. Fresh settings default to Porcelain/light/8%; the uncustomized CSS root accent is Ember `#a74729`.

Theme colors tint the canvas while primary text and controls retain neutral tokens. Client system mode resolves the current media preference on theme application; it does not register a listener for subsequent OS changes while the page remains open.

## Interaction and accessibility

Focus is a `3px` ink outline with `4px` offset on links, buttons, inputs, selects, textareas, and summaries. A skip link targets `#main`. Controls have visible labels; disabled buttons use opacity `0.5`. Selected segmented controls use inverse ink/paper colors with `aria-pressed`. Text links remain underlined; other links show underline feedback on hover.

Motion is restrained: button background `0.2s`, cover transform `0.25s`, cover hover scale `1.025`. Reduced-motion preference disables smooth scrolling, transitions, and animations. Missing artwork has a text placeholder; mature artwork can be hidden by preference. These provisions do not constitute a completed accessibility audit.

## Review status

The public homepage received desktop and mobile visual review, with a ship disposition limited to homepage visual scope. The sole mobile shelf note/caption overlap was fixed by placing the note in flow at `700px` and below. The reviewer confirmed the fix in the updated `390px` capture: the caption and arrow are unobstructed. Screenshots are in `.impeccable/review/`.

Authenticated workspace visual review has not been certified because Supabase credentials are absent. This document does not certify backend readiness, provider permission, payments, catalog eligibility/scale, or deployment. `PRODUCT.md` retains launch prerequisites, including 10,000 eligible distinct works.
