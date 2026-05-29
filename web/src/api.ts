const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5100";

export type ProjectStatus = "not_started" | "stalled" | "in_progress" | "completed";
export type ContractType = "client" | "contractor" | "hired";
export type ReportStatus = "draft" | "pending_review" | "approved" | "rejected" | "revised" | "amended";
export type AccessProfile = "administrator" | "customized" | "field_user" | "reviewer_approver" | "client_read_only";

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  jobTitle: string;
  accessProfile: AccessProfile;
  status: "active" | "inactive";
  signatureId: string;
  createdAt: string;
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

export interface ReportSections {
  weather: string;
  labor: string;
  equipment: string;
  activities: string;
  occurrences: string;
  comments: string;
  checklistNotes: string;
}

export interface ReportLaborEntry {
  id: string;
  reportId: string;
  catalogItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  notes: string;
}

export interface ReportEquipmentEntry {
  id: string;
  reportId: string;
  catalogItemId?: string;
  description: string;
  quantity: number;
  hours: number;
  notes: string;
}

export interface ReportOccurrenceEntry {
  id: string;
  reportId: string;
  catalogItemId?: string;
  description: string;
  severity: "info" | "attention" | "critical";
  notes: string;
}

export interface ReportChecklistResponse {
  id: string;
  reportId: string;
  checklistId?: string;
  checklistItemId?: string;
  itemLabel: string;
  question: string;
  answer: string;
  compliant?: boolean;
  notes: string;
}

export interface ReportTask {
  id: string;
  reportId: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  owner: string;
  dueDate: string;
}

export interface ReportStructuredData {
  laborEntries: ReportLaborEntry[];
  equipmentEntries: ReportEquipmentEntry[];
  occurrenceEntries: ReportOccurrenceEntry[];
  checklistResponses: ReportChecklistResponse[];
  tasks: ReportTask[];
}

export interface Report {
  id: string;
  number: number;
  projectId: string;
  templateId: string;
  reportDate: string;
  status: ReportStatus;
  creatorUserId: string;
  creatorName: string;
  createdAt: string;
  submittedAt?: string;
  sections: ReportSections;
  structuredData: ReportStructuredData;
  approvedAt?: string;
  approverUserId?: string;
  approverName?: string;
  signatureId?: string;
  pdfVersionId?: string;
  hash?: string;
}

export interface AuditLog {
  id: string;
  entityType: "project" | "report" | "report_pdf" | "user" | "signature" | "system";
  entityId: string;
  eventType: string;
  actorUserId: string;
  actorName: string;
  occurredAt: string;
  metadata: Record<string, unknown>;
}

export interface PdfVersion {
  id: string;
  reportId: string;
  versionNumber: number;
  status: "placeholder" | "generated" | "failed";
  filePath?: string;
  createdAt: string;
  metadata: Record<string, unknown>;
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
  items: Array<{
    id: string;
    order: number;
    itemLabel: string;
    question: string;
    answerType: string;
    allowMultipleResponses: boolean;
    answers: string[];
  }>;
}

export interface CreateProjectPayload {
  name: string;
  status: ProjectStatus;
  group: string;
  contractType: ContractType;
  responsible?: string;
  contractor?: string;
  contract?: string;
  address?: string;
  startDate?: string;
  expectedEndDate?: string;
  taskListEnabled?: boolean;
  requirePhotos?: boolean;
}

export interface UserPayload {
  name: string;
  email: string;
  jobTitle: string;
  accessProfile: AccessProfile;
  status: "active" | "inactive";
}

export interface ReportTemplatePayload {
  name: string;
  status: "active" | "inactive";
  type: "standard" | "customized";
  dateType: "daily" | "period";
  enabledItems: string[];
  signaturePdfDisplay: "last_page" | "all_pages";
}

export interface CatalogItemPayload {
  description: string;
  group?: string;
  status: "active" | "inactive";
  sourceType: "standard" | "customized";
}

export interface ChecklistPayload {
  name: string;
  status: "active" | "inactive";
  items: ChecklistTemplate["items"];
}

export interface CreateReportPayload {
  projectId: string;
  templateId: string;
  reportDate: string;
  copyFromLast: boolean;
}

export interface UpdateReportPayload {
  sections?: Partial<ReportSections>;
  structuredData?: ReportStructuredData;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? "Erro inesperado na API");
  }

  return body;
}

export const api = {
  async getProjects() {
    return request<{ projects: Project[] }>("/api/projects");
  },

  async createProject(payload: CreateProjectPayload) {
    return request<{ project: Project }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getProjectOverview(id: string) {
    return request<{ project: Project; counters: { reports: number; activities: number; occurrences: number; comments: number; photos: number; videos: number }; recentReports: Report[]; recentPhotos: string[] }>(`/api/projects/${id}/overview`);
  },

  async getReports(projectId?: string) {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    return request<{ reports: Report[] }>(`/api/reports${query}`);
  },

  async createReport(payload: CreateReportPayload) {
    return request<{ report: Report }>("/api/reports", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateReport(id: string, payload: UpdateReportPayload) {
    return request<{ report: Report }>(`/api/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async submitReport(id: string) {
    return request<{ report: Report }>(`/api/reports/${id}/submit-review`, {
      method: "POST",
      body: JSON.stringify({})
    });
  },

  async approveReport(id: string) {
    return request<{ report: Report }>(`/api/reports/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ approverUserId: "user-joao", approverName: "JOAO VICTOR" })
    });
  },

  async updateProject(id: string, payload: CreateProjectPayload) {
    return request<{ project: Project }>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async getUsers() {
    return request<{ users: User[] }>("/api/users");
  },

  async createUser(payload: UserPayload) {
    return request<{ user: User }>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateUser(id: string, payload: UserPayload) {
    return request<{ user: User }>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async getReportAudit(id: string) {
    return request<{ auditLogs: AuditLog[] }>(`/api/reports/${id}/audit`);
  },

  async getReportPdfVersions(id: string) {
    return request<{ pdfVersions: PdfVersion[] }>(`/api/reports/${id}/pdf-versions`);
  },

  async getReportTemplates() {
    return request<{ reportTemplates: ReportTemplate[] }>("/api/report-templates");
  },

  async createReportTemplate(payload: ReportTemplatePayload) {
    return request<{ reportTemplate: ReportTemplate }>("/api/report-templates", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateReportTemplate(id: string, payload: ReportTemplatePayload) {
    return request<{ reportTemplate: ReportTemplate }>(`/api/report-templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async getLabor() {
    return request<{ labor: CatalogItem[] }>("/api/catalogs/labor");
  },

  async getEquipment() {
    return request<{ equipment: CatalogItem[] }>("/api/catalogs/equipment");
  },

  async getOccurrenceTypes() {
    return request<{ occurrenceTypes: CatalogItem[] }>("/api/catalogs/occurrence-types");
  },

  async getChecklists() {
    return request<{ checklists: ChecklistTemplate[] }>("/api/catalogs/checklists");
  },

  async createCatalogItem(kind: "labor" | "equipment" | "occurrences", payload: CatalogItemPayload) {
    return request<{ item: CatalogItem }>(`/api/catalogs/items/${kind}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateCatalogItem(kind: "labor" | "equipment" | "occurrences", id: string, payload: CatalogItemPayload) {
    return request<{ item: CatalogItem }>(`/api/catalogs/items/${kind}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async createChecklist(payload: ChecklistPayload) {
    return request<{ checklist: ChecklistTemplate }>("/api/catalogs/checklists", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateChecklist(id: string, payload: ChecklistPayload) {
    return request<{ checklist: ChecklistTemplate }>(`/api/catalogs/checklists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }
};
