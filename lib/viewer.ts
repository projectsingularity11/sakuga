import "server-only";
import { cache } from "react";
import { db, configured } from "./supabase";
export const viewerLanguage = cache(async () => {
  if (!configured()) return "english";
  try {
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return "english";
    const { data } = await client
      .from("profiles")
      .select("preferences")
      .eq("id", user.id)
      .maybeSingle();
    return ["english", "romaji", "native"].includes(data?.preferences?.language)
      ? (data!.preferences.language as string)
      : "english";
  } catch {
    return "english";
  }
});
