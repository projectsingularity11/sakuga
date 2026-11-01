# Current delivery status

This is a substantial implementation, **not a declared production launch**. No Supabase project, Vercel project or Stripe account was provisioned or deployed. Cloud environment publication is separate and has not been changed.

## Implemented and locally verified

- Public editorial homepage, signup/login/recovery pages, pricing, draft policies and not-found states.
- Anonymous private-route redirect and explicit unconfigured-auth state. No fake sign-in or local-storage user database.
- Strict production build, lint/typecheck, domain/provider adapter tests and embedded Postgres migration/integration tests.
- Complete committed migration exercised in embedded Postgres with an `auth.users`/`auth.uid()` harness: owner privacy, library uniqueness, progress bounds/history, collection owner boundaries, client entitlement denial, webhook transaction idempotency/refund revocation, atomic import skip/replace/rollback, private statistics, audited mapping correction, moderation overrides and catalog health.
- Desktop/mobile public browser tests and automated WCAG-tagged axe scans on homepage/auth/pricing, plus keyboard entry point. This is not formal accessibility certification or a private-app visual audit.
- Homepage visual review: one mobile caption overlap fixed and independently confirmed. Public homepage scoped disposition: ship. Screenshots in `.impeccable/review/`.
- Dependency audit: no production vulnerabilities reported at time of check.

## Implemented, requiring external configuration and live verification

- Supabase email auth/session refresh/recovery/logout/account deletion, owner-scoped pages and persistence. Real emails and authenticated browser flows have NOT run. The hosted ownership integration test and opt-in full browser journey are supplied, unrun without credentials.
- Search across titles/aliases, server pagination, filters, original score/scale/source/timestamp detail, mature artwork hiding, reports.
- Library quick-add, status/progress/score/date/tag/notes/favorite/priority/rewatch editing, shelf/list/status-board/genre views, page-scoped bulk updates, removal confirmation, backlog pick.
- Manual collections, membership removal/order, name/description/pinning, and preset smart rules. Theme account persistence and immediate preview, profile/title-language settings, database statistics, JSON/CSV library export, validated previewed atomic JSON import.
- AniList official adapter and MyAnimeList official adapter through explicit cross-provider IDs. They are implemented, **not live verified integrations**. Provider terms/commercial/redistribution/image review is unresolved because documentation requests were blocked by HTTP 403 network policy. Kitsu and Anime-Planet are not integrated.
- Resumable operator ingestion, idempotent replay, HTTP backoff, checkpoints, health/count verification, quarantine and manual overrides. No import has been run. **Eligible production count: unverified; no production database is connected.** The 10,000 requirement is unmet.
- Fixed $5 one-time Stripe Checkout, signed webhook, atomic idempotent payment writes and entitlement-aware future ad gate. Stripe SDK integration has not been exercised against test-mode Stripe. No real charges initiated. Refund/dispute handling is conservative; see operations caveats.
- Vercel-compatible application configuration and deployment runbook; no deployment or live URL.

## Remaining implementation/operational limitations

- Smart-collection editor offers curated presets rather than a general visual rule builder. Rules currently support status/favorite/genre/max episodes/personal minimum score; runtime/studio/source-rating/date-range rules are not implemented.
- Library has server search/status/favorite/sort filters and multiple views, but no saved filter presets, drag/drop, full-catalog bulk selection, or user-adjustable density. Collection descriptions/pinning/order are supported; dedicated collection cover editing is not.
- Discover UI exposes title/genre/format/year/source score/short-series filters, not all requested season/studio/library-exclusion options. Related-title and personalized recommendation shelves are not implemented.
- Viewing events preserve progress history, but there is no cycle/timeline editor. No external provider list import; only documented Sakuga JSON is accepted.
- Export contains library fields/notes, not complete profile/preferences/collection definitions/history. 2,000-row export cap is explicit rather than silently truncating larger accounts; operator-assisted full export is required above it.
- No OAuth buttons, ad network, consent platform, analytics/error-monitoring provider or live SMTP configuration. Central ad gate/placement interface exists but emits no ads or scripts.
- No production rate-limit store beyond provider/Supabase auth limits; public launch needs deployment-layer action/search abuse limits, monitoring and legal/business details. Won-dispute reinstatement can require operator review.
- Authenticated mobile layout, large-library performance, live provider coverage/deduplication and full application accessibility remain unmeasured/unverified. Local public timings, if collected, are in performance.json and do not establish production performance.

## Next executable steps

1. Configure a disposable Supabase project and apply the migration per DEPLOYMENT.md; configure exact Auth callbacks and SMTP. Set public/server keys securely. Rebuild after changing `NEXT_PUBLIC_*` values.
2. For this proxy-based cloud machine, the Node 24 startup/import scripts use `--use-env-proxy`, preserving supplied proxy and CA trust. Add required provider/Supabase/Stripe domains in owner environment settings; never disable TLS.
3. Review authoritative provider terms and obtain any needed commercial permission. Only then set `PROVIDER_TERMS_APPROVED=true`, supply MAL client ID, run one real seed page, and inspect quarantine/images/mappings.
4. Run `npm run test:live` using disposable `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, `TEST_SUPABASE_SERVICE_ROLE_KEY`. Build the app against that same test URL, then `TEST_LIVE=true TEST_ALLOW_MUTATION=true npm run test:e2e` for the full supplied browser journey. Recovery email and purchase tests still require manual/configured provider validation.
5. Verify Stripe test webhooks/refunds/duplicate and delayed delivery. Resolve remaining product gaps above before calling the entire requested scope complete.
6. Ingest until the health query proves ≥10,000 eligible distinct works; inspect duplicates, stale data and two-source coverage. Measure authenticated pages and a large library. Identify and authorize the intended Vercel target before any deployment.

No placeholder catalog, invented scores, fabricated testimonials or fake user counts were used to cover these gaps.
