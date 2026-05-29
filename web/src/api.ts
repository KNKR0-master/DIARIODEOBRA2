const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5100";

export type ProjectStatus = "not_started" | "stalled" | "in_progress" | "completed";
export type ContractType = "client" | "contractor" | "hired";
export type ReportStatus = "draft" | "pending_review" | "approved" | "rejected" | "revised" | "amended";

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

export interface CreateReportPayload {
  projectId: string;
  templateId: string;
  reportDate: string;
  copyFromLast: boolean;
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

  async updateReport(id: string, sections: Partial<ReportSections>) {
    return request<{ report: Report }>(`/api/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ sections })
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

  async getReportAudit(id: string) {
    return request<{ auditLogs: AuditLog[] }>(`/api/reports/${id}/audit`);
  },

  async getReportPdfVersions(id: string) {
    return request<{ pdfVersions: PdfVersion[] }>(`/api/reports/${id}/pdf-versions`);
  },

  async getReportTemplates() {
    return request<{ reportTemplates: ReportTemplate[] }>("/api/report-templates");
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
  }
};
