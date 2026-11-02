import { test, expect } from "@playwright/test";
test("homepage, auth configuration state and responsive navigation", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Attack on Titan", exact: true }).first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  const nav = page.locator(".public-nav");
  const navBox = (await nav.boundingBox())!;
  for (const control of await nav.locator(":scope > *:visible").all()) {
    const box = (await control.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(navBox.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(navBox.x + navBox.width + 1);
  }
  await page.screenshot({
    path: `.impeccable/review/${info.project.name}-viewport.png`,
    fullPage: false,
  });
  await page.screenshot({
    path: `.impeccable/review/${info.project.name}.png`,
    fullPage: true,
    caret: "initial",
  });
  await page.goto("/app/library");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByLabel("Email address")).toBeVisible();
});
test("policy and pricing tell the truth about purchase availability", async ({
  page,
}) => {
  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", { name: "$5 USD. Once." }),
  ).toBeVisible();
  await expect(
    page.getByText("Ads are not currently shown.", { exact: false }),
  ).toBeVisible();
  await page.goto("/content-policy");
  await expect(
    page.getByRole("heading", { name: "Mature stories. Clear boundaries." }),
  ).toBeVisible();
});
test("keyboard focus and automated accessibility on public and auth pages", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const route of ["/", "/login", "/pricing"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
test("suggestions ignore obsolete responses, clear safely, and expose errors", async ({
  page,
}) => {
  await page.route("**/api/search?*", async (route) => {
    const q = new URL(route.request().url()).searchParams.get("q") || "";
    if (q === "fail") {
      await route.fulfill({ status: 503, json: { error: "unavailable" } });
      return;
    }
    await new Promise((r) => setTimeout(r, q === "old" ? 800 : 20));
    await route.fulfill({
      json: {
        titles: [
          {
            id: q === "old" ? 1 : 2,
            title_english: q === "old" ? "Old response" : "New response",
            title: "Romaji",
            year: 2026,
            format: "TV",
          },
        ],
      },
    });
  });
  await page.goto("/");
  const input = page.getByRole("combobox", { name: "Search anime" });
  await input.fill("old");
  await page.waitForTimeout(400);
  await input.fill("new");
  await expect(
    page.getByRole("option", { name: /New response/ }),
  ).toBeVisible();
  await page.waitForTimeout(900);
  await expect(page.getByRole("option", { name: /Old response/ })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.getByRole("option")).toHaveCount(0);
  await input.fill("fail");
  await expect(
    page.getByText("Search failed.", { exact: false }),
  ).toBeVisible();
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
});
test("database and trailer searches are explicit and every card has visual artwork", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .locator(".anime-card")
      .first()
      .getByRole("link", { name: "Search IMDb", exact: true }),
  ).toHaveAttribute("href", /imdb.com\/find/);
  await expect(
    page
      .locator(".anime-card")
      .first()
      .getByRole("link", { name: "Find trailer", exact: true }),
  ).toHaveAttribute("href", /youtube.com\/results/);
  const images = page.locator(".anime-card").first().locator("img");
  await expect(images).toHaveCount(1);
  await expect(images.first()).toBeVisible();
});
test("light appearance keeps shared glass and source controls readable", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const route of ["/", "/discover"]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.dataset.appearance = "light";
    });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
test("home refreshes an expired session and preserves access after returning home", async ({
  page,
  context,
}) => {
  const expired = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: "00000000-0000-4000-8000-000000000001",
        role: "authenticated",
        aud: "authenticated",
        exp: Math.floor(Date.now() / 1000) - 100,
        iat: Math.floor(Date.now() / 1000) - 3700,
      }),
    ).toString("base64url"),
    "fixture-signature",
  ].join(".");
  const value =
    "base64-" +
    Buffer.from(
      JSON.stringify({
        access_token: expired,
        refresh_token: "fixture-refresh",
        expires_at: Math.floor(Date.now() / 1000) - 100,
        token_type: "bearer",
        user: { id: "00000000-0000-4000-8000-000000000001" },
      }),
    ).toString("base64url");
  await context.addCookies([
    { name: "sb-127-auth-token", value, domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "My account", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Log in", exact: true }),
  ).toHaveCount(0);
  expect(
    (await context.cookies()).find((c) => c.name === "sb-127-auth-token")
      ?.value,
  ).not.toBe(value);
  await page.goto("/app/library");
  await expect(page).toHaveURL(/\/app\/library$/);
  await expect(
    page.getByRole("heading", { name: "My library", exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "My account", exact: true }),
  ).toBeVisible();
  await page.goto("/app/library");
  await expect(page).toHaveURL(/\/app\/library$/);
  await expect(page.locator(".anime-grid .anime-card")).toHaveCount(1);
  await expect(page.getByLabel("Season / part")).toHaveValue("16498");
  await page.getByLabel("Season / part").selectOption("20958");
  await expect(
    page.getByText("Watching · 7/12", { exact: true }),
  ).toBeVisible();
  await page.goto("/app/anime/16498");
  await expect(page.locator(".dossier-cover img")).toBeVisible();
  expect(
    (await page.locator(".dossier-cover").boundingBox())!.height,
  ).toBeGreaterThan(100);
  const progress = page.getByRole("spinbutton", {
    name: "Episodes watched / 12",
  });
  await expect(progress).toHaveValue("3");
  await progress.fill("5");
  await page.getByLabel("Season / part").selectOption("20958");
  await expect(progress).toHaveValue("7");
  await page.getByLabel("Season / part").selectOption("16498");
  await expect(progress).toHaveValue("3");
  const toggle = page.getByRole("button", { name: /sidebar/ });
  const before = await page.locator(".workspace").boundingBox();
  await toggle.click();
  await expect(toggle).toHaveAttribute(
    "aria-expanded",
    page.viewportSize()!.width <= 600 ? "true" : "false",
  );
  if (page.viewportSize()!.width > 600) {
    await expect
      .poll(async () =>
        Math.round((await page.locator(".workspace").boundingBox())!.x),
      )
      .toBe(82);
    const after = await page.locator(".workspace").boundingBox();
    expect(after!.width).toBeGreaterThan(before!.width + 100);
    expect(after!.x + after!.width).toBeCloseTo(page.viewportSize()!.width, 0);
  }
  await toggle.click();
});
test("seasons share one index and selector follows legacy links", async ({
  page,
}) => {
  await page.goto("/discover?q=Attack");
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await page.goto("/anime/20958");
  await expect(page).toHaveURL(/\/anime\/16498\?season=20958/);
  await expect(page.getByLabel("Season / part")).toHaveValue("20958");
  await page.getByLabel("Season / part").selectOption("16498");
  await expect(page).toHaveURL(/season=16498/);
  await expect(page.getByLabel("Season / part")).toHaveValue("16498");
});
test("click sounds migrate safely and lo-fi is removed", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("sakuga-audio"))
      localStorage.setItem(
        "sakuga-audio",
        JSON.stringify({ effects: false, music: true }),
      );
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Enable click sounds", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: /lo.fi/i })).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("sakuga-audio") || "{}"),
      ),
    )
    .toEqual({ version: 2, effects: false });
  await page
    .getByRole("button", { name: "Enable click sounds", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Mute click sounds", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Mute click sounds", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Mute click sounds", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Enable click sounds", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});
test("featured carousel changes slides, pauses safely and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Featured anime" });
  await expect(carousel.getByRole("heading", { level: 1 })).toBeVisible();
  const frameHeight = (await carousel.boundingBox())!.height;
  const first = await carousel.getByRole("heading", { level: 1 }).innerText();
  await carousel.getByRole("button", { name: "Next featured anime" }).click();
  await expect(carousel.getByRole("heading", { level: 1 })).not.toHaveText(
    first,
  );
  expect((await carousel.boundingBox())!.height).toBe(frameHeight);
  await carousel
    .getByRole("button", { name: "Previous featured anime" })
    .click();
  await expect(carousel.getByRole("heading", { level: 1 })).toHaveText(first);
  await page.clock.install();
  await carousel.getByRole("button", { name: "Play featured anime" }).click();
  await page.getByRole("link", { name: "Sakuga home" }).focus();
  await page.mouse.move(1, 1);
  await page.clock.fastForward(7700);
  await expect(carousel.getByRole("heading", { level: 1 })).not.toHaveText(
    first,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    carousel.getByRole("button", { name: "Play featured anime" }),
  ).toBeDisabled();
  const current = await carousel.getByRole("heading", { level: 1 }).innerText();
  await page.clock.fastForward(16000);
  await expect(carousel.getByRole("heading", { level: 1 })).toHaveText(current);
  await carousel.getByRole("button", { name: "Next featured anime" }).click();
  await expect(carousel.getByRole("heading", { level: 1 })).not.toHaveText(
    current,
  );
});
test("search shortcut and mobile menu remain accessible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("combobox", { name: "Search anime" }),
  ).toHaveAttribute("data-shortcut-ready", "true");
  await page.keyboard.press("/");
  await expect(
    page.getByRole("combobox", { name: "Search anime" }),
  ).toBeFocused();
  if (page.viewportSize()!.width <= 600) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  }
  await expect(page.locator(".brand")).not.toContainText(".");
});
