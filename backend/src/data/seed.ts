import type { CatalogItem, ChecklistTemplate, Company, Project, Report, ReportTemplate } from "../types.js";

export const company: Company = {
  id: "company-tt-home",
  name: "TT HOME LTDA",
  defaultLanguage: "pt-BR",
  timezone: "America/Sao_Paulo",
  requirePhotosByDefault: false
};

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
    address: "ENDERECO TESTE",
    startDate: "2026-05-12",
    expectedEndDate: "2026-11-11",
    taskListEnabled: false,
    requirePhotos: false
  }
];

export const reportTemplates: ReportTemplate[] = [
  {
    id: "template-rdo",
    name: "Relatorio Diario de Obra (RDO)",
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
  "Estagiario",
  "Gesseiro",
  "Mestre de Obra",
  "Pedreiro",
  "Servente",
  "Tecnico em Edificacoes"
].map((description, index) => ({
  id: `labor-${index + 1}`,
  description,
  group: "Mao de Obra Propria",
  status: "active",
  sourceType: "standard"
}));

export const equipment: CatalogItem[] = [
  "Betoneira",
  "Caminhao Basculante",
  "Compactador de solo",
  "Escavadeira",
  "Guindaste",
  "Picareta",
  "Pa Carregadeira",
  "Retro Escavadeira"
].map((description, index) => ({
  id: `equipment-${index + 1}`,
  description,
  status: "active",
  sourceType: "standard"
}));

export const occurrenceTypes: CatalogItem[] = [
  "Acidente de trabalho",
  "Alteracao de projeto",
  "Dia Chuvoso",
  "Dia parado",
  "Falta de equipamento",
  "Falta de material",
  "Falta de mao de obra",
  "Horas Improdutivas",
  "Retrabalho",
  "Solicitacao fora do escopo",
  "Solicitacoes do cliente"
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
    projectId: "project-test",
    templateId: "template-rdo",
    reportDate: "2026-05-12",
    status: "draft",
    creatorUserId: "user-joao",
    createdAt: "2026-05-12T12:00:00-03:00"
  }
];

