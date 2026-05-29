# Benchmark Backlog

## Before More UI Implementation

- Normalize Portuguese encoding in Markdown and UI text.
- Define competitor target URLs.
- Add Firecrawl API key to local environment.
- Run Firecrawl map/crawl/extract.
- Run Playwright screenshot capture.
- Fill feature matrix with sourced competitor evidence.
- Mark all inferred rules as inference.
- Review analysis with product owner.

## Backend Backlog From Current Review

- Add database layer.
- Replace seed arrays with persistent repositories.
- Add report template CRUD.
- Add catalog CRUD.
- Add report draft CRUD.
- Add approval endpoint and immutability rule.
- Add audit log.
- Add PDF generation provider interface.
- Add WhatsApp provider interface.
- Add transcription provider interface.

## Frontend Backlog From Current Review

- Rename top-level product language to `Obras`, `Relatórios`, `Análise de dados`, and `Cadastros`.
- Keep `Chat RDO` as our differentiating workflow.
- Match reports status pipeline: `Preenchendo`, `Revisar`, `Aprovado`.
- Add analysis subviews for overview, reports created, pending approval, tasks, photos, videos, attachments, labor, and equipment.
- Replace static data with API calls.
- Add route-based navigation.
- Add project create/edit persistence.
- Add report draft editor.
- Add approval screen.
- Add PDF-ready state.
- Add signature capture/upload UI.
- Add checklist builder behavior.
- Add loading/error/empty states.

## Research Tooling Backlog

- Add target URL list after product owner provides competitors.
- Add screenshot naming convention by module and flow.
- Add JSON schema validation for extraction outputs.
- Add source-reference requirement to every benchmark finding.
- Add recurring Apify/Crawlee plan only after manual benchmarking is useful.
