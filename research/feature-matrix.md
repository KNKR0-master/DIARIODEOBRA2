# Feature Matrix

## Purpose

Track what we know from our docs, screenshots, and future competitor research.

Legend:

- `Known`: present in our current docs or prototype.
- `Inference`: inferred from screenshots or product reasoning.
- `Pending`: needs Firecrawl/Playwright validation.

| Module | Feature | Current Status | Source | Notes |
| --- | --- | --- | --- | --- |
| Projects | Project list with search/filter | Known | Screenshots + frontend prototype | Needs backend persistence |
| Projects | Add project modal with simple/complete modes | Known | Screenshots + frontend prototype | Contract type and status options exist in docs |
| Project overview | KPI cards for reports, activities, occurrences, comments, photos, videos | Known | Screenshots + frontend prototype | Counts are mocked |
| Reports | Add report modal | Known | Screenshots + frontend prototype | Copy from last report/specific date documented |
| Reports | Full RDO section editor | Pending | MVP docs | Not built yet |
| Reports | Approval locks report | Known | Product docs | Backend logic not built |
| Reports | PDF after approval | Known | Product docs | Provider not built |
| Settings | User profile and signature | Known | Screenshots + frontend prototype | Signature capture/upload not functional |
| Settings | Users/access login | Known | Screenshots + frontend prototype | Permissions are placeholders |
| Pre-registration | Report templates | Known | Screenshots + docs | Needs real CRUD |
| Pre-registration | Labor list | Known | Screenshots + docs | Needs real CRUD |
| Pre-registration | Equipment list | Known | Screenshots + docs | Needs real CRUD |
| Pre-registration | Occurrence types | Known | Screenshots + docs | Needs real CRUD |
| Pre-registration | Checklist builder | Known | Screenshots + docs | Needs full builder implementation |
| WhatsApp | Text intake | Known | Product docs | Not implemented |
| WhatsApp | Audio intake | Known | Product docs | Not implemented |
| AI | Speech-to-text PT-BR | Known | Skills docs | Not implemented |
| AI | Chatbot clarification | Known | Agents docs | Not implemented |
| Benchmarking | Firecrawl public crawl | Pending | This workflow | Requires target URL and API key |
| Benchmarking | Playwright visual capture | Pending | This workflow | Requires target URL |
| Benchmarking | Apify/Crawlee recurrence | Future | This workflow | Keep out of local deps until needed |

