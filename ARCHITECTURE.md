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
    data.ts
    main.tsx
    styles.css
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

- Web app on port `5173`.
- Backend API on port `5099`.

### Environment Variables

- `PORT`.
- `HOST`.
- `WHATSAPP_PROVIDER`.
- `WHATSAPP_WEBHOOK_SECRET`.
- `WHATSAPP_PHONE_NUMBER_ID`.
- `WHATSAPP_BUSINESS_ACCOUNT_ID`.
- `OPENAI_API_KEY`.
- `STORAGE_BUCKET`.

