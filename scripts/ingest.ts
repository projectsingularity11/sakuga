import { operator } from "./client";
import { anilistPage, malRating, plainSynopsis } from "../lib/providers";
import { eligible, trustedImage } from "../lib/domain";
if (process.env.PROVIDER_TERMS_APPROVED !== "true")
  throw Error(
    "Import disabled: review provider access, commercial use, redistribution, attribution and image rights, then set PROVIDER_TERMS_APPROVED=true. See docs/PROVIDERS.md.",
  );
const client = operator();
const maxPages = Number(
  process.argv.find((a) => a.startsWith("--pages="))?.split("=")[1] || 1000,
);
const restart = process.argv.includes("--refresh");
const { data: job, error: jobError } = await client
  .from("ingestion_jobs")
  .select("*")
  .eq("provider", "anilist")
  .maybeSingle();
if (jobError) throw jobError;
let page = restart ? 1 : job?.page || 1;
const check = ({ error }: { error: unknown }) => {
  if (error) throw error;
};
for (let n = 0; n < maxPages; n++, page++) {
  try {
    const batch = await anilistPage(page);
    for (const m of batch.media) {
      let decision = eligible({ genres: m.genres, adult: m.isAdult });
      const { data: manualMapping, error: mappingError } = await client
        .from("source_mappings")
        .select("external_id,manual")
        .eq("anime_id", m.id)
        .eq("provider", "mal")
        .maybeSingle();
      if (mappingError) throw mappingError;
      const malId = manualMapping?.manual
        ? Number(manualMapping.external_id)
        : m.idMal;
      let mal = null;
      if (malId && process.env.MAL_CLIENT_ID) {
        await new Promise((r) => setTimeout(r, 1200));
        mal = await malRating(malId);
        if (mal?.rating === "rx")
          decision = {
            state: "excluded",
            reason: "MyAnimeList Rx pornography classification",
          };
      }
      const { data: override, error: overrideError } = await client
        .from("moderation_overrides")
        .select("*")
        .eq("anime_id", m.id)
        .maybeSingle();
      if (overrideError) throw overrideError;
      if (override)
        decision = { state: override.decision, reason: override.reason };
      check(
        await client
          .from("anime")
          .upsert(
            {
              id: m.id,
              title: m.title.english || m.title.romaji,
              title_romaji: m.title.romaji,
              title_native: m.title.native,
              synonyms: m.synonyms,
              synopsis: plainSynopsis(m.description),
              cover_url:
                decision.state === "published"
                  ? trustedImage(m.coverImage.large)
                  : null,
              format: m.format,
              year: m.seasonYear,
              season: m.season,
              airing_status: m.status,
              episodes: m.episodes || null,
              duration: m.duration || null,
              genres: m.genres,
              studios: m.studios.nodes.map((s) => s.name),
              popularity: m.popularity,
              moderation: decision.state,
              moderation_reason: decision.reason,
              mature: m.isAdult || m.genres.includes("Ecchi"),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          ),
      );
      const mappings = [
        {
          provider: "anilist",
          external_id: String(m.id),
          url: `https://anilist.co/anime/${m.id}`,
          provenance: "AniList canonical ID",
        },
      ];
      if (m.idMal)
        mappings.push({
          provider: "mal",
          external_id: String(m.idMal),
          url: `https://myanimelist.net/anime/${m.idMal}`,
          provenance: "AniList idMal cross-provider identifier",
        });
      for (const mapping of mappings) {
        const { data: existing, error } = await client
          .from("source_mappings")
          .select("manual,external_id")
          .eq("anime_id", m.id)
          .eq("provider", mapping.provider)
          .maybeSingle();
        if (error) throw error;
        if (existing?.manual) continue;
        check(
          await client
            .from("source_mappings")
            .upsert(
              { ...mapping, anime_id: m.id, confidence: 1, verified: true },
              { onConflict: "anime_id,provider" },
            ),
        );
      }
      const ratings: {
        anime_id: number;
        provider: string;
        score: number | null;
        scale: number;
        votes: number | null;
        refreshed_at: string;
      }[] = [
        {
          anime_id: m.id,
          provider: "anilist",
          score: m.averageScore,
          scale: 100,
          votes: null,
          refreshed_at: new Date().toISOString(),
        },
      ];
      if (mal)
        ratings.push({
          anime_id: m.id,
          provider: "mal",
          score: mal.mean ?? null,
          scale: 10,
          votes: mal.num_scoring_users ?? null,
          refreshed_at: new Date().toISOString(),
        });
      check(
        await client
          .from("ratings")
          .upsert(ratings, { onConflict: "anime_id,provider" }),
      );
    }
    check(
      await client
        .from("ingestion_jobs")
        .upsert({
          provider: "anilist",
          page: page + 1,
          status: batch.pageInfo.hasNextPage ? "running" : "complete",
          last_error: null,
          updated_at: new Date().toISOString(),
        }),
    );
    console.log(
      JSON.stringify({
        page,
        processed: batch.media.length,
        nextPage: page + 1,
      }),
    );
    if (!batch.pageInfo.hasNextPage) break;
    await new Promise((r) => setTimeout(r, 2200));
  } catch {
    await client
      .from("ingestion_jobs")
      .upsert({
        provider: "anilist",
        page,
        status: "failed",
        last_error:
          "Page failed; rerun to retry idempotently. Inspect provider availability and database constraints.",
        updated_at: new Date().toISOString(),
      });
    throw Error(
      `Ingestion stopped on page ${page}; checkpoint retained. Check provider authorization, schema and network.`,
    );
  }
}
