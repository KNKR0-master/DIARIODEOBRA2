# Pre-Registration Structure

## Purpose

Define the first reusable catalogs used by projects and construction reports.

## Project Groups

Purpose: group projects for filtering, permissions, and organization.

Default value:

- Todas as obras.

Fields:

- ID.
- Company ID.
- Name.
- Status.
- Created at.
- Updated at.

Usage:

- Required when creating a project.
- Used as a project filter.
- Helps prepare the system for future multi-company access.

## Report Templates

Purpose: define which sections a report type requires before it can be used in a project.

Default template:

- Relatório Diário de Obra (RDO).
- Status: Active.
- Type: Standard.

Fields:

- ID.
- Name.
- Status: Active or Inactive.
- Template type: Standard or Customized.
- Date type: one report per day or one report per period.
- Enabled items.
- Signature PDF display.
- Created at.
- Updated at.

Enabled report items:

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

Signature PDF display options:

- Display signature on all PDF pages.
- Display signature only on the last page of the PDF.

## Labor List

Purpose: reusable catalog of job roles that can be selected in reports or assigned to projects.

Default group:

- Mão de Obra Própria.

Default values:

- Ajudante.
- Eletricista.
- Engenheiro.
- Estagiário.
- Gesseiro.
- Mestre de Obra.
- Pedreiro.
- Servente.
- Técnico em Edificações.

Fields:

- ID.
- Job title.
- Group.
- Source type: Standard or Customized.
- Status.
- Created at.
- Updated at.

Actions:

- Search.
- Filter by group.
- Add.
- Edit.
- Delete.
- Import/export later.

Report entry behavior:

- The global labor list provides reusable function options for RDO entries.
- Users can choose "Outra" in the RDO editor to type a new function.
- Custom functions inserted in the current report are added to the function dropdown for later edits in the same report.
- Historical RDO labor entries must preserve their description even if the catalog item is later deactivated or renamed.
- Each report labor entry can be classified as Própria or Terceirizada.
- Terceirizada entries can store the service provider company name.

## Equipment List

Purpose: reusable catalog of equipment used in construction reports.

Default values:

- Betoneira.
- Caminhão Basculante.
- Compactador de solo.
- Escavadeira.
- Guindaste.
- Picareta.
- Pá Carregadeira.
- Retro Escavadeira.

Fields:

- ID.
- Description.
- Source type: Standard or Customized.
- Status.
- Created at.
- Updated at.

Actions:

- Search.
- Add.
- Edit.
- Delete.
- Import/export later.

Report entry behavior:

- The global equipment list provides reusable equipment options for RDO entries.
- Users can choose "Outro" in the RDO editor to type a new equipment name.
- Custom equipment inserted in an RDO is added to the available equipment suggestions for future launches.
- Each report equipment entry can store origin as own, rented, or other.
- Rented equipment can store rental date, return deadline, rental company, and return-deadline alert settings.
- Rental company names typed in the RDO are saved as suggestions for later rented equipment entries.
- Equipment entries can store a photo for visual identification in the report.
- Inserted equipment entries can be edited only after the user clicks the pencil icon.

## Occurrence Types

Purpose: predefined incident, blocker, or event categories used in reports.

Default values:

- Acidente de trabalho.
- Alteração de projeto.
- Dia Chuvoso.
- Dia parado.
- Falta de equipamento.
- Falta de material.
- Falta de mão de obra.
- Horas Improdutivas.
- Retrabalho.
- Solicitação fora do escopo.
- Solicitações do cliente.

Fields:

- ID.
- Description.
- Source type: Standard or Customized.
- Status.
- Created at.
- Updated at.

Actions:

- Search.
- Add occurrence type.
- Edit.
- Delete.
- Import/export later.

Report entry behavior:

- RDO occurrences are created through an "Adicionar Ocorrência" modal.
- Each occurrence stores the selected type, a free-text description, start/end time, and optional photo evidence.
- The default list is used as the dropdown source, but the user's own description remains preserved in the report.

## Checklist

Purpose: reusable checklist templates that can be attached to report templates or project reports.

Fields:

- ID.
- Name.
- Status.
- Items.
- Created at.
- Updated at.

Checklist item fields:

- ID.
- Order.
- Item label.
- Question.
- Answer type.
- Allow multiple responses.
- Answers.

Current answer types:

- Checklist/conformity.
- Text.
- Number.
- Date.
- Single choice.
- Multiple choice.

Default answer values:

- Matches.
- Does not match.
- Not applicable.

Actions:

- Add checklist.
- Edit checklist.
- Add question.
- Remove question.
- Configure answer type.
- Configure answer options.
- Allow multiple responses.
- Save.

RDO behavior:

- Active checklists appear in the Checklist area of the RDO.
- The user answers a checklist through a modal opened from the report editor.
- Checklist responses are saved as structured report data.
- The project-level Checklists tab lists answered checklists by title, response/report date, and RDO number only.
- Full checklist answers remain available inside the source RDO.
- Save.

## Project-Level Predefined Labor

Purpose: define which labor roles are available for a specific project.

Fields:

- ID.
- Project ID.
- Labor ID.
- Job title.
- Group.
- Planned quantity.
- Active on project.
- Created at.
- Updated at.

Rules:

- Can be copied from the global labor list.
- Can be customized per project.
- Must not delete historical report records if removed later from project presets.

## Project-Level Predefined Equipment

Purpose: define which equipment options are available for a specific project.

Fields:

- ID.
- Project ID.
- Equipment ID.
- Description.
- Planned quantity.
- Active on project.
- Created at.
- Updated at.

Rules:

- Can be copied from the global equipment list.
- Can be customized per project.
- Must preserve historical reports if equipment is later removed from project presets.

