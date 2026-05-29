# Frontend Structure

## Purpose

Define the first web module structure based on the provided competitor screenshots. This is a first product structure, not the final UI.

## Design Direction

- Language first: Portuguese (PT-BR).
- Style: operational dashboard, compact, direct, and data-first.
- Layout: dark blue top navigation, light gray workspace background, white panels, blue active states, green save/active actions, and orange section headings.
- Components: dense forms, tables, filters, badges, cards, modal dialogs, and sidebars.
- Buttons should use familiar icons for add, edit, delete, save, upload, print, back, close, camera, and microphone actions.

## Benchmarking Gate

The frontend should not be made more similar to a competitor only from memory or screenshots. Before layout changes:

- Firecrawl should collect public text and structure when credentials are available.
- Playwright should capture the public visual flow.
- Findings should be added to `research/feature-matrix.md`.
- Any rule that is inferred must be marked as inference.
- Implementation starts only after the reviewed requirements are accepted.

## Global Navigation

Top navigation:

- Company name.
- Projects.
- Reports.
- Data Analysis.
- Settings.
- Language selector.
- Create button.
- User menu with avatar, name, email, and notifications.

Settings sidebar:

- My profile.
- Subscription.
- Company.
- Users (access login).
- Project groups.
- Report templates.
- Labor.
- Equipment.
- Types of occurrences.
- Checklist.
- Predefine labor.
- Predefine equipments.

Project sidebar:

- Overview.
- Reports.
- Search filter.
- Edit project.

## Pages

### Projects

Purpose: list and create projects.

Main features:

- Search.
- Filter by project group.
- Filter by status.
- Grid/list toggle.
- Project cards with status, report count, and project name.
- Add project modal.

Add project modal:

- Complete registration.
- Simple registration.
- Name.
- Responsible.
- Type of contract.
- Contractor.
- Start date.
- Expected end date.
- Group.
- Contract.
- Status.
- Address.
- Task list setting.

Contract types:

- Client.
- Contractor.
- Hired.

Project statuses:

- Not started.
- Stalled.
- In progress.
- Completed.

### Project Overview

Purpose: summarize one project.

Main features:

- Back action.
- Project name.
- Project sidebar.
- KPI cards for reports, activities, occurrences, comments, photos, and videos.
- Recent reports panel.
- Recent photos panel.
- Project information panel.

Project information:

- Status.
- Contract.
- Address.
- Responsible.
- Contractor.
- Start date.
- Expected end date.
- Contractual deadline.
- Elapsed time.
- Time left.

### Reports

Purpose: create, review, approve, and search construction reports.

Main features:

- Report list.
- Report filters by project, date, status, and template.
- Add report modal.
- Report detail/editor.
- Approval metadata.
- PDF download after approval.

Add report modal:

- Select project.
- Report date.
- Copy information from last report.
- Copy from a specific report date.
- Save.

Report editor sections:

- Working hours.
- Weather conditions.
- Labor.
- Equipment.
- Activity.
- Occurrence.
- Checklist.
- Material control.
- Commentary.
- Photo gallery.
- Video.
- Attachment.
- Signature.

### Report Chat Hub

Purpose: concentrate reports created from WhatsApp and web messages.

Main features:

- Conversation list.
- Message detail.
- Text input.
- Voice recording.
- Attachment upload.
- Audio transcript preview.
- Extracted report draft preview.
- Missing-field questions.
- Send to review.

### Settings: My Profile

Purpose: manage user profile and signature.

Main features:

- User information.
- Profile image upload.
- Name.
- Access email.
- Password change.
- Companies the user can access.
- My signature.

Signature options:

- Draw signature on screen.
- Upload signature image.
- Generate virtual signature tied to user ID.

### Settings: Users

Purpose: manage access login users.

Main features:

- Search.
- Filter by status.
- Filter by profile.
- User groups: administrators, customized, clients.
- Add/edit/delete users.

User form:

- Name.
- Access email.
- Access password.
- Job title.
- Access profile.
- Status active/inactive.

Access profiles will be detailed later, but the first structure should reserve administrator, customized, field user, reviewer/approver, and client/read-only profiles.

### Settings: Report Templates

Purpose: create reusable report models.

Main features:

- Search.
- Add template.
- Edit template.
- Status badge.
- Standard/customized badge.

Template form:

- Name of report.
- Date type.
- Enabled report items.
- Signature display option for PDF.

### Settings: Pre-Registration Lists

Purpose: manage catalogs used in reports and projects.

Pages:

- Project groups.
- Labor.
- Equipment.
- Types of occurrences.
- Checklist.
- Project-level predefined labor.
- Project-level predefined equipment.

## Approval UI Requirements

Approved reports must clearly display:

- Approved status.
- Creator.
- Approver.
- Creation date/time.
- Approval date/time.
- Virtual signature ID.
- Report ID.
- PDF version.

Approved records are read-only. Any correction action should create a revision or amendment flow.

## First Functional Frontend Wireframe

The first implemented frontend wireframe is now:

1. Obras list with add project action.
2. Project overview with report counters and recent RDOs.
3. Reports inbox filtered by selected project.
4. Add RDO modal with project, template, date, and copy-from-last option.
5. RDO detail/editor with weather, labor, equipment, activities, occurrences, checklist notes, and comments.
6. Lifecycle buttons: save draft, send to review, approve report.
7. Approved report lock state with creator, approver, creation time, approval time, virtual signature ID, PDF version ID, and hash prefix.

This is the first functional product structure. It is intentionally not the final UI.
