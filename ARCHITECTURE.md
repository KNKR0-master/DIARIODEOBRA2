# Architecture

## Purpose

Define the first technical structure for the construction report app.

## Stack

### Frontend

- React.
- Vite.
- TypeScript.
- CSS modules or plain CSS at first.
- Lucide icons.

### Backend

- Node.js.
- TypeScript.
- Fastify.
- Zod for request validation.
- SQLite through Node `node:sqlite` for the first local persistence layer.
- Provider interfaces for WhatsApp, transcription, PDF, and storage.

### Future Infrastructure

- PostgreSQL for relational data.
- Object storage for photos, videos, audio, attachments, and PDFs.
- Queue worker for WhatsApp media, transcription, report extraction, and PDF generation.
- Redis for queues and short-lived processing state if needed.

### Current Deployment

- Hosted prototype target: Fly.io.
- App name: `relatoriodeobra-app`.
- Region: `gru`.
- Runtime: Docker image built from the monorepo.
- Production entrypoint: Fastify backend on port `8080`.
- Frontend delivery: backend serves the compiled Vite app from `web/dist`.
- Persistence: SQLite at `/data/app.sqlite` on a Fly volume named `diario_data`.
- Public validation URL: `https://relatoriodeobra-app.fly.dev/`.
- Custom domains requested: `relatoriodeobra.app.br` and `www.relatoriodeobra.app.br`.
- DNS authority remains at Umbler; certificate validation depends on adding the Fly DNS records there.

### Current Persistence

Stage 2 uses a local SQLite database at `backend/.data/app.sqlite` by default. This file is ignored by Git.

Current persisted tables:

- `companies`.
- `users`.
- `signatures`.
- `projects`.
- `report_templates`.
- `catalog_items`.
- `checklist_templates`.
- `checklist_items`.
- `reports`.
- `report_sections`.
- `report_labor_entries`.
- `report_equipment_entries`.
- `report_occurrence_entries`.
- `report_checklist_responses`.
- `report_tasks`.
- `report_attachments`.
- `pdf_versions`.
- `auth_sessions`.
- `audit_logs`.

The seed layer is idempotent: it inserts the default company, user, signature, project, RDO template, catalogs, checklist, and initial report only when they are missing.

PostgreSQL remains the intended production database, but the current repository layer keeps SQL isolated so the application can move from SQLite to PostgreSQL later without changing the frontend contract.

## Monorepo Structure

```text
backend/
  src/
    data/
      database.ts
      seed.ts
    modules/
    index.ts
    node-sqlite.d.ts
    server.ts
    types.ts
web/
  src/
    App.tsx
    api.ts
    data.ts
    main.tsx
    styles.css
    vite-env.d.ts
```

## Backend Boundaries

### API Layer

Receives HTTP requests from the web app, WhatsApp webhooks, and future integrations.

### Domain Layer

Owns project, report, template, catalog, approval, signature, and audit behavior.

### Provider Layer

Keeps external services behind replaceable interfaces:

- WhatsApp provider.
- Speech-to-text provider.
- PDF provider.
- Storage provider.
- AI extraction provider.

### Research Layer

Before implementation changes that are based on competitor behavior, the project must run a research layer:

- Firecrawl for public textual and structural content.
- Playwright for visual navigation and screenshots.
- Analyst Agent for feature matrix, flow analysis, risks, and backlog.
- Markdown files for durable project memory.

This layer is not production runtime. It is a product discovery and validation workflow.

## Data Model Groups

### Workspace

- Company.
- User.
- Access profile.
- Signature.

### Project

- Project.
- Project group.
- Coordinates: latitude and longitude for weather automation and future location-based workflows.
- Project settings.
- Project predefined labor.
- Project predefined equipment.

### Report

- Report.
- Report template.
- Report section.
- Structured climate value stored in the weather section JSON.
- Structured labor entries with own/outsourced source and optional service provider.
- Structured equipment, occurrence, checklist, task, photo, video, and attachment records.
- Report approval.
- Report PDF.
- Report amendment.
- Audit log.

### Catalog

- Labor role.
- Equipment.
- Occurrence type.
- Checklist template.
- Checklist item.

### Messaging

- Inbound message.
- Media file.
- Transcript.
- Chatbot interaction.

## Report State Machine

```text
draft -> pending_review -> approved
draft -> rejected
pending_review -> rejected
approved -> amended
approved -> revised
```

Rules:

- Only draft and pending review reports can be edited directly.
- Approved reports are immutable.
- Any correction after approval creates an amendment or revision.
- Approved PDF is generated from the immutable approved version.

## WhatsApp Flow

1. Meta Cloud API sends webhook.
2. Webhook signature is verified.
3. Event is stored as an inbound message.
4. Media is downloaded when needed.
5. Audio is transcribed.
6. Text/transcript is sent to Report Builder.
7. Chatbot asks missing questions if required.
8. Draft report is created.
9. Web user reviews and approves.
10. PDF is generated and notification can be sent.

## Security Baseline

- Store original inbound messages.
- Store audit history for all report changes.
- Store signatures separately from report content.
- Never overwrite approved reports.
- Keep provider credentials outside source code.
- Use role and permission placeholders from the beginning.
- Use HttpOnly session cookies with hashed session tokens in the database.
- Use same-site CSRF tokens for state-changing API calls.
- Restrict CORS to known local or configured origins.
- Require `DEFAULT_ADMIN_PASSWORD` in production instead of using the development fallback password.
- Limit large attachment payloads and fail external provider requests with a timeout.

## Development Environments

### Local

- Web app on port `5188`.
- Backend API on port `5100`.

### Environment Variables

- `PORT`.
- `HOST`.
- `DATABASE_PATH`.
- `DEFAULT_ADMIN_PASSWORD`.
- `CORS_ORIGIN`.
- `WHATSAPP_PROVIDER`.
- `WHATSAPP_WEBHOOK_SECRET`.
- `WHATSAPP_PHONE_NUMBER_ID`.
- `WHATSAPP_BUSINESS_ACCOUNT_ID`.
- `OPENAI_API_KEY`.
- `STORAGE_BUCKET`.

## Research Commands

- `npm run research:firecrawl`.
- `npm run research:playwright`.
- `npm run research:analyze`.
- `npm run research:all`.

Required variables for real competitor collection:

- `BENCHMARK_TARGET_URL`.
- `FIRECRAWL_API_KEY` for Firecrawl.

## Implemented API Surface

Current persisted API routes:

- `GET /health`.
- `GET /api/bootstrap`.
- `GET /api/users`.
- `GET /api/projects`.
- `POST /api/projects`.
- `PATCH /api/projects/:id`.
- `GET /api/projects/:id/overview`.
- `GET /api/projects/:id/weather`.
- `GET /api/reports`.
- `POST /api/reports`.
- `GET /api/reports/:id`.
- `PATCH /api/reports/:id`.
- `POST /api/reports/:id/submit-review`.
- `POST /api/reports/:id/approve`.
- `POST /api/reports/:id/reject`.
- `GET /api/reports/:id/audit`.
- `GET /api/reports/:id/pdf-versions`.
- `GET /api/audit/:entityType/:entityId`.
- `GET /api/report-templates`.
- `POST /api/report-templates`.
- `PATCH /api/report-templates/:id`.
- `GET /api/catalogs/labor`.
- `GET /api/catalogs/equipment`.
- `GET /api/catalogs/occurrence-types`.
- `GET /api/catalogs/project-groups`.
- `GET /api/catalogs/checklists`.
- `POST /api/catalogs/items/:kind`.
- `PATCH /api/catalogs/items/:kind/:id`.
- `POST /api/catalogs/checklists`.
- `PATCH /api/catalogs/checklists/:id`.
- `POST /api/whatsapp/webhook`.
