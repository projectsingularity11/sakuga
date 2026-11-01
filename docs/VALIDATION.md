# Validation evidence

Validated on 2026-11-01 in the cloud development workspace, with no external project credentials.

| Check                                          | Outcome                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Production build (`npm run build`)             | Passed with Next.js 16.4.3 / Node 24.19.0                                                                          |
| TypeScript / ESLint                            | Passed                                                                                                             |
| Unit + embedded Postgres integration           | 28 passed: 17 domain, 3 provider adapter, 8 database tests                                                         |
| Desktop/mobile Playwright                      | 6 passed; homepage/auth/pricing, anonymous protection, keyboard entry, axe scans                                   |
| Production dependency audit                    | 0 vulnerabilities reported                                                                                         |
| Homepage visual review                         | Sole mobile overlap resolved; scoped ship verdict; private UI not certified                                        |
| Ingestion CLI                                  | Correctly refuses without provider terms approval                                                                  |
| Catalog verification CLI                       | Correctly refuses without Supabase server configuration                                                            |
| Hosted Supabase integration                    | Not run: credentials/test project unavailable                                                                      |
| Authenticated end-to-end journey               | Implemented opt-in, not run: credentials/test catalog unavailable                                                  |
| Stripe test checkout/webhook delivery          | Not run: Stripe credentials unavailable; database event idempotency/refund/deleted-account behavior tested locally |
| Production catalog count / two-source coverage | Unverified; no production database or import                                                                       |
| Vercel deployment                              | Not performed; no authorized project or live URL                                                                   |

The embedded database uses real Postgres via PGlite and executes the full migration, with a small `auth` harness standing in for Supabase-managed identity. It verifies SQL constraints and RLS, not Supabase email delivery, hosted JWT infrastructure, or Stripe signature/event delivery. The actual webhook signature code uses Stripe's official SDK and still requires provider-level testing.

Local public performance: see [performance.json](performance.json). Single unthrottled desktop Chromium sample per route, fresh browser context, local production server. Homepage TTFB ~135ms / LCP 348ms; login TTFB ~85ms / LCP 236ms; pricing TTFB ~10ms / LCP 120ms. These are development-machine measurements, not production/field Core Web Vitals. Authenticated routes and large libraries were not measured.
