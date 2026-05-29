import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { nowIso, outputDir, rootDir, writeJson } from "./common.js";

const appUrl = process.env.APP_REVIEW_URL ?? "http://127.0.0.1:5175";
const screenshotDir = path.join(outputDir, "current-app");

async function capture(page: Page, name: string) {
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function clickByText(page: Page, text: string) {
  const exact = page.getByText(text, { exact: true }).first();
  if (await exact.isVisible().catch(() => false)) {
    await exact.click();
  } else {
    await page.getByText(text, { exact: false }).first().click();
  }
  await page.waitForTimeout(250);
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60000 });

  const screenshots: Record<string, string> = {};
  screenshots.projects = await capture(page, "01-projects");

  await clickByText(page, "ADICIONAR");
  screenshots.addProjectModal = await capture(page, "02-add-project-modal");
  await page.getByLabel("Fechar").click();
  await page.waitForTimeout(250);

  await page.getByText("PROJETO TESTE").first().click();
  await page.waitForTimeout(250);
  screenshots.projectOverview = await capture(page, "03-project-overview");

  await clickByText(page, "Relatórios");
  screenshots.reports = await capture(page, "04-reports");

  await clickByText(page, "Adicionar RDO");
  screenshots.addReportModal = await capture(page, "05-add-report-modal");
  await page.getByLabel("Fechar").click();
  await page.waitForTimeout(250);

  await clickByText(page, "Chat RDO");
  screenshots.chatRdo = await capture(page, "06-chat-rdo");

  await clickByText(page, "Cadastros");
  screenshots.profile = await capture(page, "07-settings-profile");

  await clickByText(page, "Usuários");
  screenshots.users = await capture(page, "08-settings-users");

  await clickByText(page, "Modelos de relatório");
  screenshots.reportTemplates = await capture(page, "09-report-templates");

  await clickByText(page, "Cadastros");
  screenshots.catalogs = await capture(page, "10-catalogs");

  await browser.close();

  const review = `# Current App Visual Review

Generated at: ${nowIso()}

URL reviewed: ${appUrl}

## Screens Captured

${Object.entries(screenshots)
  .map(([name, filePath]) => `- ${name}: \`${filePath}\``)
  .join("\n")}

## What The Prototype Already Covers

- Operational top navigation with Obras, Relatórios, Análise de dados, Cadastros, and Chat RDO.
- Obras list with filters and project card.
- Add project modal with complete/simple registration options.
- Project overview with sidebar, KPI cards, recent report/photo panels, and project information.
- Reports inbox with draft approval metadata panel.
- Add report modal with copy-last-report and copy-specific-report options.
- Chat RDO concept with message thread, microphone, upload, and send controls.
- Cadastros profile/signature area.
- Users grouping by profile.
- Report template editor surface.
- Catalog/pre-registration panels for labor, equipment, occurrences, and checklist.

## Gaps Before Visual Parity Work

- The UI is still static and uses mock data.
- There is no route-based navigation or deep linking.
- Forms do not persist data.
- Report editor sections are not implemented.
- Approval, PDF generation, and immutable report views are not implemented.
- Signature draw/upload is only represented visually.
- Checklist builder is a visual placeholder.
- The app needs a source-backed competitor benchmark before visual matching decisions.

## UX Notes

- The structure already follows the competitor-inspired operational pattern: dense pages, white panels, gray workspace, blue active states, green save actions, and orange section titles.
- The next UI pass should focus on spacing, table density, modal proportions, sidebar counts, and form states after competitor screenshots are collected.
- Do not change visual hierarchy further until benchmark evidence is added to \`research/feature-matrix.md\`.
`;

  await writeFile(path.join(rootDir, "research", "current-app-visual-review.md"), review, "utf8");
  await writeJson("current-app-review.json", {
    status: "completed",
    appUrl,
    screenshots,
    generatedAt: nowIso()
  });

  console.log("Current app visual review written to research/current-app-visual-review.md");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
