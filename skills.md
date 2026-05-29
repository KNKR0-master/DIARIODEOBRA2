# Skills

## Purpose

This file defines the specialized capabilities needed to build and operate the construction report app.

## Required Product Skills

### WhatsApp Integration Skill

Handles inbound and outbound WhatsApp communication.

Responsibilities:

- Receive text, audio, image, and document messages.
- Download media files securely.
- Send confirmations, summaries, and follow-up questions.
- Connect sender phone numbers to users and projects.
- Handle delivery failures and duplicate webhook events.

### Chatbot Workflow Skill

Guides users through construction report creation by WhatsApp and web chat.

Responsibilities:

- Understand PT-BR construction report messages.
- Ask short follow-up questions for missing report fields.
- Route voice messages to the speech-to-text skill.
- Confirm extracted report information with the user.
- Send draft, review, approval, rejection, and PDF-ready updates.
- Keep the bot limited to construction report workflows.

### Speech-to-Text Skill

Converts voice messages and browser voice input into text.

Responsibilities:

- Transcribe WhatsApp audio.
- Transcribe web-recorded audio.
- Prioritize Portuguese (PT-BR), with English support later.
- Return transcript text, language, duration, and confidence when available.
- Preserve a link between transcript and source audio.

Candidate technologies:

- OpenAI audio transcription.
- Whisper-compatible transcription service.
- Cloud speech-to-text provider.

### Report Extraction Skill

Transforms informal messages into structured construction report fields.

Responsibilities:

- Identify project, jobsite, date, people, activities, materials, blockers, incidents, and actions.
- Ask for missing critical information.
- Score confidence for extracted fields.
- Keep the original source text attached to the structured report.

### Report Validation Skill

Checks whether a generated report is complete and consistent.

Responsibilities:

- Detect missing project, date, reporter, and activity.
- Flag contradictory information.
- Require human review for low-confidence records.
- Suggest corrections without overwriting the original message.

### Dashboard Insight Skill

Turns stored reports into useful management insights.

Responsibilities:

- Summarize progress by project.
- Identify recurring blockers.
- Detect missing daily reports.
- Surface safety or quality risks.
- Explain dashboard trends in plain language.

### Search and Memory Skill

Allows users to ask questions over historical construction reports.

Responsibilities:

- Search reports by project, date, person, activity, material, and issue.
- Answer questions using only stored report data.
- Provide source references when possible.
- Avoid inventing facts when records are missing.

### Benchmark Research Skill

Collects and structures competitor evidence before implementation.

Responsibilities:

- Use Firecrawl for public page maps, markdown content, docs, FAQs, integration pages, and feature pages.
- Use structured extraction schemas for features, modules, flows, permissions, integrations, limitations, and benefits.
- Store raw outputs as JSON/Markdown.
- Preserve source URLs.

### Visual Flow Analysis Skill

Documents public UI behavior with Playwright.

Responsibilities:

- Capture screenshots.
- Map menus, modals, filters, forms, and states.
- Record user journeys.
- Identify interface patterns that should become requirements.

### Analytical Benchmark Skill

Turns collected data into project memory.

Responsibilities:

- Create feature matrices.
- Create module maps.
- Create process flow summaries.
- Compare systems.
- Suggest UX/UI improvements.
- Generate implementation backlog.
- Mark all inferred rules as inference.

## Engineering Skills

### Backend API Skill

Builds the API, database models, authentication, webhook handling, and business rules.

### Web Frontend Skill

Builds the dashboard, inbox, report editor, chat console, and voice input experience.

### Data Modeling Skill

Designs database schemas for projects, users, messages, reports, media, extracted fields, approvals, and audit history.

### Integration Reliability Skill

Handles retries, queues, idempotency, rate limits, webhook security, and provider failures.

### Security and Compliance Skill

Manages permissions, audit logs, data retention, private media access, and safe handling of construction records.

### PDF Generation Skill

Creates the approved report PDF after human approval.

Responsibilities:

- Generate PDFs only from approved report versions.
- Include report ID, project, date, creator, approver, approval date/time, user ID, signature, and checksum.
- Follow report template signature placement settings.
- Preserve the generated PDF version in the audit trail.
