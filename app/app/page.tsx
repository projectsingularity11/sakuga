import Link from "next/link";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { account, tonightsPick } from "@/app/actions";
import { AnimeCard } from "@/components/anime-card";
import type { Entry } from "@/lib/domain";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const params = await searchParams;
  const { client, user } = await account();
  const [{ data: profile }, { data, error }] = await Promise.all([
    client
      .from("profiles")
      .select("display_name,preferences")
      .eq("id", user.id)
      .single(),
    client
      .from("library")
      .select("*,anime:anime(*,ratings(*),source_mappings(*))")
      .eq("user_id", user.id)
      .eq("status", "watching")
      .order("updated_at", { ascending: false })
      .limit(8),
  ]);
  if (error) throw Error("Could not load your library. Please retry.");
  const entries = (data || []) as Entry[];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {profile?.display_name
              ? `Welcome home, ${profile.display_name}.`
              : "Make yourself at home."}
          </h1>
          <p>No rush. Your next story is waiting.</p>
        </div>
        <Link className="button" href="/app/discover">
          Discover something <ArrowUpRight size={16} />
        </Link>
      </div>
      {params.notice === "empty-backlog" && (
        <p role="status" className="notice">
          Your backlog is empty. Add a planned title to find tonight’s pick.
        </p>
      )}
      <form action={tonightsPick}>
        <button className="button outline">Tonight’s pick · Surprise me</button>
      </form>
      <h2>Continue your story</h2>
      {entries.length ? (
        <div className="anime-grid">
          {entries
            .filter((e) => e.anime)
            .map((e) => (
              <div key={e.anime_id}>
                <AnimeCard
                  anime={e.anime!}
                  hideMature={profile?.preferences?.hide_mature}
                />
                <p>
                  {e.progress} / {e.anime!.episodes ?? "?"} episodes
                </p>
                <progress
                  value={e.progress}
                  max={e.anime!.episodes || Math.max(1, e.progress)}
                />
              </div>
            ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bookmark size={40} />
          <h2>The beginning of a good collection.</h2>
          <p>
            Add a title from Discover and mark it Watching.
            <br />
            We’ll keep your place right here.
          </p>
          <Link className="button" href="/app/discover">
            Find your first story
          </Link>
        </div>
      )}
      <div className="workspace-note">
        <h2>Make this space yours.</h2>
        <p>
          Save a theme, choose your title language, or organize your favorites
          into collections.
        </p>
        <Link className="text-link" href="/app/settings">
          Set the atmosphere <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );
}
