import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const path of ["/", "/login", "/pricing"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.sakugaLcp = null;
      new PerformanceObserver((list) => {
        window.sakugaLcp = list.getEntries().at(-1)?.startTime ?? null;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(`http://127.0.0.1:3000${path}`, {
      waitUntil: "networkidle",
    });
    const timing = await page.evaluate(() => {
      const n = performance.getEntriesByType("navigation")[0];
      return {
        ttfbMs: n.responseStart,
        domContentLoadedMs: n.domContentLoadedEventEnd,
        loadMs: n.loadEventEnd,
        fcpMs:
          performance.getEntriesByName("first-contentful-paint")[0]
            ?.startTime ?? null,
        lcpMs: window.sakugaLcp,
      };
    });
    results.push({ path, ...timing });
    await context.close();
  }
  const report = {
    measuredAt: new Date().toISOString(),
    conditions:
      "Single sample per route, local production server, Chromium 1440x1000, fresh browser context per route, no CPU/network throttling. Not a Lighthouse score or field Core Web Vitals. Authenticated measurements blocked by absent credentials.",
    results,
  };
  await writeFile(
    "docs/performance.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
