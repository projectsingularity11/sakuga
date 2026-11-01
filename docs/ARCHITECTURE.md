# Architecture

Next.js 16 / React 19 server components render account-scoped pages. Client components handle library edits, theme previews, and import confirmation. Server Actions validate with Zod, call `getUser()`, then use the authenticated Supabase client. The proxy refreshes cookies. No privileged client is used for normal library operations. Auth redirects accept only local absolute paths. Provider markup is stripped and rendered as React text, never injected HTML.

Supabase owns identity and persistence. RLS applies to every table: published catalog reads, owner-only library/profile/collections/history, server-only ingestion/audit/webhook writes, read-only user entitlements. Composite membership foreign keys enforce the same owner for both collection and canonical library entry. One `(user_id, anime_id)` key tracks progress; viewing events retain previous progress/status through rewatches. Rewatches are an explicit counter; there is no separate cycle timeline editor yet.

The canonical anime ID currently equals its AniList ID. AniList `idMal` supplies the strong MAL mapping; no title-based merging occurs. Aliases are searched through a generated indexed search field. Raw source values, scales, sample size when available, and refresh dates are stored separately. No aggregate is computed. Per-provider pages are cached in Postgres; page views never call providers.

Catalog and library queries paginate on the server (24 and 100 titles). Counts and personal statistics are database aggregates. Public catalog RLS hides restricted metadata, mappings and ratings; restricted library references persist without public artwork. Missing images use typographic placeholders. No images are downloaded into a cache. Image/source URL allowlists avoid arbitrary remote fetches.

Theme CSS variables provide bounded ambient tint while foreground/surface tokens remain controlled. Validated server preferences render on the root before hydration; an OS media query handles system mode. Changes preview immediately and save server-side. No local storage substitutes for authenticated persistence.

Payments use server-generated USD 500-cent one-time Checkout, signed webhooks and an atomic service-only Postgres function. Event IDs are unique. Current Stripe payment/charge state is reconciled before writes; refunds/disputes revoke access. Multiple purchases are considered when revoking an entitlement. The app never grants entitlement from a return URL. No advertising code is loaded; `adsEligible` is a central future feature/consent/entitlement gate. Consent-provider and ad-network integration are intentionally not active.

Long-running ingestion is an operator process, not a Vercel request. Page checkpoints advance only after every record write succeeds; replay is idempotent. Manual mapping/moderation overrides survive refresh. Logs contain page/error classes, not credentials or private notes.
