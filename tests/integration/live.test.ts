import { it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
// Explicit failure without configuration: never report missing live tests as passed.
it("denies cross-user access and duplicate library records", async () => {
  const url = process.env.TEST_SUPABASE_URL,
    key = process.env.TEST_SUPABASE_ANON_KEY,
    service = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !service)
    throw Error(
      "BLOCKED: use a disposable migrated Supabase project and TEST_SUPABASE_* credentials.",
    );
  const root = createClient(url, service, { auth: { persistSession: false } });
  const users: string[] = [];
  const suffix = crypto.randomUUID();
  const password = crypto.randomUUID() + "Aa!";
  const clients = [];
  try {
    for (const name of ["alice", "bob"]) {
      const email = `${name}-${suffix}@example.test`;
      const { data, error } = await root.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(error).toBeNull();
      users.push(data.user!.id);
      const c = createClient(url, key, { auth: { persistSession: false } });
      expect(
        (await c.auth.signInWithPassword({ email, password })).error,
      ).toBeNull();
      clients.push(c);
    }
    const { data: anime } = await root
      .from("anime")
      .select("id")
      .eq("moderation", "published")
      .limit(1)
      .single();
    if (!anime)
      throw Error("BLOCKED: seed one eligible title in the test project.");
    expect(
      (
        await clients[0]
          .from("library")
          .insert({
            user_id: users[0],
            anime_id: anime.id,
            notes: "Alice private",
          })
      ).error,
    ).toBeNull();
    expect(
      (
        await clients[0]
          .from("library")
          .insert({ user_id: users[0], anime_id: anime.id })
      ).error,
    ).not.toBeNull();
    expect(
      (await clients[1].from("library").select("*").eq("user_id", users[0]))
        .data,
    ).toEqual([]);
    expect(
      (
        await clients[1]
          .from("library")
          .insert({ user_id: users[0], anime_id: anime.id })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await clients[1]
          .from("entitlements")
          .insert({ user_id: users[1], ad_free: true })
      ).error,
    ).not.toBeNull();
    const { data: collection } = await clients[0]
      .from("collections")
      .insert({ user_id: users[0], name: "Private" })
      .select()
      .single();
    expect(
      (
        await clients[1]
          .from("collection_members")
          .insert({
            user_id: users[1],
            collection_id: collection.id,
            anime_id: anime.id,
          })
      ).error,
    ).not.toBeNull();
  } finally {
    for (const id of users) await root.auth.admin.deleteUser(id);
  }
}, 30000);
