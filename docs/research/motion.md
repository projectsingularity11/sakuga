# GitHub animation research for Sakuga

Surveyed 17 public projects by reading current repository READMEs and examining implementation files for selected effects. This is a source review, not a claim that every demo was executed. README blob fingerprints are saved in animation-sources.json; these are file blob SHAs, not commit hashes.

| Project                                                                          | Finding and decision                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Lenis](https://github.com/darkroomengineering/lenis)                            | Selected 1.3.27, MIT. Native-scroll integration with anchors, nested-scroll prevention and reduced-motion support. Sakuga uses a demand-driven custom RAF rather than an always-running loop; touch keeps native inertia. Read core options, React README and license.                                            |
| [Motion](https://github.com/motiondivision/motion)                               | Selected 14.12.0, MIT. Use motion/mini WAAPI controls for small, once-per-element viewport reveals. No per-pointer React state and no wholesale React conversion of server-rendered cards. License read.                                                                                                          |
| [Magic UI](https://github.com/magicuidesign/magicui)                             | Examined BorderBeam, ShineBorder, BlurFade, ShimmerButton and ScrollProgress source. Adapted offset-path/masked border-light geometry; MIT notice retained below. Progress, button sheen and viewport reveal concepts are implemented to fit existing semantics. Avoided copying its full React/Tailwind runtime. |
| [React Bits](https://github.com/DavidHDev/react-bits)                            | Reviewed its 215+ component catalogue description and Magnet source, including input registry, exclusive owner, spring integration and cleanup. Current README identifies MIT + Commons Clause. No code copied; did not add its physics/3D-tilt behavior to a dense anime index.                                  |
| [Anime.js](https://github.com/juliangarnier/anime)                               | General CSS/SVG/object timelines; duplicates the selected animation engine for this task. Not installed.                                                                                                                                                                                                          |
| [GSAP](https://github.com/greensock/GSAP)                                        | Advanced timelines, ScrollTrigger and ScrollSmoother. Powerful but unnecessary alongside Lenis + WAAPI for these interactions. Did not install a second sequencing system.                                                                                                                                        |
| [AutoAnimate](https://github.com/formkit/auto-animate)                           | Useful drop-in list mutation transitions. Existing season-keyed editor and bulk state must retain their lifecycle; native row/feedback animation is sufficient here.                                                                                                                                              |
| [AOS](https://github.com/michalsnik/aos)                                         | Scroll-reveal classes with throttle/debounce and once/mirror options; duplicated by one shared IntersectionObserver and Motion mini.                                                                                                                                                                              |
| [Animate.css](https://github.com/animate-css/animate.css)                        | Broad CSS-keyframe catalogue; README currently declares Hippocratic License and reduced-motion support. Not vendored; authored only the effects needed by the product.                                                                                                                                            |
| [React Spring](https://github.com/pmndrs/react-spring)                           | Spring-based cross-platform animation; unnecessary second engine and no need for persistent spring state on every cover.                                                                                                                                                                                          |
| [Barba](https://github.com/barbajs/barba)                                        | SPA-style page transitions. Not adopted because Next App Router already owns navigation, history, streaming and auth redirects.                                                                                                                                                                                   |
| [Locomotive Scroll](https://github.com/locomotivemtl/locomotive-scroll)          | Current README says it is built on Lenis; direct Lenis integration avoids an extra orchestration layer.                                                                                                                                                                                                           |
| [Rellax](https://github.com/dixonandmoe/rellax)                                  | Parallax-focused. Not needed for usable library/detail layouts; artwork remains in the normal layout.                                                                                                                                                                                                             |
| [tsParticles](https://github.com/tsparticles/tsparticles)                        | Particle engine and presets. Not added: constant background rendering would compete with posters and add battery work.                                                                                                                                                                                            |
| [Codrops scroll layouts](https://github.com/codrops/ScrollBasedLayoutAnimations) | Art-directed scroll-layout demos. Used as exploration of rhythm, not copied art or pinned/scroll-trapped layouts.                                                                                                                                                                                                 |
| [Codrops typography](https://github.com/codrops/OnScrollTypographyAnimations)    | Typography sequencing reference. Kept actual fonts, heading semantics and real content; no DOM text splitting that harms selection/accessibility.                                                                                                                                                                 |
| [Vaul](https://github.com/emilkowalski/vaul)                                     | Current README explicitly says unmaintained. Not selected for a new navigation dependency.                                                                                                                                                                                                                        |

The old studio-freight/lenis path returned 404; the current darkroomengineering repository was verified instead. GitHub repository search returned no results through the connection, so the survey used direct public repository and file reads.

## Exact component references

- https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/border-beam.tsx
- https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/shine-border.tsx
- https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/blur-fade.tsx
- https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/shimmer-button.tsx
- https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/scroll-progress.tsx
- https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/Magnet/Magnet.jsx
- https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md

## Implementation contract

Content is visible by default, independent of JavaScript. Motion reveals once on viewport entry and stays bounded by observed content, with a capped stagger. CSS border lights run only while their frames are visible and pause in hidden tabs. Reduced motion/data saving disable runtime reveals and CSS keyframe animation; reduced motion also disables interaction movement; reduced motion destroys Lenis rather than merely turning its duration down. A single local pointer highlight updates only the hovered control/card, not inherited page variables. Native touch, horizontal poster strips, select/textarea scrolling and keyboard focus remain functional. Route changes dispose observers, listeners, animation controls and Lenis. No external animation CDN is used.

## Magic UI notice

MIT License

Copyright (c) Magic UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
