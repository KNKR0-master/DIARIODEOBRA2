# Benchmark Backlog

## Before More UI Implementation

- Normalize Portuguese encoding in Markdown and UI text. Status: mostly complete for current visible app text and updated project Markdown.
- Define competitor target URLs.
- Add Firecrawl API key to local environment.
- Run Firecrawl map/crawl/extract.
- Run Playwright screenshot capture.
- Fill feature matrix with sourced competitor evidence.
- Mark all inferred rules as inference.
- Review analysis with product owner.

## Backend Backlog From Current Review

- Add database layer. Status: done for local SQLite prototype.
- Replace seed arrays with persistent repositories. Status: done for current persisted app entities.
- Add report template CRUD. Status: basic create/update/list implemented.
- Add catalog CRUD. Status: basic create/update/list implemented for labor, equipment, occurrences, project groups, and checklist.
- Add report draft CRUD. Status: draft create/update/list implemented.
- Add approval endpoint and immutability rule. Status: implemented.
- Add audit log. Status: implemented.
- Add project coordinates and weather suggestion endpoint. Status: implemented with Open-Meteo.
- Add security hardening for auth, CSRF, CORS, attachment size, and production seed password. Status: initial baseline implemented.
- Add PDF generation provider interface.
- Add WhatsApp provider interface.
- Add transcription provider interface.
- Add password recovery.
- Add persistent rate limiting.
- Add per-project permissions.
- Add formal database migration/versioning framework for production.

## Frontend Backlog From Current Review

- Rename top-level product language to `Obras`, `Relatórios`, `Análise de dados`, and `Cadastros`. Status: done.
- Keep `Chat RDO` as our differentiating workflow.
- Match reports status pipeline: `Preenchendo`, `Revisar`, `Aprovado`. Status: partially represented in current report status labels/counters.
- Add analysis subviews for overview, reports created, pending approval, tasks, photos, videos, attachments, labor, and equipment. Status: partially implemented for current analysis views.
- Replace static data with API calls. Status: done for main current app flows.
- Add route-based navigation.
- Add project create/edit persistence. Status: done, including latitude/longitude.
- Add report draft editor. Status: done for current RDO sections.
- Add approval screen. Status: approval sidebar and actions implemented.
- Split RDO editor into readable major section blocks. Status: done.
- Add structured climate tables and Open-Meteo suggestion action. Status: done.
- Add labor entry pencil editing, function dropdown, custom function option, own/outsourced source, and service provider. Status: done.
- Add PDF-ready state.
- Add signature capture/upload UI.
- Add checklist builder behavior.
- Add loading/error/empty states. Status: partially implemented.
- Add mobile-specific QA pass for dense RDO forms.

## Research Tooling Backlog

- Add target URL list after product owner provides competitors.
- Add screenshot naming convention by module and flow.
- Add JSON schema validation for extraction outputs.
- Add source-reference requirement to every benchmark finding.
- Add recurring Apify/Crawlee plan only after manual benchmarking is useful.
