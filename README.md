# Sakuga

A personal anime sanctuary built with Next.js App Router, strict TypeScript, Supabase Postgres/Auth and Stripe Checkout. **Not launched:** real provider ingestion, hosted auth and Stripe end-to-end tests require external setup. No mock catalog or invented ratings are used.

## Local development

Requires Node 24 (tested: 24.19.0), npm 11. Run `npm ci`, copy `.env.example` to `.env.local` and configure it securely, then `npm run dev`. Without keys the public site and auth-unavailable states run; private routes redirect to login. Do not put server keys in `NEXT_PUBLIC_*` variables.

## Commands

| Command                                                  | Purpose                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                                            | Development server                                                          |
| `npm run build` / `npm start`                            | Production build / server                                                   |
| `npm run typecheck`                                      | Strict TypeScript                                                           |
| `npm run lint`                                           | Next.js ESLint                                                              |
| `npm test`                                               | Unit + embedded Postgres migration/RLS tests                                |
| `npm run test:integration`                               | Embedded Postgres integration suite; hosted tests use `test:live`           |
| `npm run test:live`                                      | Hosted Supabase ownership smoke test (disposable test project only)         |
| `npm run test:e2e`                                       | Desktop/mobile Chromium public/auth-boundary/accessibility tests            |
| `npm run db:setup`                                       | Supabase CLI `db push`, after linking the intended project                  |
| `npm run seed`                                           | One real provider page, gated by provider approval and credentials          |
| `npm run catalog:ingest -- --pages=20`                   | Resume ingestion; `--refresh` starts a new refresh from page 1              |
| `npm run catalog:verify`                                 | Database catalog health; nonzero exit below 10,000 published distinct works |
| `npx tsx scripts/moderate.ts ID STATE 'reason'`          | Audited manual moderation override                                          |
| `npx tsx scripts/mapping.ts ID mal EXTERNAL_ID 'reason'` | Correct mapping, invalidate old rating, preserve override                   |

CLI scripts read the process environment, not `.env.local` automatically. Use your secret manager or Node's `--env-file=.env.local` with the tsx import: `node --use-env-proxy --env-file=.env.local --import tsx scripts/verify.ts`. Never source an untrusted environment file as shell code.

Supabase CLI is an external operator prerequisite; install it via its supported distribution or run `npx supabase` after checking the intended project. No remote project is created automatically. See [deployment](docs/DEPLOYMENT.md), [provider policy](docs/PROVIDERS.md), [operations](docs/OPERATIONS.md), [architecture](docs/ARCHITECTURE.md), and [actual readiness](docs/CONTINUATION.md).
