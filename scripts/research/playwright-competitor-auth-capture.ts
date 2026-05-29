import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { nowIso, outputDir, rootDir, writeJson } from "./common.js";

const competitorUrl = process.env.COMPETITOR_URL ?? "https://web.diariodeobra.app/";
const email = process.env.COMPETITOR_EMAIL ?? "";
const password = process.env.COMPETITOR_PASSWORD ?? "";
const screenshotDir = path.join(outputDir, "competitor-auth");

async function capture(page: Page, name: string) {
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function visibleTexts(page: Page) {
  const lines = await page.locator("body").evaluate((body) => {
    const text = body.innerText || "";
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 220);
  });

  return lines
    .filter((line) => !/@/.test(line))
    .map((line) => {
      const decoded = /[ÃÂ]/.test(line) ? Buffer.from(line, "latin1").toString("utf8") : line;
      return decoded
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
        .replace(/SOBANCOS E TTHOME[^\n]*/gi, "[REDACTED_COMPANY]")
        .replace(/TERESINHA[^\n]*/gi, "[REDACTED_USER]")
        .replace(/[\uE000-\uF8FF]/g, "")
        .trim();
    })
    .filter(Boolean)
    .slice(0, 80);
}

async function clickFirstAvailable(page: Page, labels: string[]) {
  for (const label of labels) {
    const locator = page.getByText(label, { exact: true }).first();
    if (await locator.isVisible().catch(() => false)) {
      await locator.click();
      await page.waitForTimeout(600);
      return label;
    }

    const looseLocator = page.getByText(label, { exact: false }).first();
    if (await looseLocator.isVisible().catch(() => false)) {
      await looseLocator.click();
      await page.waitForTimeout(600);
      return label;
    }
  }

  return null;
}

async function waitForSettledScreen(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
}

async function goHash(page: Page, origin: string, hashPath: string) {
  await page.goto(`${origin}/#${hashPath}`, { waitUntil: "networkidle", timeout: 60000 });
  await waitForSettledScreen(page);
}

async function login(page: Page) {
  const emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i], input[type="text"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await emailInput.waitFor({ state: "visible", timeout: 30000 });
  await emailInput.fill(email);
  await passwordInput.fill(password);

  const submit = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /entrar|login|sign in|acessar/i }).first();
  if (await submit.isVisible().catch(() => false)) {
    await submit.click();
  } else {
    await passwordInput.press("Enter");
  }

  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(2000);
}

async function main() {
  if (!email || !password) {
    await writeJson("competitor-auth-status.json", {
      status: "not_run",
      reason: "Missing COMPETITOR_EMAIL or COMPETITOR_PASSWORD.",
      generatedAt: nowIso()
    });
    console.log("Competitor capture not run. Missing COMPETITOR_EMAIL or COMPETITOR_PASSWORD.");
    return;
  }

  await mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(competitorUrl, { waitUntil: "networkidle", timeout: 60000 });
  const beforeLoginPath = await capture(page, "00-before-login");

  await login(page);

  const screenshots: Record<string, string> = {
    beforeLogin: beforeLoginPath,
    afterLogin: await capture(page, "01-after-login")
  };

  const visited: Record<string, { clicked: string | null; url: string; textSample: string[] }> = {};
  const origin = new URL(competitorUrl).origin;

  const routeFlows = [
    { key: "projects", hashPath: "/app/obras" },
    { key: "reports", hashPath: "/app/notificacoes" },
    { key: "analysisOverview", hashPath: "/app/analise-de-dados/visao-geral" },
    { key: "analysisReportsCreated", hashPath: "/app/analise-de-dados/relatorios-criados" },
    { key: "analysisPendingApproval", hashPath: "/app/analise-de-dados/relatorios-aguardando-aprovacao" },
    { key: "settingsProfile", hashPath: "/app/cadastros/perfil" },
    { key: "settingsSignature", hashPath: "/app/cadastros/assinatura" },
    { key: "settingsCompany", hashPath: "/app/cadastros/empresa" },
    { key: "users", hashPath: "/app/cadastros/usuarios" },
    { key: "projectGroups", hashPath: "/app/cadastros/grupos" },
    { key: "reportTemplates", hashPath: "/app/cadastros/modelos-relatorios" },
    { key: "labor", hashPath: "/app/cadastros/maodeobra" },
    { key: "equipment", hashPath: "/app/cadastros/equipamentos" },
    { key: "occurrences", hashPath: "/app/cadastros/ocorrencias" },
    { key: "checklist", hashPath: "/app/cadastros/checklist" },
    { key: "predefineLabor", hashPath: "/app/cadastros/obra/predefinir-mao-de-obra" },
    { key: "predefineEquipment", hashPath: "/app/cadastros/obra/predefinir-equipamentos" }
  ];

  for (const flow of routeFlows) {
    await goHash(page, origin, flow.hashPath);
    visited[flow.key] = {
      clicked: `route ${flow.hashPath}`,
      url: page.url(),
      textSample: await visibleTexts(page)
    };
    screenshots[flow.key] = await capture(page, `${Object.keys(screenshots).length.toString().padStart(2, "0")}-${flow.key}`);
  }

  await goHash(page, origin, "/app/obras");
  const clickedProject = await clickFirstAvailable(page, ["PROJETO TESTE"]);
  await waitForSettledScreen(page);
  visited.projectOverview = {
    clicked: clickedProject,
    url: page.url(),
    textSample: await visibleTexts(page)
  };
  screenshots.projectOverview = await capture(page, `${Object.keys(screenshots).length.toString().padStart(2, "0")}-projectOverview`);

  await browser.close();

  const review = `# Authenticated Competitor Review

Generated at: ${nowIso()}

Target: ${competitorUrl}

Credentials were provided at runtime through environment variables and are not stored in this file.

## Screens Captured

${Object.entries(screenshots)
  .map(([name, filePath]) => `- ${name}: \`${filePath}\``)
  .join("\n")}

## Flow Text Samples

${Object.entries(visited)
  .map(
    ([key, flow]) => `### ${key}

- Clicked label: ${flow.clicked ?? "not found"}
- URL after action: ${flow.url}
- Visible text sample:
${flow.textSample.slice(0, 30).map((line) => `  - ${line}`).join("\n")}
`
  )
  .join("\n")}

## Initial Requirements Extracted

- Keep a project-centered operating model with project list, project overview, project reports, and edit project actions.
- Keep settings separated into profile, company/subscription, user access, and pre-registration catalogs.
- Preserve pre-registration for project groups, report templates, labor, equipment, occurrence types, and checklist.
- Treat report templates as configurable models enabled per project.
- Keep data analysis as a first-class top navigation area with subviews for overview, created reports, pending approval, task lists, photos, videos, attachments, labor, and equipment.
- Treat screenshots as evidence for UI structure, not as permission to copy visual design directly.

## Inferences To Validate

- Inference: project groups can act as the first separation layer before full multi-company support.
- Inference: report template configuration controls which RDO sections appear during report creation.
- Inference: labor and equipment can be globally registered and then pre-defined per project.
- Inference: checklist answer options likely support compliance/non-compliance/not-applicable workflows.
`;

  await writeFile(path.join(rootDir, "research", "competitor-auth-review.md"), review, "utf8");
  await writeJson("competitor-auth-capture.json", {
    status: "completed",
    competitorUrl,
    screenshots,
    visited,
    generatedAt: nowIso()
  });

  console.log("Authenticated competitor review written to research/competitor-auth-review.md");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
