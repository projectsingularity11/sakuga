import { MediaLinks } from "@/components/media-links";
import { AnimeBackdrop } from "@/components/anime-backdrop";
import { englishSynopsis, releaseDescription } from "@/lib/media";
import { CoverImage } from "@/components/cover-image";
import { viewerLanguage } from "@/lib/viewer";
import { resolveTitle, alternateTitles, qualifiedCover } from "@/lib/metadata";
import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { loadShow } from "@/lib/show";
import { SeasonPicker } from "@/components/season-picker";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Bookmark } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { AnimeCard } from "@/components/anime-card";
import { db, configured } from "@/lib/supabase";
import { trustedImage, trustedSource, type Anime } from "@/lib/domain";
export default async function AnimeDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const language = await viewerLanguage();
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id) || !configured()) notFound();
  const client = await db();
  const season = (await searchParams).season;
  const loaded = await loadShow(client, id, season);
  if (!loaded) notFound();
  const { anime: a, show, members } = loaded;
  if (Number(id) !== show.id) redirect(`/anime/${show.id}?season=${a.id}`);
  const image = trustedImage(qualifiedCover(a));
  const related = await catalog({ genre: a.genres[0] || "" })
    .then((result) =>
      result.titles.filter((row) => row.id !== show.id).slice(0, 4),
    )
    .catch(() => []);
  return (
    <>
      <PublicNav />
      <main id="main" className="public-dossier">
        <AnimeBackdrop key={a.id} id={a.id} src={image} />
        <Link className="text-link" href="/discover">
          <ArrowLeft size={15} />
          Back to discovery
        </Link>
        <div className="dossier">
          <div className="dossier-cover">
            <CoverImage
              src={image}
              id={a.id}
              title={resolveTitle(a)}
              priority
            />
          </div>
          <div>
            <p className="muted">
              {a.format || "Anime"} · {a.year || "Year unknown"} ·{" "}
              {a.episodes ?? "Unknown"} episodes
            </p>
            <h1>{resolveTitle(show, language)}</h1>
            <SeasonPicker
              members={members}
              showId={show.id}
              selected={a.id}
              language={language}
            />
            <Link className="button detail-primary" href={`/app/anime/${a.id}`}>
              <Bookmark size={17} />
              Add to my library
            </Link>
            <p className="alternate">
              {alternateTitles(a, language).join(" / ")}
            </p>
            <div className="tags">
              {a.genres.map((g) => (
                <Link href={`/discover?genre=${encodeURIComponent(g)}`} key={g}>
                  {g}
                </Link>
              ))}
              {a.mature && <span>Mature themes</span>}
            </div>
            <p className="synopsis">
              {englishSynopsis(a) || releaseDescription(a)}
            </p>
            {!englishSynopsis(a) && (
              <p className="metadata-note">
                Release information · an English story synopsis has not been
                supplied yet.
              </p>
            )}
            <MediaLinks anime={a} />

            <p className="muted">
              {a.studios.join(" · ")}
              {a.duration && ` · ${a.duration} minutes per episode`}
            </p>

            <h2>From the sources</h2>
            <div className="ratings">
              {a.ratings
                .filter((r) => r.score !== null)
                .map((r) => (
                  <article key={r.provider}>
                    <span>{r.provider.toUpperCase()}</span>
                    <strong>
                      {r.score}
                      <small> / {r.scale}</small>
                    </strong>
                    <small>
                      Updated{" "}
                      {new Date(r.refreshed_at).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </small>
                  </article>
                ))}
            </div>
            {!a.ratings.some((r) => r.score !== null) && (
              <p className="muted">
                Source ratings are awaiting refresh. No estimated scores are
                substituted.
              </p>
            )}
            <div className="source-links">
              {a.source_mappings
                .filter((s) => trustedSource(s.url))
                .map((s) => (
                  <a
                    className="text-link"
                    href={s.url}
                    key={s.provider}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.provider === "mal"
                      ? "MyAnimeList"
                      : s.provider === "anilist"
                        ? "AniList"
                        : "Kitsu"}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
            </div>
            <p className="art-attribution">
              Cross-provider metadata: anime-offline-database, ODbL. Artwork
              belongs to its respective owners.
            </p>
          </div>
        </div>
        {!!related?.length && (
          <section>
            <h2>Keep exploring</h2>
            <div className="anime-grid">
              {related!.map((r) => (
                <AnimeCard
                  key={r.id}
                  anime={r as Anime}
                  language={language}
                  publicPage
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
