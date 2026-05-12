export type ProjectStatus = "not_started" | "stalled" | "in_progress" | "completed";
export type ContractType = "client" | "contractor" | "hired";
export type ReportStatus = "draft" | "pending_review" | "approved" | "rejected" | "revised" | "amended";

export interface Company {
  id: string;
  name: string;
  defaultLanguage: "pt-BR";
  timezone: string;
  requirePhotosByDefault: boolean;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  status: ProjectStatus;
  group: string;
  contractType: ContractType;
  responsible: string;
  contractor: string;
  contract: string;
  address: string;
  startDate: string;
  expectedEndDate: string;
  taskListEnabled: boolean;
  requirePhotos: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  status: "active" | "inactive";
  type: "standard" | "customized";
  dateType: "daily" | "period";
  enabledItems: string[];
  signaturePdfDisplay: "last_page" | "all_pages";
}

export interface CatalogItem {
  id: string;
  description: string;
  group?: string;
  status: "active" | "inactive";
  sourceType: "standard" | "customized";
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  status: "active" | "inactive";
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  order: number;
  itemLabel: string;
  question: string;
  answerType: "checkbox" | "text" | "number" | "date" | "photo" | "single_choice" | "multiple_choice";
  allowMultipleResponses: boolean;
  answers: string[];
}

export interface Report {
  id: string;
  projectId: string;
  templateId: string;
  reportDate: string;
  status: ReportStatus;
  creatorUserId: string;
  createdAt: string;
  approvedAt?: string;
  approverUserId?: string;
  signatureId?: string;
  pdfVersionId?: string;
}

