# Feature Matrix

## Purpose

Track what we know from our docs, screenshots, and future competitor research.

Legend:

- `Known`: present in our current docs or prototype.
- `Inference`: inferred from screenshots or product reasoning.
- `Pending`: needs Firecrawl/Playwright validation.

| Module | Feature | Current Status | Source | Notes |
| --- | --- | --- | --- | --- |
| Obras | Project/obra list with search/filter | Known | Competitor authenticated capture + frontend prototype | Needs backend persistence |
| Obras | Add project/obra modal with simple/complete modes | Known | Original screenshots + frontend prototype | Contract type and status options exist in docs |
| Project overview | KPI cards for reports, activities, occurrences, comments, photos, videos | Known | Screenshots + frontend prototype | Counts are mocked |
| Relatórios | Add report modal | Known | Screenshots + frontend prototype | Copy from last report/specific date documented |
| Relatórios | Status pipeline: filling, review, approved | Known | Competitor authenticated capture | Map to draft/pending_review/approved in backend |
| Relatórios | Table columns: date, number, project, report model, status | Known | Competitor authenticated capture | Needed for report inbox/list |
| Reports | Full RDO section editor | Pending | MVP docs | Not built yet |
| Reports | Approval locks report | Known | Product docs | Backend logic not built |
| Reports | PDF after approval | Known | Product docs | Provider not built |
| Análise de dados | Overview, created reports, pending approval, tasks, photos, videos, attachments, labor, equipment | Known | Competitor authenticated capture | Our app only has a generic analysis placeholder |
| Settings | User profile and signature | Known | Screenshots + frontend prototype | Signature capture/upload not functional |
| Settings | Users/access login | Known | Screenshots + frontend prototype | Permissions are placeholders |
| Cadastros | Report templates | Known | Competitor authenticated capture + docs | Needs real CRUD |
| Cadastros | Labor list | Known | Competitor authenticated capture + docs | Needs real CRUD |
| Cadastros | Equipment list | Known | Competitor authenticated capture + docs | Needs real CRUD |
| Cadastros | Occurrence types | Known | Competitor authenticated capture + docs | Needs real CRUD |
| Cadastros | Checklist builder | Known | Competitor authenticated capture + docs | Needs full builder implementation |
| Cadastros | Project groups | Known | Competitor authenticated capture + docs | Needs real CRUD |
| Cadastros | Project-level predefined labor/equipment | Known | Competitor authenticated capture + docs | Needs real CRUD |
| WhatsApp | Text intake | Known | Product docs | Not implemented |
| WhatsApp | Audio intake | Known | Product docs | Not implemented |
| AI | Speech-to-text PT-BR | Known | Skills docs | Not implemented |
| AI | Chatbot clarification | Known | Agents docs | Not implemented |
| Benchmarking | Firecrawl public crawl | Pending | This workflow | Requires target URL and API key |
| Benchmarking | Playwright authenticated visual capture | Known | Competitor authenticated capture | Screenshots are raw local outputs and not committed |
| Benchmarking | Apify/Crawlee recurrence | Future | This workflow | Keep out of local deps until needed |
