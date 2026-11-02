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
