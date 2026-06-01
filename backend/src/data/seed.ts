import type { CatalogItem, ChecklistTemplate, Company, Project, Report, ReportTemplate, Signature, User } from "../types.js";

export const company: Company = {
  id: "company-tt-home",
  name: "TT HOME LTDA",
  defaultLanguage: "pt-BR",
  timezone: "America/Sao_Paulo",
  requirePhotosByDefault: false
};

export const signatures: Signature[] = [
  {
    id: "sig-user-joao-virtual",
    userId: "user-joao",
    type: "virtual",
    displayName: "Assinatura virtual - JOAO VICTOR",
    createdAt: "2026-05-12T12:00:00-03:00",
    metadata: {
      source: "seed",
      trustModel: "user_id_and_approval_timestamp"
    }
  }
];

export const users: User[] = [
  {
    id: "user-joao",
    companyId: company.id,
    name: "JOAO VICTOR",
    email: "joaovictor.castro@tthome.com.br",
    jobTitle: "SOCIO PROPRIETARIO",
    accessProfile: "administrator",
    status: "active",
    signatureId: "sig-user-joao-virtual",
    createdAt: "2026-05-12T12:00:00-03:00"
  }
];

export const projects: Project[] = [
  {
    id: "project-test",
    companyId: company.id,
    name: "PROJETO TESTE",
    status: "in_progress",
    group: "Todas as obras",
    contractType: "contractor",
    responsible: "ENGENHEIRO TESTE",
    contractor: "PREFEITURA TESTE",
    contract: "1234567890",
    address: "ENDEREÇO TESTE",
    startDate: "2026-05-12",
    expectedEndDate: "2026-11-11",
    taskListEnabled: false,
    requirePhotos: false
  }
];

export const reportTemplates: ReportTemplate[] = [
  {
    id: "template-rdo",
    name: "Relatório Diário de Obra (RDO)",
    status: "active",
    type: "standard",
    dateType: "daily",
    enabledItems: [
      "weather_conditions",
      "labor",
      "equipment",
      "activity",
      "occurrence",
      "checklist",
      "commentary",
      "photo_gallery",
      "video",
      "attachment",
      "signature"
    ],
    signaturePdfDisplay: "last_page"
  }
];

export const labor: CatalogItem[] = [
  "Ajudante",
  "Eletricista",
  "Engenheiro",
  "Estagiário",
  "Gesseiro",
  "Mestre de Obra",
  "Pedreiro",
  "Servente",
  "Técnico em Edificações"
].map((description, index) => ({
  id: `labor-${index + 1}`,
  description,
  group: "Mão de Obra Própria",
  status: "active",
  sourceType: "standard"
}));

export const equipment: CatalogItem[] = [
  "Betoneira",
  "Caminhão Basculante",
  "Compactador de solo",
  "Escavadeira",
  "Guindaste",
  "Picareta",
  "Pá Carregadeira",
  "Retro Escavadeira"
].map((description, index) => ({
  id: `equipment-${index + 1}`,
  description,
  status: "active",
  sourceType: "standard"
}));

export const projectGroups: CatalogItem[] = [
  "Todas as obras",
  "Obras residenciais",
  "Obras comerciais"
].map((description, index) => ({
  id: `project-group-${index + 1}`,
  description,
  status: "active",
  sourceType: "standard"
}));

export const occurrenceTypes: CatalogItem[] = [
  "Acidente de trabalho",
  "Alteração de projeto",
  "Dia Chuvoso",
  "Dia parado",
  "Falta de equipamento",
  "Falta de material",
  "Falta de mão de obra",
  "Horas Improdutivas",
  "Retrabalho",
  "Solicitação fora do escopo",
  "Solicitações do cliente"
].map((description, index) => ({
  id: `occurrence-${index + 1}`,
  description,
  status: "active",
  sourceType: "standard"
}));

export const checklists: ChecklistTemplate[] = [
  {
    id: "checklist-quality",
    name: "Checklist de qualidade",
    status: "active",
    items: [
      {
        id: "checklist-quality-1",
        order: 1,
        itemLabel: "1 Item",
        question: "O servico executado esta conforme?",
        answerType: "checkbox",
        allowMultipleResponses: false,
        answers: ["Matches", "Does not match", "Not applicable"]
      }
    ]
  }
];

export const reports: Report[] = [
  {
    id: "report-draft-1",
    number: 1,
    projectId: "project-test",
    templateId: "template-rdo",
    reportDate: "2026-05-12",
    status: "draft",
    creatorUserId: "user-joao",
    creatorName: "JOAO VICTOR",
    createdAt: "2026-05-12T12:00:00-03:00",
    sections: {
      weather: "Manha com tempo aberto e tarde nublada.",
      labor: "Engenheiro: 1\nMestre de obra: 1\nPedreiro: 2\nServente: 3",
      equipment: "Betoneira: 1\nPá carregadeira: 1",
      activities: "Execucao de alvenaria no pavimento 2 e conferencia de prumo.",
      occurrences: "Sem ocorrencias criticas registradas.",
      comments: "Frente liberada para continuidade no proximo dia util.",
      checklistNotes: "Conferencia visual realizada pelo responsavel da obra."
    },
    structuredData: {
      laborEntries: [
        { id: "report-draft-1-labor-1", reportId: "report-draft-1", catalogItemId: "labor-3", description: "Engenheiro", quantity: 1, unit: "profissional", notes: "" },
        { id: "report-draft-1-labor-2", reportId: "report-draft-1", catalogItemId: "labor-6", description: "Mestre de Obra", quantity: 1, unit: "profissional", notes: "" },
        { id: "report-draft-1-labor-3", reportId: "report-draft-1", catalogItemId: "labor-7", description: "Pedreiro", quantity: 2, unit: "profissionais", notes: "" },
        { id: "report-draft-1-labor-4", reportId: "report-draft-1", catalogItemId: "labor-8", description: "Servente", quantity: 3, unit: "profissionais", notes: "" }
      ],
      equipmentEntries: [
        { id: "report-draft-1-equipment-1", reportId: "report-draft-1", catalogItemId: "equipment-1", description: "Betoneira", quantity: 1, hours: 6, notes: "" },
        { id: "report-draft-1-equipment-2", reportId: "report-draft-1", catalogItemId: "equipment-7", description: "Pá Carregadeira", quantity: 1, hours: 2, notes: "" }
      ],
      occurrenceEntries: [
        { id: "report-draft-1-occurrence-1", reportId: "report-draft-1", description: "Sem ocorrências críticas registradas", severity: "info", notes: "" }
      ],
      checklistResponses: [
        { id: "report-draft-1-checklist-1", reportId: "report-draft-1", checklistId: "checklist-quality", checklistItemId: "checklist-quality-1", itemLabel: "1 Item", question: "O servico executado esta conforme?", answer: "Matches", compliant: true, notes: "Conferência visual realizada." }
      ],
      tasks: [
        { id: "report-draft-1-task-1", reportId: "report-draft-1", description: "Continuar alvenaria do pavimento 2", status: "pending", owner: "Mestre de Obra", scheduleItem: "Alvenaria pavimento 2", startDate: "2026-05-12", dueDate: "2026-05-13", percentComplete: 35 }
      ]
    }
  }
];
