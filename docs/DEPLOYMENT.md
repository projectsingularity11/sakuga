# Deployment to Vercel (not performed)

1. Identify your intended Supabase and Vercel projects. No resources have been created or changed remotely by this task. Never use a production reset for testing.
2. Install Supabase CLI using official instructions. Authenticate through your normal secure workflow, link the intended project (`supabase link --project-ref YOUR_REF`), review the migration, then `npm run db:setup`. The committed SQL enables all required RLS and service-only billing/health functions. Back up an existing database first; this initial migration is meant for an empty dedicated project.
3. In Supabase Auth enable email sign-in, email confirmation and production SMTP. Set Site URL to the production origin. Add exact callback URLs for localhost, production and each approved preview deployment; callback `/auth/callback`, password recovery `/auth/callback?next=/reset-password`. Do not use unrestricted redirect wildcards. Exercise signup, confirmation, login, session refresh, recovery, logout and deletion against the actual project.
4. Configure `.env.example` names in Vercel. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are intentionally public, protected by RLS. `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `MAL_CLIENT_ID` are server-only. Use the production canonical `NEXT_PUBLIC_SITE_URL` and correct per-preview origin. Keys must never be committed.
5. Use Stripe **test mode first**. Configure `/api/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`. Hosted checkout creates the fixed $5 price server-side. Verify Stripe signature failures, retries, repeated delivery, delayed payments and refund/dispute revocation before live mode. No payment has been initiated. A won dispute may still require operator reconciliation if Stripe retains the disputed charge marker; do not manually grant by browser state.
6. Review provider commercial/redistribution/image permissions and network access per PROVIDERS.md. Run development seed against a nonproduction database, then the long-running importer on a suitable worker/operator machine. Resume interruptions, verify >10,000 distinct eligible works and at least two real ratings sources. Do not run the entire import inside a Vercel HTTP handler.
7. In Vercel select the existing intended account/project, Node 24, Next.js framework, build `npm run build`, install `npm ci`, default Next.js output. This repository needs no custom cron. Do not deploy without identifying and authorizing the target project. Build success is not deployment success.
8. Run the smoke checklist below; only then authorize a production launch. Source image hosts are explicitly configured; CSP restricts scripts/connect/frame/image destinations. Add a custom Supabase domain to CSP before using one.

## Production acceptance / smoke checklist

- Public marketing accessible without login; anonymous `/app/*` redirects, private responses no-store.
- Two disposable users cannot read/write each other's notes, progress, collections or purchases.
- All auth flows including recovery and refresh verified with production redirect/SMTP configuration.
- Import real catalog, inspect reports/quarantine, run `catalog:verify`, review duplicate groups and two-source coverage.
- Search English/romaji/native/synonyms, combine filters, view source scores, add/update/remove progress, collect and smart-filter, save/reload themes, export/import.
- Stripe test success does not grant access until signed webhook; retries idempotent, refunds revoke.
- Confirm no ads or ad scripts by default, or before consent/for entitled accounts when a network is later integrated.
- Validate desktop/mobile/keyboard and measure representative authenticated pages, including a large library.
- Supply privacy contact/business identity/refund/jurisdiction policies and obtain legal review. Configure operational alerting and database backups.

No live URL exists from this task. Publication of a cloud development environment is separate from Vercel application deployment.
