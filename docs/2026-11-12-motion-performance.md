# Artwork reflections and motion performance

Requested direction: charcoal canvas, small artwork-responsive gradient pools, subtle liquid-glass sheen, more expressive motion without a second animation engine. No sound or font changes.

## Research

The named award-web skill was not present in mounted skill directories, uploaded prompt files, the available skill catalog, or connected Drive search. Continued with the user's explicitly authorized GitHub fallback. This extends `research/motion.md`:

- [Motion](https://github.com/motiondivision/motion): retained the existing native WAAPI mini runtime.
- [Lenis](https://github.com/darkroomengineering/lenis): retained demand-driven smooth scrolling and native touch.
- [transition.css](https://github.com/ArgyleInk/transition.css): reviewed its selective CSS clip/mask transition catalog and Apache-2.0 license; authored a short artwork aperture transition rather than importing the whole library.
- [Codrops AnimatedGridPreviews](https://github.com/codrops/AnimatedGridPreviews): reviewed artwork/grid motion direction; no demo assets or source copied.
- [cssanimation](https://github.com/yesiamrocks/cssanimation): reviewed the CSS-only effect catalog; avoided a full stylesheet and text splitting.
- [Anime.js](https://github.com/juliangarnier/anime): reviewed current README; a second timeline engine adds no value here.

Source review does not mean every demo was executed. New effects are authored locally: bounded poster tilt, pointer-following reflection, clipped artwork entrance, search unfolding, tag lift and source-link underline/arrow feedback. Ambient pools reuse the displayed image URL; no color-extraction API, canvas readback, animation CDN or idle drawing loop. Motion respects reduced-motion preferences; the ambient layer also respects reduced transparency.

## Measured database bottleneck

The public search function carried full anime rows (including long synopsis/search text) through its window and materialized grouping CTEs. The migration carries only ID, year, popularity, show ID and relevance, then hydrates the selected 24 records as before. Matching, ordering, pagination, published visibility, verified mappings and function grants are unchanged.

Production database, interleaved `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on the same empty-query/page-1 SQL, warm shared buffers:

| Run | Original wide projection | Narrow projection |
| --- | ---: | ---: |
| 1 | 2844.690 ms | 74.304 ms |
| 2 | 920.283 ms | 60.171 ms |
| 3 | 810.938 ms | 62.995 ms |
| Median | 920.283 ms | 62.995 ms |

Original: 10,047 temporary blocks read / 10,060 written (about 79 MiB). Narrow: zero temporary blocks. This is about a 93% reduction in the median **database execution time**, not a site-wide load-time claim.

Live JSON equality checks before migration passed for empty search, Naruto, Shippuden, newest TV page 2, Action sorted by rating, and a nonmatching query. After migration, RPC EXPLAIN timings were 2713.582, 172.517 and 61.908 ms with zero temporary blocks in every run; first-call compilation and shared-host variability remain visible.

## Browser measurement limits

The development fixture showed warm navigation TTFB 393–395 ms before and 360–436 ms after visual additions, with zero warm CLS. These overlap; there is no demonstrated frontend load-time win. Dev compilation, carousel image choice and cache state make cold samples incomparable. The fixture does not exercise the production database, so it cannot quantify the database fix's end-to-end impact. No speculative cache/auth rewrites or extra dependencies were added.

## Validation

45 unit/database tests passed, including grouped seasons, anonymous published-only projection and verified-source filtering. All 12 selected desktop/mobile browser checks passed, covering navigation, accessibility, session refresh, artwork backdrop cleanup, smooth scrolling, pointer reset, ambient reflections and reduced motion. ESLint, TypeScript and the production webpack build passed. Desktop and mobile viewport captures were visually reviewed. Production deployment status and live route checks are verified after the release push.
