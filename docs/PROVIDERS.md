# Catalog sources and content policy

## Production sources

The initial catalog imports the **2026-27 anime-offline-database release (2026-07-04)** by manami-project, licensed under ODbL 1.0 + DbCL 1.0. Original source: https://github.com/manami-project/anime-offline-database . License: https://github.com/manami-project/anime-offline-database/blob/2026-27/LICENSE . The original download is public at https://github.com/manami-project/anime-offline-database/releases/download/2026-27/anime-offline-database-minified.json . Preserve attribution and the license when redistributing the database. Provide the corresponding derivative database under the applicable ODbL terms; the original snapshot and committed deterministic importer reproduce the baseline. Private user libraries, notes and accounts are separate tables and are never included in public database exports.

The baseline supplies actual works, synonyms, release format/year/season, known episodes/runtime, studios, genres and explicit cross-provider IDs. Only records with canonical AniList IDs are imported. The source's aggregate scores are deliberately **not** stored as individual provider ratings. The source does not supply synopses or native/English title variants; those fields are populated by the live refresh rather than fabricated.

- **AniList:** official GraphQL https://graphql.anilist.co . Original score /100, titles, synopsis, artwork, genres, episode metadata, classification, and membership popularity. Popularity is not a rating vote count. Documentation: https://docs.anilist.co .
- **Kitsu:** official JSON API https://kitsu.io/api/edge/anime/{id} using the dataset's explicit Kitsu mapping. Original averageRating /100. userCount is a membership count and is NOT displayed as scoring votes. Documentation: https://kitsu.docs.apiary.io .
- **MyAnimeList:** baseline explicit source links and cover URLs. The optional official API adapter remains available with MAL_CLIENT_ID; live MAL scores are not claimed without that credential.
- **Anime-Planet:** no scraping or scores.

The production catalog-refresh Edge Function has returned real successful AniList and Kitsu updates. Its scheduled refresh processes 40 IDs per invocation with four concurrent Kitsu requests. Errors are checkpointed, requests time out, overlapping runs are excluded by a database lease, and failed secondary ratings remain missing. A full sweep cycles back to the first ID. Report actual field coverage from SQL, not the number of imported rows.

## Screening

Pornography/hentai and explicit sexual classification tags are excluded. Borderline porn, erotica, adult-audience-only classifications and untagged records are quarantined. Gore, adult casts, mature stories, ecchi and violence alone do not exclude a work. Public RLS restricts canonical records, mappings and ratings to published works. AniList refresh reapplies its adult/content classifications; operator overrides always take precedence. Source labels are imperfect, so reporting and manual review remain necessary. This is automated screening, not certification that every record has had a human review.

## Rights and operating limits

ODbL licenses the metadata database; it does not transfer copyright in anime artwork or guarantee every upstream API's commercial terms. Covers retain their original source attribution. The original homepage scene is generated for Sakuga. Authoritative provider terms/reference pages were inaccessible from this workspace's network, so current commercial API permission and image redistribution terms still require owner review before a commercial launch. Do not treat this document as legal approval.

## Reproduce the baseline

Download the named release above, then run:

```sh
npm run catalog:import-offline -- --file=/path/to/anime-offline-database-minified.json --dry-run
npm run catalog:import-offline -- --file=/path/to/anime-offline-database-minified.json
npm run catalog:verify
```

Normal import requires server database credentials. `--sql-dir=/tmp/sakuga-import` generates transaction batches for a trusted SQL operator instead, without credentials. Existing titles and reviewed mappings are preserved. Use the same release for identical counts; `latest` can change.
