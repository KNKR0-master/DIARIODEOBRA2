# Comparison Analysis

## Evidence Sources

- Authenticated competitor screenshots: `research/output/competitor-auth/`.
- Current app screenshots: `research/output/current-app/`.
- Competitor tracked review: `research/competitor-auth-review.md`.
- Current app tracked review: `research/current-app-visual-review.md`.

Raw screenshots are not committed because they may contain account context.

## Competitor Module Map

### Top Navigation

- Obras.
- Relatórios.
- Análise de dados.
- Cadastros.
- Language selector.
- Global Adicionar button.
- User/account menu.

### Obras

- Project list.
- Search.
- Group/status filters.
- Project cards.
- Project detail dashboard.
- Project sidebar with overview, reports, search filter, and edit project.

### Relatórios

- Reports list with status grouping.
- Statuses visible in the reviewed account:
  - Preenchendo.
  - Revisar.
  - Aprovado.
- Table columns:
  - Data.
  - Nº.
  - Obra.
  - Modelo de relatório.
  - Status.
- Print/export action.

### Análise De Dados

Submodules identified:

- Visão geral.
- Relatórios criados.
- Aguardando aprovação.
- Lista de tarefas.
- Fotos.
- Vídeos.
- Anexos.
- Mão de obra.
- Equipamentos.

### Cadastros

Submodules identified:

- Meu perfil.
- Assinatura.
- Empresa.
- Usuários (login de acesso).
- Grupos de obra.
- Modelos de relatórios.
- Mão de obra.
- Equipamentos.
- Tipos de ocorrências.
- Checklist.
- Predefinir mão de obra.
- Predefinir equipamentos.

## Current App Match

Already close:

- Project/obra-centered structure.
- Top navigation with project, report, analysis, settings areas.
- Project cards and project overview.
- Add project and add report modals.
- Profile/signature screen.
- User access screen.
- Report templates.
- Labor, equipment, occurrence, and checklist catalogs.

Needs adjustment:

- Use `Obras` and `Cadastros` terminology in the top navigation.
- Use a single global `ADICIONAR` action in the top bar as the primary create entry.
- Make reports status workflow match `Preenchendo`, `Revisar`, and `Aprovado`.
- Expand analysis section into separate subviews instead of a generic dashboard only.
- Add route-based navigation and deep links.
- Replace static prototype data with backend APIs.

## First UI Alignment Decision

Make a small language/navigation pass now:

- Rename top `Projetos` to `Obras`.
- Rename top `Configurações` to `Cadastros`.
- Rename primary create button to `ADICIONAR`.
- Rename project list title to `Obras`.
- Use `Pesquisa` placeholder where the competitor does.
- Keep `Chat RDO` as our differentiator, because the WhatsApp/chat workflow is core to our product.

## Inferences

- Inference: `Obras` is the product's primary operational object and should map to our `Project`.
- Inference: `Cadastros` is broader than settings and includes both account settings and operational catalogs.
- Inference: report approval should follow a visible status pipeline from filling/draft to review to approved.
- Inference: data analysis should be treated as its own module family, not just one dashboard page.

