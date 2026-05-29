import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { getTargetUrl, nowIso, outputDir, writeJson, writeMarkdown } from "./common.js";

async function main() {
  const targetUrl = getTargetUrl();

  if (!targetUrl) {
    await writeJson("playwright-status.json", {
      status: "not_run",
      reason: "Missing BENCHMARK_TARGET_URL.",
      generatedAt: nowIso()
    });

    await writeMarkdown(
      "playwright-status.md",
      "# Playwright Status\n\nStatus: not run\n\nMissing: BENCHMARK_TARGET_URL\n\nSet the variable and run `npm run research:playwright` again.\n"
    );

    console.log("Playwright not run. Missing: BENCHMARK_TARGET_URL");
    return;
  }

  const screenshotDir = path.join(outputDir, "screenshots");
  await mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });

  const title = await page.title();
  const links = await page
    .locator("a")
    .evaluateAll((items) =>
      items.slice(0, 80).map((item) => ({
        text: item.textContent?.trim() ?? "",
        href: (item as HTMLAnchorElement).href
      }))
    );

  const screenshotPath = path.join(screenshotDir, "homepage-desktop.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  await writeJson("playwright-capture.json", {
    status: "completed",
    targetUrl,
    title,
    links,
    screenshotPath,
    generatedAt: nowIso()
  });

  console.log(`Playwright capture completed for ${targetUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
