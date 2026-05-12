# Agents

## Purpose

This file defines AI and system agents that can support the construction report workflow.

## Product Agents

### Intake Agent

Receives messages from WhatsApp and web chat.

Responsibilities:

- Identify message type.
- Associate sender with a user.
- Associate message with a project when possible.
- Route audio to transcription.
- Route text to extraction.

### Transcription Agent

Processes audio and creates transcripts.

Responsibilities:

- Convert audio into text.
- Preserve audio metadata.
- Detect uncertain transcription.
- Send the transcript to the extraction agent.

### Report Builder Agent

Creates structured reports from message text or transcripts.

Responsibilities:

- Extract construction report fields.
- Create draft reports.
- Attach original messages and media.
- Mark missing or uncertain fields.

### Clarification Agent

Asks follow-up questions when report details are missing.

Responsibilities:

- Generate short, practical questions.
- Send questions through WhatsApp or web chat.
- Merge answers into the report draft.

### Chatbot Skill Agent

Runs the construction report chatbot flow on WhatsApp and web chat.

Responsibilities:

- Receive natural PT-BR field updates.
- Keep the conversation focused on report creation and report status.
- Ask the next missing question when a report is incomplete.
- Confirm extracted information before review.
- Send status updates for draft, pending review, approved, rejected, and PDF-ready reports.
- Hand off uncertain or sensitive messages to human review.

### Review Agent

Supports human review before final approval.

Responsibilities:

- Highlight uncertain fields.
- Suggest corrections.
- Compare report content with previous updates.
- Prepare approval summaries.

### Dashboard Agent

Creates management insights from approved reports.

Responsibilities:

- Summarize current status.
- Detect blockers and risks.
- Explain dashboard changes.
- Prepare weekly or daily executive summaries.

### Search Agent

Answers questions using the report history.

Responsibilities:

- Search approved reports.
- Return concise answers.
- Cite the related report, date, project, or message.
- State when information is not available.

## System Agents

### Webhook Worker

Processes provider webhooks reliably.

Responsibilities:

- Verify webhook signatures.
- Deduplicate events.
- Queue long-running processing.
- Persist raw inbound events.

### Media Worker

Downloads and stores media files.

Responsibilities:

- Download WhatsApp media.
- Store files in private object storage.
- Generate safe access links.
- Track media type and source message.

### Notification Worker

Sends outbound notifications.

Responsibilities:

- Send WhatsApp confirmations.
- Notify report reviewers.
- Alert managers about incidents or missing reports.

### Audit Worker

Keeps a historical trail of important actions.

Responsibilities:

- Log report creation, edits, approvals, and rejections.
- Track AI-generated changes.
- Preserve original message content.

### PDF Worker

Generates approved report PDFs.

Responsibilities:

- Generate PDFs only after approval.
- Apply signature placement rules from the report template.
- Store PDF version metadata.
- Link generated PDFs to the immutable approved report.
