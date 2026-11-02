import { test, expect } from "@playwright/test";
test("homepage, auth configuration state and responsive navigation", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Some stories stay with you.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".spotlight-cover img").first()).toBeVisible();
  expect(
    await page
      .locator(".spotlight-cover img")
      .first()
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.screenshot({
    path: `.impeccable/review/${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Start your collection" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/signup/);
  await expect(
    page.getByRole("heading", { name: "Make room for your favorites." }),
  ).toBeVisible();
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
