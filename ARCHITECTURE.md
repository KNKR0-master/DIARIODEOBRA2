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
- Provider interfaces for WhatsApp, transcription, PDF, and storage.

### Future Infrastructure

- PostgreSQL for relational data.
- Object storage for photos, videos, audio, attachments, and PDFs.
- Queue worker for WhatsApp media, transcription, report extraction, and PDF generation.
- Redis for queues and short-lived processing state if needed.

## Monorepo Structure

```text
backend/
  src/
    data/
    modules/
    index.ts
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
- Project settings.
- Project predefined labor.
- Project predefined equipment.

### Report

- Report.
- Report template.
- Report section.
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

## Development Environments

### Local

- Web app on port `5188`.
- Backend API on port `5100`.

### Environment Variables

- `PORT`.
- `HOST`.
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

Current in-memory API routes:

- `GET /health`.
- `GET /api/bootstrap`.
- `GET /api/projects`.
- `POST /api/projects`.
- `GET /api/projects/:id/overview`.
- `GET /api/reports`.
- `POST /api/reports`.
- `GET /api/reports/:id`.
- `PATCH /api/reports/:id`.
- `POST /api/reports/:id/submit-review`.
- `POST /api/reports/:id/approve`.
- `POST /api/reports/:id/reject`.
- `GET /api/report-templates`.
- `GET /api/catalogs/labor`.
- `GET /api/catalogs/equipment`.
- `GET /api/catalogs/occurrence-types`.
- `GET /api/catalogs/checklists`.
- `POST /api/whatsapp/webhook`.
