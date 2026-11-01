import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
// Opt-in only; operates on a disposable, migrated project containing real seed data.
test("real account: search, library, collection, theme persistence, export and logout", async ({
  page,
}) => {
  const url = process.env.TEST_SUPABASE_URL,
    key = process.env.TEST_SUPABASE_ANON_KEY,
    secret = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !secret || process.env.TEST_ALLOW_MUTATION !== "true")
    throw Error(
      "BLOCKED: configure a disposable test project and TEST_ALLOW_MUTATION=true.",
    );
  if (url !== process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw Error(
      "The running app must be built against the disposable TEST_SUPABASE_URL.",
    );
  const root = createClient(url, secret, { auth: { persistSession: false } });
  const email = `e2e-${crypto.randomUUID()}@example.test`,
    password = crypto.randomUUID() + "Aa!";
  const { data: created, error } = await root.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  expect(error).toBeNull();
  const id = created.user!.id;
  try {
    const { data: anime } = await root
      .from("anime")
      .select("id,title,episodes")
      .eq("moderation", "published")
      .gte("episodes", 2)
      .limit(1)
      .single();
    if (!anime)
      throw Error(
        "BLOCKED: import an eligible real title with known episodes into the test project first.",
      );
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Welcome back" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await page.goto(`/app/discover?q=${encodeURIComponent(anime.title)}`);
    await page
      .getByRole("link", {
        name: new RegExp(anime.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`/app/anime/${anime.id}$`));
    await page.getByLabel("Status", { exact: true }).selectOption("watching");
    await page.getByLabel(/Episodes watched/).fill("1");
    await page.getByRole("button", { name: "Add to my library" }).click();
    await expect(page.getByText("Saved to your library.")).toBeVisible();
    await page.goto("/app/collections");
    const name = `Test collection ${Date.now()}`;
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Create collection" }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page.goto(`/app/anime/${anime.id}`);
    await page
      .getByLabel("Collection", { exact: true })
      .selectOption({ label: name });
    await page.getByRole("button", { name: "Add to collection" }).click();
    await page.goto("/app/settings");
    await page.getByRole("button", { name: "Ocean", exact: true }).click();
    await page.getByRole("button", { name: "Save my preferences" }).click();
    await expect(page.getByText("Your atmosphere is saved.")).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Ocean ✓", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const download = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download JSON" }).click();
    expect((await download).suggestedFilename()).toBe("sakuga-library.json");
    const check = createClient(url, key, { auth: { persistSession: false } });
    await check.auth.signInWithPassword({ email, password });
    const { data: entry } = await check
      .from("library")
      .select("*")
      .eq("anime_id", anime.id)
      .single();
    expect(entry.progress).toBe(1);
    expect(entry.status).toBe("watching");
    await page.getByRole("button", { name: "Log out" }).last().click();
    await page.goto("/app/library");
    await expect(page).toHaveURL(/\/login/);
  } finally {
    await root.auth.admin.deleteUser(id);
  }
});
