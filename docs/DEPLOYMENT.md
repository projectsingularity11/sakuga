# Production setup

Vercel: existing `sakuga` project `prj_jigbpVE0uZadIAZoRyhYPViHW2gc`, team `team_zQJh0y9soqRrLxA9F2AChFKO`, canonical URL https://sakuga-anime.vercel.app (the existing pink alias redirects there) . Next.js, Node 24.x, `npm ci`, `npm run build`.

Supabase: `Sakuga`, ref `odqnbkbffzpdphsyeryf`, Assirem's Org, US East (Ohio). Four committed migrations match applied production migration versions. All application tables have RLS; private billing and operator tables have no client write path. Modern publishable key and project URL are configured for all Vercel environments. Production SITE_URL uses the canonical anime domain. AUTH_CALLBACK_ORIGIN preserves the owner-approved pink callback alias during the existing redirect. The public health endpoint `/api/health` checks actual published title count and database connectivity.

## Remaining owner configuration

1. **Auth URLs:** https://supabase.com/dashboard/project/odqnbkbffzpdphsyeryf/auth/url-configuration . Site URL `https://sakuga-pink.vercel.app`. Add exact redirect URLs `https://sakuga-pink.vercel.app/auth/callback` and `https://sakuga-pink.vercel.app/auth/callback?next=/reset-password`. Add localhost only for deliberate development. The available connected tools cannot change Auth configuration; the owner saved these settings and remote verification confirmed both the production root and exact callback redirect destinations. Password login/session restoration were verified against actual confirmed disposable accounts. Signup email delivery and recovery still require a real inbox check. Configure production SMTP for public signup scale and enable leaked-password protection if the plan supports it.
2. **Billing:** the installed Vercel integration supplies `Sakuga_STRIPE_SECRET_KEY`; the app now recognizes that name. Checkout stays disabled until STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY are securely configured. Register `/api/webhook` in Stripe test mode for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`. Test signed webhook delivery/idempotency/refunds before live purchases. No payment was initiated and no paid entitlement was invented.
3. **Account deletion:** the implementation is in `supabase/functions/account-delete/index.ts`. Automatic approval review rejected deployment because permanent deletion requires specific owner authorization. The endpoint remains undeployed; ACCOUNT_DELETION_ENABLED defaults false and settings accurately show the unavailable state. After approval, deploy the function, verify with a disposable account, then set ACCOUNT_DELETION_ENABLED=true in Vercel and redeploy. Never enable the flag before deployment.
4. **Commercial launch:** confirm upstream API and artwork permissions; supply business/privacy contacts and reviewed policies. This is separate from verified technical deployment.

## Catalog operation

The ODbL baseline is imported using the committed deterministic script. It stores canonical AniList IDs and preserves reviewed mappings. The scheduled Supabase catalog-refresh function then fills source metadata and individual AniList/Kitsu scores. A real catalog row count does not imply every synopsis or score is available. See PROVIDERS.md and VALIDATION.md for actual coverage.

Supabase Cron job `sakuga-catalog-refresh` runs once per minute via pg_net. A high-entropy scoped invocation key lives in Supabase Vault as `sakuga_catalog_job_key`; only its SHA-256 verification digest is committed. The endpoint additionally requires a valid project JWT. Database leases prevent overlapping refreshes. Catalog work never runs inside a Vercel request. Inspect `ingestion_jobs`, `cron.job_run_details`, `net._http_response`, and `catalog_health()` through an authorized operator. The net response table is server-only and may hold operator test results; never grant it to clients.

## Release verification

Run typecheck, lint, unit/database tests, production build, and public desktop/mobile browser tests. Confirm `/api/health` on the actual deployment returns ready and the expected real count. Confirm anonymous private-route redirect, real search, a representative detail, source attribution and cover image responses. Private library RLS was exercised by 23 hosted backend assertions in addition to local integration tests. The operator-only hosted check endpoint is disabled after the run; its source remains for explicit future deployment on a disposable project.

Do not reset this production database to run tests. Do not expose service keys in NEXT_PUBLIC variables or client code. Default ad scripts remain off.

Current deployment confirmed READY: `dpl_7wNzizLhFWgNDT9Zs178vZYkS7Hv`, commit `b84bea8`. The publicly fetched `/api/health` returned ready with 20,087 titles. A small follow-up release aligns canonical site links with the pre-existing sakuga-anime alias while preserving the approved pink email callback.

Final production release: `dpl_EbRVWd1q7z5yFbc4aaSuTPWjzpy6`, commit `dda51fc`, READY. Health/search/detail/anonymous private-route checks passed against the public canonical alias. Documentation and Edge Function-only commits skip Vercel rebuilds; Edge Functions are deployed separately via Supabase.
