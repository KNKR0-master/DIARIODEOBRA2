# Construction Report App

## Purpose

Build a construction reporting platform that centralizes daily jobsite reports from WhatsApp, web forms, typed chat messages, and spoken input. The app should convert field communication into structured construction records, dashboards, and searchable project history.

## Core Idea

Workers, supervisors, engineers, and managers can send text or audio through WhatsApp or the web module. The system receives the message, identifies the project and context, transcribes audio when needed, extracts the relevant report information, and stores it as a structured construction report.

## Primary Users

- Field workers who send quick updates from the jobsite.
- Site supervisors who validate daily progress, workforce, materials, weather, issues, and photos.
- Project managers who monitor execution, delays, productivity, and risks.
- Back-office teams who need organized records for billing, compliance, and client communication.

## Main Channels

- WhatsApp text messages.
- WhatsApp audio messages with automatic transcription.
- Web chat for typed construction updates.
- Web voice input for spoken report creation.
- Web dashboards for management and analysis.

## Product Decisions

### Localization

The first market is Brazil. The first product language is Portuguese (PT-BR), including the web interface, default report templates, WhatsApp chatbot messages, PDF reports, pre-registration lists, and notifications.

English can remain available later as a secondary language, but the first structure should be designed around Brazilian construction reporting workflows.

### Company And Project Separation

The MVP should support one company account with multiple projects. Projects are the first operational separation for reports, dashboards, users, templates, labor, equipment, occurrences, and checklists.

The backend should still include a company reference from day one so multi-company access can be enabled later without redesigning the system.

### WhatsApp Provider

The recommended first provider is Meta Cloud API / WhatsApp Business Platform, connected through our own backend webhook layer.

Reason:

- It keeps the product close to the official WhatsApp Business Platform model.
- It reduces vendor lock-in.
- It gives the product direct control over webhooks, media download, templates, and message categories.
- It allows Twilio, Zenvia, 360dialog, or another provider to be added later behind the same provider interface.

Twilio can remain a fallback when faster onboarding, support, or a managed multi-channel layer is more important than direct provider control.

### Chatbot Skill Agent

The product should include a chatbot skill agent for construction report workflows. This is not a generic chatbot. It should be limited to:

- Receiving construction updates.
- Asking missing-field questions.
- Routing audio to transcription.
- Confirming extracted report data.
- Guiding users through report creation.
- Sending draft, pending approval, approved, rejected, and PDF-ready updates.

### Report Approval And Trust

Approved reports become immutable. After approval, users cannot overwrite the approved record directly. Corrections must be handled through a new revision, amendment, or audit entry.

Every approved report must store:

- Report creation date and time.
- Report approval date and time.
- Creator user ID and name.
- Approver user ID and name.
- Virtual signature ID.
- Signature image or generated signature reference.
- Report hash or checksum.
- Approved PDF version.
- Audit history.

### Photos And Attachments

Photos are optional in the MVP. The main user or administrator should be able to configure whether photos are optional or required by company, project, or report template.

### PDF Generation

PDF generation is required in the MVP after report approval. The approved PDF should include approval metadata, signature information, report ID, project, date, and generated PDF version.

### Benchmarking Before Implementation

Before changing layout or building new screens based on a competitor, the project should run the research workflow:

- Firecrawl for public textual and structural collection.
- Playwright for public visual flow capture.
- Analyst Agent for feature matrix, module map, process flows, UX suggestions, risks, and backlog.
- Markdown updates as the durable technical memory.

Implementation starts only after the research findings are reviewed and accepted. Inferred business rules must be marked as inference.

## Key Product Modules

### 1. Report Chat Hub

Central conversation area where all project updates arrive. It should support:

- Text messages.
- Audio messages.
- Transcribed audio.
- Attachments such as photos and documents.
- AI-assisted extraction of report fields.
- Review and correction before final report registration.

### 2. WhatsApp Integration

The WhatsApp module should receive and send messages using Meta Cloud API / WhatsApp Business Platform as the preferred first provider. The backend should expose a provider abstraction so Twilio, Zenvia, 360dialog, or another approved gateway can be supported later.

Expected capabilities:

- Receive text, audio, image, and document messages.
- Map sender phone numbers to users, companies, or jobsites.
- Ask follow-up questions when a report is incomplete.
- Send report summaries back to WhatsApp for confirmation.
- Notify responsible people about delays, incidents, or missing reports.

### 2.1 Chatbot Workflow

The chatbot workflow should concentrate construction report intake without becoming a generic assistant.

Expected capabilities:

- Understand short PT-BR field messages.
- Ask only the next practical question when information is missing.
- Accept text, audio, photos, videos, and documents.
- Confirm extracted data before a draft report is sent to review.
- Route low-confidence answers to human review.
- Send the approved PDF link or notification after report approval.

### 3. Audio Transcription

Audio messages should be transcribed before being processed as construction reports.

Expected capabilities:

- Convert WhatsApp audio files into text.
- Detect language when possible.
- Preserve original audio linked to the report.
- Mark transcription confidence when available.
- Allow manual correction in the web module.

Recommended skill: speech-to-text / audio transcription.

### 4. Report Structuring

The system should transform informal messages into structured records.

Example fields:

- Project.
- Jobsite / area / floor / unit.
- Date and time.
- Reporter.
- Workforce present.
- Activities executed.
- Materials used or missing.
- Equipment used.
- Weather conditions.
- Progress percentage or quantities.
- Issues, blockers, risks, accidents, and nonconformities.
- Photos, audio, documents, and references.
- Pending actions and responsible people.

### 5. Web Module

The web module should provide an operational workspace for creating, reviewing, correcting, and analyzing reports.

Expected views:

- Dashboard overview.
- Report inbox.
- Report detail.
- Project timeline.
- Project list and project registration.
- Project overview with counters, recent reports, recent photos, and project information.
- Chat console.
- Manual report creation.
- Voice report creation.
- Users, roles, and projects.
- Integration settings.
- Profile and virtual signature management.
- Pre-registration settings.

### 6. Dashboards

Dashboards should help managers understand project execution.

Initial dashboard ideas:

- Reports by project and date.
- Daily workforce by jobsite.
- Activities completed.
- Delays and blockers.
- Materials pending.
- Incidents and safety notes.
- Photos and evidence by date.
- Missing daily reports.
- Productivity trends.

## AI Responsibilities

AI should assist with:

- Audio transcription.
- Message classification.
- Entity extraction.
- Report summarization.
- Follow-up question generation.
- Risk and delay detection.
- Dashboard insight generation.
- Search over historical reports.

AI should not silently finalize critical records when confidence is low. In those cases, the app should request confirmation from a human user.

## MVP Scope

The first useful version should include:

- WhatsApp text intake.
- WhatsApp audio intake with transcription.
- Basic project and user mapping.
- AI extraction into structured daily reports.
- Web inbox to review and approve reports.
- Dashboard with report count, workforce, activities, and blockers.
- Manual web report creation by text.
- Basic voice input on web.
- PT-BR interface and default chatbot flow.
- Configurable RDO report template.
- Labor, equipment, occurrence, checklist, and project group pre-registration.
- Immutable approved reports with virtual signature and audit metadata.
- PDF generation after report approval.

## Future Scope

- Photo analysis.
- Automatic progress measurement.
- Offline mobile app.
- Client-facing report portal.
- Integration with ERP, finance, purchase orders, inventory, and schedules.
- Advanced analytics for productivity and delay prediction.
- Multi-company and multi-project permissions.

## Open Questions And Decisions

- Primary country and language: resolved. Brazil and Portuguese (PT-BR) first.
- WhatsApp provider: resolved for architecture. Use Meta Cloud API / WhatsApp Business Platform first, with a provider interface so alternatives can be added later.
- Chatbot: resolved. Add a construction-report chatbot skill agent focused on report intake, clarification, confirmation, and status updates.
- Company support: first structure assumes one company account with multiple projects. Keep company IDs in the backend so multiple companies can be enabled later.
- Daily report format: first format should be a configurable Relatório Diário de Obra (RDO) using report templates.
- Access and permissions: to be designed later. The first backend should reserve administrator, customized, field user, reviewer/approver, and client/read-only profiles.
- Approved report immutability: resolved. Approved reports are locked and corrections become revisions, amendments, or audit entries.
- Signature and trust: resolved. Store virtual signature, user ID, user name, creation date/time, approval date/time, hash/checksum, and approved PDF version.
- Photos: resolved for MVP. Photos are optional, with admin configuration to make them required by company, project, or template later.
- PDF generation: resolved. Required after report approval in the MVP.
