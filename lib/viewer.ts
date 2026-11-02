import "server-only";
import { cache } from "react";
import { db, configured } from "./supabase";
// Request-scoped only: never share a viewer or their preferences across users.
export const viewer = cache(async () => {
  if (!configured()) return null;
  const client = await db();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await client
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .maybeSingle();
  return { user, preferences: data?.preferences };
});
export const viewerLanguage = cache(async () => {
  const profile = await viewer();
  return ["english", "romaji", "native"].includes(
    profile?.preferences?.language,
  )
    ? (profile!.preferences.language as string)
    : "english";
});
export const viewerSignedIn = cache(async () => !!(await viewer()));
