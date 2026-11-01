# Operations runbook

## Development environment

Use the existing `/workspace/sakuga` checkout; each cloud task is isolated, so do not create a worktree unless requested. `npm ci` restores locked dependencies. `npm run dev` starts a fresh process; a retained filesystem does not preserve servers. Validate by a local HTTP request and the tests. No cloud configuration drafts or environment publications are changed by this implementation.

## Ingestion

Set credentials securely in process environment and complete provider policy review. `npm run seed` imports one real page. `npm run catalog:ingest -- --pages=20` resumes the stored checkpoint; `--refresh` restarts at page 1 for updates without duplicating works. Schedule refresh externally at a cadence permitted by providers. Page boundaries are the checkpoint: partial pages replay safely. HTTP 429/5xx use bounded retry/backoff; nonretryable 4xx or exhausted retries stop the page without advancing. Transport failure stops safely for manual retry. Do not hammer a denied endpoint.

`catalog:verify` reports published distinct count, formats, missing images/synopsis, mapping coverage, score coverage, quarantine, potential duplicates and stale records; exit code 1 below 10,000. Mapping/ratings coverage includes raw stored records and may include quarantined titles; compare to published counts during review. Investigate duplicate groups before claiming deduplication is verified. Because pagination follows a live popularity ranking, membership changes during a full run can move titles between pages; refresh and verification are necessary. No immutable provider snapshot is promised.

## Moderation / mappings

Server allowlist `ADMIN_USER_IDS` contains Supabase user UUIDs; profiles cannot grant admin access. `/app/admin` shows health, jobs and recent reports. Use operator CLI with service credentials and `OPERATOR_ID` for updates. Moderation states: published, quarantine, excluded. A manual override survives ingestion; publishing requires human metadata/artwork review. Mapping correction is atomic with stale rating deletion and an audit entry. Refresh then fetches the manually selected MAL ID. Do not remap the canonical AniList ID to an unrelated work. Kitsu mapping corrections do not create a Kitsu integration.

## Billing

Never use a success URL to grant access. Inspect Stripe events, payment intent/charge state and `webhook_events`, `purchases`, `entitlements` together. The webhook transaction commits receipt and entitlement together; failures return 500 for retry. Full or partial refund events conservatively revoke that purchase. Disputes conservatively revoke; won disputes may require reconciliation. Separate still-paid purchases can preserve the account entitlement. Account deletion anonymizes internal purchase ownership via FK SET NULL; provider-held records remain. Later events for a deleted account update anonymized purchase records without recreating an account or granting an entitlement.

## Privacy, exports, limits and observability

Exports are Sakuga v1 JSON or CSV. They include library fields and notes, not collection definitions/history/profile; full data portability still needs an expanded export. Export limit 2,000 entries; larger account requires operator assistance. JSON imports validate 2 MB / 2,000 rows, preview matched/unmatched/existing IDs, last duplicate row wins, then explicit skip/replace confirmation. Unsupported provider list formats are not silently accepted.

No raw secrets, credentials or private notes are logged. Content reports are private and admin-readable. Configure alerts on failed ingestion jobs, stale records, webhook 5xx and auth errors at the hosting provider before public launch. Dependency audit is a point-in-time check. No full production monitoring service is currently connected.
