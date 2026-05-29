# Benchmarking Workflow

## Purpose

Define the research-first workflow for comparing our construction report app against competitor products before changing frontend layout or implementation.

## Principle

Research comes before implementation.

The app should not copy a competitor blindly. The goal is to understand vocabulary, modules, flows, rules, permissions, and UX patterns, then convert the findings into our own product requirements.

## Required Layers

| Layer | Tool | Function |
| --- | --- | --- |
| Public text collection | Firecrawl | Map pages, scrape content, collect docs, FAQs, integrations, features, pricing, support articles |
| Visual navigation | Playwright | Open pages, click flows, capture screenshots, document menus, modals, forms, filters, states |
| Recurring crawling | Apify/Crawlee | Future option for scheduled competitor monitoring and datasets |
| Organization | Markdown/JSON | Store feature matrix, flow maps, inferred rules, screenshots index, and source references |
| Analysis | LLM/Analyst Agent | Convert collected data into requirements, UX notes, risks, and backlog |
| Planning | Project Markdown | Update scope, modules, architecture, frontend requirements, backend rules, and roadmap |
| Implementation | Codex/dev | Code only after analysis is reviewed and approved |

## Firecrawl Collection

Use Firecrawl to collect and structure:

- Sitemap.
- Relevant URLs.
- Module pages.
- Feature descriptions.
- FAQs.
- Documentation.
- Support articles.
- Integration pages.
- Public pricing pages.
- Terminology used by the system.

Structured extraction fields:

- Product.
- Module.
- Feature.
- Flow.
- Benefit.
- Limitation.
- Permission.
- Integration.
- Data object.
- UI component.
- Business rule.
- Source URL.
- Confidence.
- Inference flag.

Command:

```powershell
$env:BENCHMARK_TARGET_URL="https://competitor.example"
$env:FIRECRAWL_API_KEY="fc-YOUR_KEY"
npm run research:firecrawl
```

Without `BENCHMARK_TARGET_URL` and `FIRECRAWL_API_KEY`, the command writes a diagnostic status file instead of failing.

## Playwright Collection

Use Playwright when visual behavior matters:

- User journey registration.
- Public screen capture.
- Menu mapping.
- Modal discovery.
- Filter/form documentation.
- Screenshot generation by flow.
- Interface behavior notes.

Command:

```powershell
$env:BENCHMARK_TARGET_URL="https://competitor.example"
npm run research:playwright
```

Without `BENCHMARK_TARGET_URL`, the command writes a diagnostic status file instead of failing.

## Apify/Crawlee Layer

Do not add Crawlee to the local project until the recurring crawler is needed. The package currently adds a dependency chain with audit risk, so the first version keeps this as an operational option.

Use Apify/Crawlee later for:

- Periodic crawls.
- Saved datasets.
- Google Sheets, CRM, database, or n8n integrations.
- Ready-made actors.
- Competitor change monitoring.

## Analyst Agent Output

After collection, the analytical layer must produce:

- Feature matrix.
- Module map.
- Process flows.
- Comparison between systems.
- Opportunities for improvement.
- Implementation risks.
- CRM/backlog candidates.
- UX/UI suggestions.
- Inferred business rules.

All inferred items must be marked as inference, not fact.

## Approval Gate

Before frontend/layout implementation:

1. Run Firecrawl collection when target URL and API key exist.
2. Run Playwright capture when target URL exists.
3. Run analyst review.
4. Update project Markdown files.
5. Review findings with the product owner.
6. Only then implement UI/code changes.

## Local Outputs

Generated raw outputs go to:

```text
research/output/
```

Tracked analysis files go to:

```text
research/current-state-review.md
research/feature-matrix.md
research/benchmark-backlog.md
```

