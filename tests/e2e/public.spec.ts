import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
async function settleMotion(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion",
    /full|reduced/,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
}
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
  await settleMotion(page);
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
      .locator(".anime-card:not(.card-compact)")
      .first()
      .getByRole("link", { name: "Search IMDb", exact: true }),
  ).toHaveAttribute("href", /imdb.com\/find/);
  await expect(
    page
      .locator(".anime-card:not(.card-compact)")
      .first()
      .getByRole("link", { name: "Find trailer", exact: true }),
  ).toHaveAttribute("href", /youtube.com\/results/);
  const images = page.locator(".anime-card").first().locator("img");
  await expect(images).toHaveCount(1);
  await expect(images.first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Series airing now", exact: true }),
  ).toBeVisible();
  const upcoming = page.locator(".catalog-rows .anime-row").first();
  await expect(upcoming).toContainText("Multi-part series");
  await expect(upcoming).not.toContainText("Finished");
  await expect(upcoming).not.toContainText("12 episodes");
});
test("light appearance keeps shared surfaces and source controls readable", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.emulateMedia({ reducedMotion: "reduce" });
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
}, info) => {
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
  await expect(page.locator(".library-table tbody tr")).toHaveCount(1);
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Episode progress" }),
  ).toHaveAttribute("value", "3");
  await page.getByLabel("Season / part").selectOption("20958");
  await expect(
    page.getByRole("progressbar", { name: "Episode progress" }),
  ).toHaveAttribute("value", "7");
  await page.getByLabel("Season / part").selectOption("16498");
  await page.screenshot({
    path: `.impeccable/review/${info.project.name}-library.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "shelf", exact: true }).click();
  await expect(page.locator(".anime-grid .anime-card")).toHaveCount(1);
  await expect(page.getByLabel("Season / part")).toHaveValue("16498");
  await page.getByLabel("Season / part").selectOption("20958");
  await expect(
    page.getByText("Watching · 7/12", { exact: true }),
  ).toBeVisible();
  await page.goto("/app/anime/16498");
  await expect(page.locator(".dossier-cover img")).toBeVisible();
  const widths = await page
    .locator(".dossier .synopsis")
    .evaluate((element) => ({
      text: element.getBoundingClientRect().width,
      column: element.parentElement!.getBoundingClientRect().width,
    }));
  expect(widths.text).toBeGreaterThanOrEqual(widths.column - 2);
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
  await settleMotion(page);
  await page.screenshot({
    path: `.impeccable/review/${info.project.name}-workspace.png`,
    fullPage: true,
  });
  await progress.fill("5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved to your library." }),
  ).toBeVisible();
  await page.reload();
  await expect(progress).toHaveValue("5");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Remove from library", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true }),
  ).toBeVisible();
  await progress.fill("3");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved to your library." }),
  ).toBeVisible();
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
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const [route, heading] of [
    ["/app/settings", "Settings"],
    ["/app/collections", "Collections"],
    ["/app/statistics", "Statistics"],
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.screenshot({
      path: `.impeccable/review/${info.project.name}-${heading.toLowerCase()}.png`,
      fullPage: true,
    });
    if (heading === "Settings" && info.project.name === "desktop") {
      await page.getByRole("button", { name: "Ink", exact: true }).click();
      const custom = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();
      expect(custom.violations).toEqual([]);
      await page
        .getByRole("button", { name: "Save my preferences", exact: true })
        .click();
      await expect(
        page.getByRole("status").filter({ hasText: "Preferences saved." }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByLabel("Accent color", { exact: true }),
      ).toHaveValue("#344b44");
      await page.getByRole("button", { name: "Sakuga", exact: true }).click();
      await page
        .getByRole("button", { name: "Save my preferences", exact: true })
        .click();
      await expect(
        page.getByRole("status").filter({ hasText: "Preferences saved." }),
      ).toBeVisible();
    }
  }
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
  await expect(carousel.getByRole("heading", { level: 2 })).toBeVisible();
  const frameHeight = (await carousel.boundingBox())!.height;
  const first = await carousel.getByRole("heading", { level: 2 }).innerText();
  await carousel.getByRole("button", { name: "Next featured anime" }).click();
  await expect(carousel.getByRole("heading", { level: 2 })).not.toHaveText(
    first,
  );
  expect((await carousel.boundingBox())!.height).toBe(frameHeight);
  await carousel
    .getByRole("button", { name: "Previous featured anime" })
    .click();
  await expect(carousel.getByRole("heading", { level: 2 })).toHaveText(first);
  await page.clock.install();
  await carousel.getByRole("button", { name: "Play featured anime" }).click();
  await page.getByRole("link", { name: "Sakuga home" }).first().focus();
  await page.mouse.move(1, 1);
  await page.clock.fastForward(7700);
  await expect(carousel.getByRole("heading", { level: 2 })).not.toHaveText(
    first,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    carousel.getByRole("button", { name: "Play featured anime" }),
  ).toBeDisabled();
  const current = await carousel.getByRole("heading", { level: 2 }).innerText();
  await page.clock.fastForward(16000);
  await expect(carousel.getByRole("heading", { level: 2 })).toHaveText(current);
  await carousel.getByRole("button", { name: "Next featured anime" }).click();
  await expect(carousel.getByRole("heading", { level: 2 })).not.toHaveText(
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
  await expect(page.locator(".brand").first()).not.toContainText(".");
});

test("reduced motion retains static surfaces, requested typography and cached artwork", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.locator(".glass-field,.pointer-lens,.feature-flutes,canvas"),
  ).toHaveCount(0);
  const surfaces = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const nav = getComputedStyle(document.querySelector(".public-nav")!);
    return {
      pink: css.getPropertyValue("--primary").trim().toLowerCase(),
      lavender: css.getPropertyValue("--secondary").trim().toLowerCase(),
      background: css.getPropertyValue("--bg").trim().toLowerCase(),
      blur: nav.backdropFilter,
      animation: getComputedStyle(document.body).animationName,
      backgroundImage: getComputedStyle(document.body).backgroundImage,
    };
  });
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Zen Kaku Gothic New");
  expect(
    await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Chakra Petch");
  expect(surfaces).toMatchObject({
    pink: "#ff8fb8",
    lavender: "#b9a3ff",
    background: "#0b0b0d",
    blur: "blur(8px)",
    animation: "none",
  });
  await page.mouse.move(100, 400);
  await page.mouse.move(300, 200);
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundImage),
  ).toBe(surfaces.backgroundImage);
  await page
    .getByRole("button", { name: "Show Cowboy Bebop", exact: true })
    .click();
  const image = page.locator(".featured-backdrop img");
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty("complete", true);
  expect(
    await image.evaluate((el: HTMLImageElement) => el.currentSrc),
  ).toContain("/art/home/");
  const feature = await page.locator(".discovery-feature").boundingBox();
  expect(feature!.height).toBeLessThan(800);
  expect(
    await page
      .locator(".cover")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(errors).toEqual([]);
});
test("smooth scrolling, pointer feedback and reduced-motion switching work without hydration errors", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|hydrated.*match|server rendered HTML/i.test(message.text())
    )
      hydrationErrors.push(message.text());
  });
  await page.goto("/");
  await settleMotion(page);
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-smooth-scroll", "lenis");
  const poster = page.locator(".poster-link").first();
  await poster.hover();
  await expect
    .poll(() =>
      poster.evaluate((element) => element.style.getPropertyValue("--shine-x")),
    )
    .not.toBe("");
  await expect
    .poll(() =>
      poster
        .locator(".cover")
        .evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe("none");
  await page.mouse.move(2, 200);
  // Let the driver become idle, then verify it eases rather than jumping on wake.
  await page.waitForTimeout(1250);
  await page.evaluate(() => {
    const samples: number[] = [];
    Object.assign(window, { scrollSamples: samples });
    window.addEventListener(
      "wheel",
      () => {
        function capture() {
          samples.push(scrollY);
          if (samples.length < 12) requestAnimationFrame(capture);
        }
        requestAnimationFrame(capture);
      },
      { once: true },
    );
  });
  await page.mouse.wheel(0, 800);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { scrollSamples?: number[] }).scrollSamples
            ?.length,
      ),
    )
    .toBe(12);
  expect(
    await page.evaluate(() =>
      (window as Window & { scrollSamples?: number[] }).scrollSamples?.some(
        (value) => value > 0 && value < 650,
      ),
    ),
  ).toBe(true);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(500);
  const back = page.getByRole("button", { name: "Back to top", exact: true });
  await expect(back).toBeVisible();
  await back.click();
  await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(root).toHaveAttribute("data-motion", "reduced");
  await expect(root).toHaveAttribute("data-smooth-scroll", "native");
  await expect(root).not.toHaveClass(/lenis/);
  await expect(page.locator(".border-beam").first()).toBeHidden();
  await page
    .getByRole("link", { name: "Discover", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(
    page.getByRole("heading", { name: "Discover anime", exact: true }),
  ).toBeVisible();
  await expect(root).toHaveAttribute("data-motion", "reduced");
  expect(hydrationErrors).toEqual([]);
});
test("film strip provides working horizontal navigation without page overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const rail = page.getByRole("region", {
    name: /Released in/,
  });
  await expect(rail).toBeVisible();
  expect(await rail.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
    true,
  );
  await page.getByRole("button", { name: /Next Released in/ }).click();
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(100);
  await page
    .getByRole("button", {
      name: /Previous Released in/,
    })
    .click();
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("catalog filters preserve submitted values and keyboard operation", async ({
  page,
}) => {
  await page.goto("/discover");
  const filters = page.locator(".catalog-filters");
  await filters.getByText("Filters & sorting", { exact: true }).click();
  await filters.getByLabel("Search anime", { exact: true }).fill("Attack");
  await filters
    .getByRole("combobox", { name: "Genre", exact: true })
    .selectOption("Action");
  await filters.getByLabel("Year", { exact: true }).fill("2013");
  await filters
    .getByRole("combobox", { name: "Sort", exact: true })
    .selectOption("newest");
  await filters.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=Attack/);
  await expect(
    filters.getByRole("combobox", { name: "Genre", exact: true }),
  ).toHaveValue("Action");
  await expect(filters.getByLabel("Year", { exact: true })).toHaveValue("2013");
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await filters.getByRole("link", { name: "Reset", exact: true }).click();
  await expect(page).toHaveURL(/\/discover$/);
});
