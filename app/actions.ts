"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, configured } from "@/lib/supabase";
import {
  entrySchema,
  ruleSchema,
  safeReturn,
  themeSchema,
  parseImport,
} from "@/lib/domain";
export async function account() {
  if (!configured()) redirect("/login?notice=setup");
  const client = await db();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  return { client, user };
}
function fail(message: string): never {
  throw Error(message);
}
export async function authenticate(form: FormData) {
  const mode = String(form.get("mode"));
  if (!configured()) redirect("/login?notice=setup");
  const client = await db();
  const email = z.email().parse(form.get("email"));
  const password = String(form.get("password") || "");
  const origin =
    process.env.AUTH_CALLBACK_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) redirect("/login?notice=setup");
  let error;
  if (mode === "reset") {
    ({ error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    }));
  } else if (mode === "signup") {
    z.string().min(10).max(128).parse(password);
    ({ error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    }));
  } else {
    ({ error } = await client.auth.signInWithPassword({ email, password }));
  }
  if (error) redirect(`/login?notice=failed`);
  if (mode === "signup" || mode === "reset") redirect("/login?notice=email");
  redirect(safeReturn(String(form.get("next") || "/app")));
}
export async function logout() {
  const { client } = await account();
  await client.auth.signOut();
  redirect("/login");
}
export async function resetPassword(form: FormData) {
  const { client } = await account();
  const password = z.string().min(10).max(128).parse(form.get("password"));
  const { error } = await client.auth.updateUser({ password });
  if (error) fail("Password could not be updated. Request another reset link.");
  redirect("/app/settings");
}
export async function saveEntry(input: unknown) {
  const value = entrySchema.parse(input);
  const { client, user } = await account();
  const { data: a } = await client
    .from("anime")
    .select("id,episodes")
    .eq("id", value.anime_id)
    .single();
  if (!a) fail("This title is unavailable.");
  if (a.episodes !== null && value.progress > a.episodes)
    fail("Progress exceeds the known episode count.");
  const { error } = await client
    .from("library")
    .upsert({ ...value, user_id: user.id }, { onConflict: "user_id,anime_id" });
  if (error) fail("Library update failed. Please retry.");
  revalidatePath("/app", "layout");
}
export async function removeEntry(id: number) {
  const { client, user } = await account();
  const { error } = await client
    .from("library")
    .delete()
    .eq("user_id", user.id)
    .eq("anime_id", z.number().int().positive().parse(id));
  if (error) fail("Could not remove title.");
  revalidatePath("/app", "layout");
}
export async function createCollection(form: FormData) {
  const { client, user } = await account();
  const name = z.string().trim().min(1).max(100).parse(form.get("name"));
  const raw = String(form.get("rules") || "");
  const rules = raw ? ruleSchema.parse(JSON.parse(raw)) : null;
  const { error } = await client
    .from("collections")
    .insert({ user_id: user.id, name, rules });
  if (error) fail("Could not create collection.");
  revalidatePath("/app/collections");
}
export async function membership(form: FormData) {
  const { client, user } = await account();
  const collection_id = z.uuid().parse(form.get("collection_id"));
  const anime_id = z.coerce
    .number()
    .int()
    .positive()
    .parse(form.get("anime_id"));
  const remove = form.get("remove") === "true";
  const query = remove
    ? client
        .from("collection_members")
        .delete()
        .eq("collection_id", collection_id)
        .eq("user_id", user.id)
        .eq("anime_id", anime_id)
    : client
        .from("collection_members")
        .upsert(
          { collection_id, anime_id, user_id: user.id },
          { onConflict: "collection_id,anime_id" },
        );
  const { error } = await query;
  if (error)
    fail("Could not update collection. Add the title to your library first.");
  revalidatePath("/app/collections", "layout");
}
export async function deleteCollection(form: FormData) {
  const { client, user } = await account();
  const { error } = await client
    .from("collections")
    .delete()
    .eq("id", z.uuid().parse(form.get("id")))
    .eq("user_id", user.id);
  if (error) fail("Could not delete collection");
  redirect("/app/collections");
}
export async function savePreferences(input: unknown) {
  const { client, user } = await account();
  const value = z
    .object({
      theme: themeSchema,
      display_name: z.string().trim().max(80),
      language: z.enum(["english", "romaji", "native"]),
      hide_mature: z.boolean(),
    })
    .parse(input);
  const { error } = await client
    .from("profiles")
    .update({
      display_name: value.display_name,
      preferences: {
        theme: value.theme,
        language: value.language,
        hide_mature: value.hide_mature,
      },
    })
    .eq("id", user.id);
  if (error) fail("Preferences could not be saved.");
  revalidatePath("/app", "layout");
}
export async function reportContent(form: FormData) {
  const { client, user } = await account();
  const { error } = await client.from("content_reports").insert({
    user_id: user.id,
    anime_id: z.coerce.number().int().positive().parse(form.get("anime_id")),
    reason: z.string().min(5).max(2000).parse(form.get("reason")),
  });
  if (error) fail("Could not send report.");
  revalidatePath("/app");
}
export async function importLibrary(text: string, merge: "skip" | "replace") {
  const parsed = parseImport(text);
  const { client } = await account();
  z.enum(["skip", "replace"]).parse(merge);
  const unique = [
    ...new Map(parsed.entries.map((e) => [e.anime_id, e])).values(),
  ];
  const { data, error } = await client.rpc("import_library", {
    payload: unique,
    merge_mode: merge,
  });
  if (error) fail("Import failed. No changes were committed.");
  revalidatePath("/app", "layout");
  return {
    imported: Number(data),
    skipped: parsed.entries.length - Number(data),
  };
}
export async function deleteAccount(form: FormData) {
  if (process.env.ACCOUNT_DELETION_ENABLED !== "true")
    fail("Account deletion is awaiting operator activation.");
  const { client } = await account();
  if (form.get("confirm") !== "DELETE") fail("Type DELETE to confirm.");
  const { error } = await client.functions.invoke("account-delete", {
    body: { confirm: "DELETE" },
  });
  if (error) fail("Account deletion failed. Contact the operator.");
  redirect("/login?notice=deleted");
}
export async function previewImport(text: string) {
  const parsed = parseImport(text);
  const { client, user } = await account();
  const ids = [...new Set(parsed.entries.map((e) => e.anime_id))];
  const known = new Map<number, number | null>();
  const existing = new Set<number>();
  for (let offset = 0; offset < ids.length; offset += 200) {
    const batch = ids.slice(offset, offset + 200);
    const [{ data: a, error: ae }, { data: b, error: be }] = await Promise.all([
      client.from("anime").select("id,episodes").in("id", batch),
      client
        .from("library")
        .select("anime_id")
        .eq("user_id", user.id)
        .in("anime_id", batch),
    ]);
    if (ae || be) fail("Preview lookup failed. Nothing was imported.");
    a?.forEach((row) => known.set(row.id, row.episodes));
    b?.forEach((row) => existing.add(row.anime_id));
  }
  return {
    rows: parsed.entries.length,
    matched: ids.filter((id) => known.has(id)).length,
    unmatched: ids.filter((id) => !known.has(id)),
    existing: ids.filter((id) => existing.has(id)).length,
    invalidProgress: parsed.entries
      .filter(
        (e) =>
          known.has(e.anime_id) &&
          known.get(e.anime_id) !== null &&
          e.progress > known.get(e.anime_id)!,
      )
      .map((e) => e.anime_id),
  };
}
export async function quickAdd(animeId: number) {
  const { client, user } = await account();
  const id = z.number().int().positive().parse(animeId);
  const { data, error: lookup } = await client
    .from("anime")
    .select("id")
    .eq("id", id)
    .single();
  if (lookup || !data) fail("This title is unavailable.");
  const { error } = await client
    .from("library")
    .upsert(
      { user_id: user.id, anime_id: id, status: "planned" },
      { onConflict: "user_id,anime_id", ignoreDuplicates: true },
    );
  if (error) fail("Could not add title. Please retry.");
  revalidatePath("/app", "layout");
}
export async function tonightsPick() {
  const { client } = await account();
  const { data, error } = await client.rpc("pick_backlog");
  if (error) fail("Could not pick a title. Please retry.");
  redirect(data ? `/app/anime/${data}` : "/app?notice=empty-backlog");
}
export async function updateCollection(form: FormData) {
  const { client, user } = await account();
  const id = z.uuid().parse(form.get("id"));
  const name = z.string().trim().min(1).max(100).parse(form.get("name"));
  const description = z
    .string()
    .max(1000)
    .parse(form.get("description") || "");
  const { error } = await client
    .from("collections")
    .update({ name, description, pinned: form.get("pinned") === "on" })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) fail("Collection changes could not be saved.");
  revalidatePath("/app", "layout");
}
export async function orderCollection(form: FormData) {
  const { client, user } = await account();
  const collection_id = z.uuid().parse(form.get("collection_id"));
  const anime_id = z.coerce
    .number()
    .int()
    .positive()
    .parse(form.get("anime_id"));
  const position = z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .parse(form.get("position"));
  const { error } = await client
    .from("collection_members")
    .update({ position })
    .eq("collection_id", collection_id)
    .eq("anime_id", anime_id)
    .eq("user_id", user.id);
  if (error) fail("Order could not be saved.");
  revalidatePath("/app/collections", "layout");
}
