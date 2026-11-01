# Data sources, attribution and approval gate

## Verification status

Provider documentation requests were attempted on 2026-11-01. The environment proxy returned HTTP 403 for `docs.anilist.co`, `myanimelist.net` and `kitsu.docs.apiary.io`. Current terms, rate limits and image/commercial redistribution rights therefore **have not been verified**. Imports default to disabled (`PROVIDER_TERMS_APPROVED=false`). No provider data has been imported or represented as approved for commercial launch.

Before enabling, the owner must review and retain the current authoritative terms, permitted commercial usage, caching/refresh intervals, attribution, redistribution, image rights and authentication scopes. AniList may require commercial approval depending on use; do not assume its public endpoint permits building a competing commercial database. A boolean is an operational acknowledgement, not a legal license.

## Implemented adapters, awaiting live verification

- **AniList:** official `https://graphql.anilist.co` GraphQL endpoint. Public anime query; original scores /100. Popularity is AniList membership/popularity, not number of ratings. We do not display that count as votes. Sort by `POPULARITY_DESC, ID`, page size 50. More pages replace excluded candidates. Official docs: https://docs.anilist.co/guide/api-requests and https://docs.anilist.co/terms-of-use . Review current limits before running. Default pacing exceeds 2 seconds between pages; Retry-After and bounded exponential jitter handle retryable HTTP failures.
- **MyAnimeList:** official `https://api.myanimelist.net/v2/anime/{id}` API, requires owner-supplied `MAL_CLIENT_ID`. Uses `mean` /10, `num_scoring_users` (actual scoring count) and `rating` classification. Uses AniList's explicit `idMal`, with manual override support. Default per-entry pacing is 1.2 seconds, configurable in code only after policy review. Official reference: https://myanimelist.net/apiconfig/references/api/v2 . No user-list scraping.
- **Kitsu:** investigated as a candidate; no adapter shipped because policy verification and a trustworthy cross-provider mapping were unavailable. No Kitsu ratings are claimed.
- **Anime-Planet:** not integrated. No scraping or bypass attempted.

## Required network destinations (owner settings)

Documentation: `docs.anilist.co`, `myanimelist.net`, `kitsu.docs.apiary.io`.
Runtime: `graphql.anilist.co`, `api.myanimelist.net`, your exact `<project-ref>.supabase.co`, `api.stripe.com`.
Browser images (only if rights cleared): `s4.anilist.co`, `cdn.myanimelist.net`; Kitsu hosts are reserved in URL validation but not used by an active adapter.
Preserve existing package-manager rules when adding destinations. Do not replace an unknown allowlist. Runtime tests have not verified access to these destinations.

## Catalog and moderation methodology

Distinct works are one AniList ID; TV, movie, OVA, ONA, special and other source works may qualify. Individual episode rows and aliases do not increase the count. Manual mapping review handles identified mistakes; no fuzzy title merges. Potential duplicate `(title,year,format)` groups are reported for review. Popularity is one provider's ordering, never “the world's top 10,000.” Equal values use ID order; null popularity appears after known values in the app. The date in `updated_at` and ingestion job timestamps identifies the actual snapshot; no snapshot exists yet.

Hentai/pornography genres and explicit MAL Rx classifications are excluded. AniList adult flags quarantine ambiguous works. Ecchi, violence and other mature themes alone do not exclude a title. Review ambiguity manually before publication. The override table records decision, reason, actor and time. Restricted artwork URLs are cleared, public RLS prevents metadata/score/mapping reads, and only published records are queried across surfaces. Automated labels are imperfect; reports and operator review are necessary.

Ratings are original source values. Missing values remain null. No synthetic consensus exists. A filter on a /10 threshold divides AniList /100 by ten; original displayed scores stay unchanged. Provider audiences are not independent or interchangeable. Detail pages show source links and refresh dates; mappings must be verified to be visible. Image rights and branding/attribution wording require owner approval before launch.
