# Plan and acceptance

1. Foundation: strict Next.js, semantic theme tokens, schema and RLS.
2. Auth: email sign-up/login/reset/callback, server-verified private routes.
3. Catalog: lawful adapters, gated resumable ingestion, publication moderation, paginated search/details.
4. Library: canonical entry, progress, score, tags, collections, rules, export/import.
5. Personalization: persisted profile/theme, statistics, mobile.
6. Billing: $5 hosted test checkout, signed idempotent webhooks, server entitlements.
7. Verify: unit/build/browser and live database ownership/payment flows when configured.

Acceptance: 10,000 eligible distinct published titles verified from DB; two lawfully enabled ratings providers; real auth and cross-user tests; persistent library/collections/theme; verified payment events; production smoke test. Never infer launch readiness from a build.

External prerequisites: Supabase URL/public key/service key, database migration access, Stripe test keys/webhook signing secret, canonical site URL. Provider commercial/redistribution/image rights must be reviewed before enabling imports. No credentials currently supplied. See CONTINUATION.md for actual outcomes.

## Progress checklist

- [x] Next.js/TypeScript foundation, design system, routes and local build.
- [x] Schema/RLS migration and embedded database authorization tests.
- [x] Server auth/persistence/library/collection/theme/billing implementations.
- [x] Gated provider adapters, resumable ingestion, operator verification tools.
- [x] Public desktop/mobile browser and accessibility checks.
- [x] Setup/deployment/provider/operations and continuation documentation.
- [ ] Hosted auth and persistence verified with real credentials.
- [ ] Current provider terms and commercial/image permissions verified.
- [ ] ≥10,000 eligible distinct published works and two live ratings sources.
- [ ] Stripe test-mode end-to-end purchase/refund/dispute verification.
- [ ] Remaining product limitations in CONTINUATION.md completed.
- [ ] Authenticated/mobile/large-library visual and performance validation.
- [ ] Intended Vercel project authorized, deployed and smoke-tested.
