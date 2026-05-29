# MVP

## Purpose

Define the first useful version of the construction report app.

## MVP Goal

Allow a construction company to create projects, configure report templates, receive text or audio construction updates, transform those updates into draft reports, approve immutable reports, and generate approved PDFs.

## Primary Flow

1. Administrator creates a company workspace.
2. Administrator creates one or more projects.
3. Administrator configures the RDO report template.
4. Administrator configures labor, equipment, occurrence types, and checklist catalogs.
5. Field user sends a text or audio report through WhatsApp or web chat.
6. Audio is transcribed to PT-BR text.
7. Chatbot workflow asks for missing information when needed.
8. Report Builder creates a draft report.
9. Reviewer checks and approves the report.
10. Approved report becomes immutable.
11. PDF is generated with signature, user ID, date/time, report ID, and approval metadata.

## MVP Modules

### Web

- Projects.
- Project overview.
- Reports.
- Report chat hub.
- Settings.
- Users.
- My profile.
- Signature management.
- Pre-registration catalogs.

### Backend

- Project API.
- Report template API.
- Catalog API.
- Report draft and approval API.
- User/profile API placeholder.
- WhatsApp webhook placeholder.
- Audio transcription placeholder.
- PDF generation placeholder.
- Audit log model.

### AI

- Speech-to-text.
- Report extraction.
- Chatbot clarification.
- Validation and review assistance.

## MVP Acceptance Criteria

- A project can be registered with simple and complete data.
- A report can be created for a project.
- A report template can define enabled report sections.
- Labor, equipment, occurrence, and checklist catalogs are available.
- A draft report can be approved.
- Approval locks the report.
- Approved reports include creator, approver, signature, date/time, and audit metadata.
- PDF generation is available after approval.
- PT-BR is the default language.

## Out Of Scope For First MVP

- Full financial module.
- ERP integration.
- Offline mobile app.
- Automatic photo analysis.
- Multi-company billing automation.
- Advanced schedule planning.
- Client portal.

## Build Order

1. Benchmarking workflow and analytical review.
2. Web shell and navigation.
3. Project and settings screens.
4. Backend entities and seed API.
5. Report template and catalog APIs.
6. Report draft and approval API.
7. PDF placeholder.
8. WhatsApp webhook placeholder.
9. Audio transcription integration.
10. Chatbot report flow.

## Current Implementation Status

- Completed: benchmarking workflow, web shell, project/settings prototype, seed APIs, report template/catalog APIs, and the first functional RDO workflow.
- The functional RDO workflow now supports create draft, edit sections, send to review, approve, store approval metadata, generate a virtual signature ID, reserve a PDF version ID, calculate a report hash, and block edits after approval.
- Stage 2 now adds local SQLite persistence, initial user/signature records, report section storage, audit log persistence, and PDF version placeholders.
- Real authentication, permission enforcement, real PDF generation, WhatsApp intake, and audio transcription remain next-stage work.

## Implementation Gate

Before changing layout to match a competitor more closely:

- Firecrawl must collect public textual/structural content when a target URL and API key are available.
- Playwright must capture public visual flows when a target URL is available.
- The Analyst Agent must update the feature matrix, backlog, and project Markdown files.
- Inferred rules must be marked as inference.
- Product owner approval is required before implementation.
