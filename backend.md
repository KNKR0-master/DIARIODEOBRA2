# Backend And Settings Structure

## Purpose

Define the first backend and settings structure needed to support WhatsApp report intake, web dashboards, report approval, PDFs, users, project separation, and pre-registration catalogs.

## Core Entities

### Company

Represents the owner account.

Fields:

- ID.
- Name.
- Billing/subscription status.
- Default language: PT-BR.
- Timezone.
- Default photo requirement setting.
- Default PDF/signature setting.

### Project

Separates operational data in the MVP.

Fields:

- ID.
- Company ID.
- Name.
- Status.
- Project group.
- Contract type.
- Responsible.
- Contractor/client.
- Address.
- Start date.
- Expected end date.
- Contract number.
- Task list setting.

### User

Represents a person with system access or report responsibility.

Fields:

- ID.
- Name.
- Email.
- Password/auth provider.
- Job title.
- Access profile.
- Status.
- Companies accessible.
- Projects accessible.
- Digital/virtual signature.

### Access Profile

Permission structure to detail later.

Initial profiles:

- Administrator.
- Customized.
- Field user.
- Reviewer/approver.
- Client/read-only.

Reserved permission flags:

- Create report.
- Edit draft.
- Approve report.
- Export PDF.
- Manage templates.
- Manage users.
- Manage project settings.
- Manage pre-registration lists.

### Report Template

Defines the sections and rules for a report type.

### Report

Represents a construction report linked to a project, template, date, creator, status, approval metadata, source messages, and PDF.

Report statuses:

- Draft.
- Pending review.
- Approved.
- Rejected.
- Revised.
- Amended.

### Inbound Message

Stores WhatsApp and web chat messages.

Fields:

- ID.
- Channel.
- Provider.
- Sender.
- Project match.
- Text.
- Media references.
- Message timestamp.
- Processing status.

### Transcript

Stores audio transcription output.

Fields:

- ID.
- Source audio.
- Transcript text.
- Language.
- Confidence when available.
- Processing status.
- Linked inbound message.

### Audit Log

Stores report lifecycle events.

Events:

- Message received.
- Transcript created.
- Draft generated.
- Draft edited.
- Report approved.
- Report rejected.
- PDF generated.
- Signature applied.
- Amendment created.

## Project Settings

Project-level settings:

- Allow task list.
- Require photos.
- Enabled report templates.
- Predefined labor.
- Predefined equipment.
- Default occurrence types.
- Default checklists.
- Report copy policy.

Report copy policies:

- Copy information from last report.
- Copy from a specific report date.
- Start blank.

## WhatsApp Settings

Recommended first provider:

- Meta Cloud API / WhatsApp Business Platform.

Backend approach:

- Keep provider-specific logic behind a WhatsApp provider interface.
- Store provider credentials securely.
- Verify webhook signatures.
- Deduplicate webhook events.
- Queue media download, transcription, and report extraction.

Settings:

- WhatsApp provider.
- Phone number ID.
- Business account ID.
- Webhook secret.
- Message template IDs.
- Default language PT-BR.
- Human review required before approval.

## Chatbot Settings

The chatbot is a construction-report workflow agent.

Settings:

- Default language PT-BR.
- Project matching rules.
- Clarification question limit.
- Allowed commands.
- Required human review before approval.
- Escalation target when information is unclear.

## Audio Settings

Audio requirements:

- Accept WhatsApp voice notes and audio files.
- Accept web-recorded audio.
- Transcribe primarily in PT-BR.
- Preserve original audio.
- Flag low-confidence transcripts.
- Route transcript to the Report Builder Agent.

## Approval, Immutability, And Signatures

Reports start as drafts and become immutable after approval.

Approval metadata:

- Approver user ID.
- Approver name.
- Digital signature ID.
- Signature image or generated signature reference.
- Approval date/time.
- Timezone.
- Report hash/checksum.
- PDF version ID.

Correction policy:

- Approved reports cannot be overwritten.
- Corrections after approval create a revision, amendment, or audit-linked correction.

Signature options:

- Drawn on screen.
- Uploaded image.
- Generated virtual signature tied to user ID.

## PDF Settings

MVP behavior:

- Generate PDF only after approval.
- Include signature on the last page by default.
- Allow template setting to show signature on all pages.
- Include report ID, project, date, approver, user ID, approval timestamp, and checksum.

## Data Needed By Web App

- Sidebar counts.
- Project dashboard counters.
- Recent reports.
- Recent photos.
- Project information.
- Project list and filters.
- User list and profile filters.
- Report templates.
- Labor list.
- Equipment list.
- Occurrence types.
- Checklist templates.
- Report approval metadata.
- PDF links after approval.

## First Implemented Backend Workflow

The first functional backend workflow is in-memory and supports:

- Creating a project.
- Listing projects and project overview counters.
- Listing report templates and pre-registration catalogs.
- Creating an RDO draft for a project.
- Copying sections from the last project report.
- Editing draft/revised report sections.
- Sending a report to review.
- Approving a pending report.
- Storing creator, approver, timestamps, virtual signature ID, PDF version ID, and SHA-256 report hash.
- Rejecting a pending report.
- Blocking edits to approved reports with HTTP `409`.

The next backend stage should move reports, projects, templates, users, signatures, and audit events from seed arrays to a database-backed persistence layer.
