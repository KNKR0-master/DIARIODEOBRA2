import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nowIso, readProjectDoc, rootDir } from "./common.js";

const docs = [
  "project.md",
  "vision.md",
  "MVP.md",
  "ARCHITECTURE.md",
  "backend.md",
  "frontend.md",
  "agents.md",
  "skills.md",
  "pre-registration.md",
  "BENCHMARKING.md"
];

async function main() {
  const summaries = await Promise.all(
    docs.map(async (doc) => {
      const content = await readProjectDoc(doc);
      const headings = content
        .split(/\r?\n/)
        .filter((line) => line.startsWith("#"))
        .map((line) => line.trim());

      return {
        doc,
        headingCount: headings.length,
        headings
      };
    })
  );

  const backendFiles = await readdir(path.join(rootDir, "backend", "src"), { recursive: true });
  const webFiles = await readdir(path.join(rootDir, "web", "src"), { recursive: true });

  const report = `# Analytical Project Review

Generated at: ${nowIso()}

## Documentation Read

${summaries
  .map(
    (summary) => `### ${summary.doc}

Headings found: ${summary.headingCount}

${summary.headings.map((heading) => `- ${heading}`).join("\n")}
`
  )
  .join("\n")}

## Code Surface

Backend source files:

${backendFiles.map((file) => `- backend/src/${file}`).join("\n")}

Web source files:

${webFiles.map((file) => `- web/src/${file}`).join("\n")}

## Analyst Conclusion

The project is in the transition between product foundation and real MVP implementation.

The correct next step is not visual polishing yet. The next step is competitor benchmarking and requirement validation:

1. Collect public competitor content with Firecrawl.
2. Capture visual flows with Playwright.
3. Convert findings into the feature matrix and backlog.
4. Update product Markdown.
5. Approve the analysis.
6. Then implement frontend/backend changes.

## Implementation Gate

Do not make the interface more similar to any competitor until source-backed findings exist in \`research/feature-matrix.md\`.
`;

  await writeFile(path.join(rootDir, "research", "analytical-project-review.md"), report, "utf8");
  console.log("Analytical review written to research/analytical-project-review.md");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
