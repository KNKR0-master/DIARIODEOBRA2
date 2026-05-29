import Firecrawl from "@mendable/firecrawl-js";
import { getTargetUrl, nowIso, writeJson, writeMarkdown } from "./common.js";

async function main() {
  const targetUrl = getTargetUrl();
  const apiKey = process.env.FIRECRAWL_API_KEY ?? "";
  const limit = Number(process.env.FIRECRAWL_LIMIT ?? 25);

  if (!targetUrl || !apiKey) {
    const missing = [
      !targetUrl ? "BENCHMARK_TARGET_URL" : null,
      !apiKey ? "FIRECRAWL_API_KEY" : null
    ].filter(Boolean);

    await writeJson("firecrawl-status.json", {
      status: "not_run",
      reason: "Missing required environment variables.",
      missing,
      generatedAt: nowIso()
    });

    await writeMarkdown(
      "firecrawl-status.md",
      `# Firecrawl Status\n\nStatus: not run\n\nMissing: ${missing.join(", ")}\n\nSet the variables and run \`npm run research:firecrawl\` again.\n`
    );

    console.log(`Firecrawl not run. Missing: ${missing.join(", ")}`);
    return;
  }

  const app = new Firecrawl({ apiKey });

  const mapResult = await app.map(targetUrl);
  await writeJson("firecrawl-map.json", {
    targetUrl,
    generatedAt: nowIso(),
    mapResult
  });

  const urls = Array.isArray((mapResult as { links?: string[] }).links)
    ? (mapResult as { links: string[] }).links.slice(0, limit)
    : [targetUrl];

  const crawlResult = await app.crawl(targetUrl, {
    limit,
    scrapeOptions: {
      formats: ["markdown"]
    }
  });

  await writeJson("firecrawl-crawl.json", {
    targetUrl,
    generatedAt: nowIso(),
    urls,
    crawlResult
  });

  console.log(`Firecrawl completed for ${targetUrl}. URLs considered: ${urls.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
