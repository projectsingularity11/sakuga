import { viewerLanguage } from "@/lib/viewer";
import { resolveTitle, alternateTitles, qualifiedCover } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Bookmark } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { AnimeCard } from "@/components/anime-card";
import { db, configured } from "@/lib/supabase";
import { trustedImage, trustedSource, type Anime } from "@/lib/domain";
export default async function AnimeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const language = await viewerLanguage();
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id) || !configured()) notFound();
  const client = await db();
  const { data, error } = await client
    .from("anime")
    .select("*,ratings(*),source_mappings(*)")
    .eq("id", id)
    .eq("moderation", "published")
    .maybeSingle();
  if (error) throw Error("Could not load this title. Please retry.");
  if (!data) notFound();
  const a = data as Anime;
  const image = trustedImage(qualifiedCover(a));
  const { data: related } = await client
    .from("anime")
    .select("*,ratings(*),source_mappings(*)")
    .eq("moderation", "published")
    .overlaps("genres", a.genres.slice(0, 2))
    .neq("id", a.id)
    .order("popularity", { ascending: false, nullsFirst: false })
    .order("id")
    .limit(4);
  return (
    <>
      <PublicNav />
      <main id="main" className="public-dossier">
        <Link className="text-link" href="/discover">
          <ArrowLeft size={15} />
          Back to discovery
        </Link>
        <div className="dossier">
          <div className="dossier-cover">
            {image ? (
              <Image
                src={image}
                alt={`${resolveTitle(a, language)} cover`}
                width={300}
                height={440}
                priority
              />
            ) : (
              <div className="cover-placeholder">Artwork unavailable</div>
            )}
          </div>
          <div>
            <p className="muted">
              {a.format || "Anime"} · {a.year || "Year unknown"} ·{" "}
              {a.episodes ?? "Unknown"} episodes
            </p>
            <h1>{resolveTitle(a, language)}</h1>
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
              {a.synopsis ||
                "The source has not supplied a synopsis yet. Explore the provider pages below for more about this story."}
            </p>
            <p className="muted">
              {a.studios.join(" · ")}
              {a.duration && ` · ${a.duration} minutes per episode`}
            </p>
            <Link className="button" href={`/app/anime/${a.id}`}>
              <Bookmark size={17} />
              Add to my library
            </Link>
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
