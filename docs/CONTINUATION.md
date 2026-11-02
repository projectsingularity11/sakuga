# Current delivery

The visual redesign and Supabase connection are implemented. The full baseline import completed. The production release is being verified. Current setup and the exact remaining owner actions are in DEPLOYMENT.md. Local and hosted test evidence is in VALIDATION.md.

The database is real, RLS-protected and contains over 10,000 published canonical works. The full baseline import is complete. AniList and Kitsu enrichment is scheduled and has produced actual metadata and score records. Initial baseline ingestion does not fabricate absent synopses or native titles.

Remaining launch boundaries: production Auth URL/SMTP and inbox verification, Stripe webhook/server credentials and payment verification, explicit approval for the permanent account-deletion endpoint, owner review of commercial provider/artwork terms and legal contact copy. Account deletion and purchases remain disabled until their corresponding setup is complete.

Existing product limitations: smart collections use supported rule presets; no drag/drop or general visual rule builder. JSON import/export currently supports 2,000 library entries and does not export full profile/collection/history. No third-party ad network or OAuth providers. Authenticated browser and large-library performance measurements have not been claimed. See implementation details in the application and architecture docs.

## Remote database snapshot

Verified after baseline import: **20,687 total canonical works; 20,084 published; 305 quarantined; 298 excluded**. Live provider classification can change these counts. All 20,687 have cross-provider mappings. One potential duplicate title/year/format group is flagged for operator review; canonical IDs are distinct.

At this snapshot: 904 published works lack an allowed image, 19,395 lack a synopsis, and non-null score coverage is 720 AniList / 715 Kitsu. The baseline does not contain synopses, so **the claim that every one of 10,000 titles has every field is not met**. The live refresh is functioning and scheduled to fill upstream metadata; fields unavailable upstream remain explicitly missing. No synthetic scores or descriptions are substituted.

Auth URL configuration was saved by the owner and verified remotely: Supabase returned redirects to both the production site root and exact `/auth/callback`. Verification used an intentionally invalid token and inspected only redirect locations; it did not claim a real confirmation email had been delivered. Password auth and sessions have the separate hosted test evidence above.

Local production performance sample: homepage LCP 616 ms / TTFB 339 ms; fresh desktop Chromium, no throttling, single local sample. This is not a production/field performance claim.
