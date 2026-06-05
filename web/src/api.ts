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
  latitude: string;
  longitude: string;
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
  sourceType: "own" | "outsourced";
  serviceProvider: string;
  notes: string;
}

export interface ReportEquipmentEntry {
  id: string;
  reportId: string;
  catalogItemId?: string;
  description: string;
  quantity: number;
  hours: number;
  originType: "own" | "rented" | "other";
  originDetail: string;
  rentalDate: string;
  returnDeadline: string;
  rentalCompany: string;
  returnAlertEnabled: boolean;
  returnAlertDaysBefore: number;
  photoDataUrl: string;
  photoFileName: string;
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
  scheduleItem: string;
  startDate: string;
  dueDate: string;
  percentComplete: number;
}

export interface ReportActivityEntry {
  id: string;
  reportId: string;
  description: string;
  quantity: number;
  unit: string;
  percentComplete: number;
  status: "started" | "in_progress" | "completed" | "not_started" | "paused" | "not_executed";
  startTime: string;
  endTime: string;
  laborEntryIds: string[];
  equipmentEntryIds: string[];
}

export interface ReportStructuredData {
  laborEntries: ReportLaborEntry[];
  equipmentEntries: ReportEquipmentEntry[];
  occurrenceEntries: ReportOccurrenceEntry[];
  checklistResponses: ReportChecklistResponse[];
  tasks: ReportTask[];
  activityEntries: ReportActivityEntry[];
}

export interface ReportAttachment {
  id: string;
  reportId: string;
  projectId: string;
  fileName: string;
  mimeType: string;
  attachmentType: "photo" | "video" | "document";
  source: "local_upload" | "whatsapp";
  taskId?: string;
  dataUrl: string;
  caption: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
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
  latitude?: string;
  longitude?: string;
  startDate?: string;
  expectedEndDate?: string;
  taskListEnabled?: boolean;
  requirePhotos?: boolean;
}

export interface WeatherSuggestion {
  tempo: Record<"Manhã" | "Tarde" | "Noite", "Claro" | "Nublado" | "Chuvoso" | "">;
  condicoes: Record<"Manhã" | "Tarde" | "Noite", "Praticável" | "Parcialmente Praticável" | "Impraticável" | "">;
  indicePluviometrico: string;
}

export interface UserPayload {
  name: string;
  email: string;
  jobTitle: string;
  accessProfile: AccessProfile;
  status: "active" | "inactive";
  password?: string;
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

export interface AttachmentPayload {
  fileName: string;
  mimeType: string;
  attachmentType: "photo" | "video" | "document";
  source: "local_upload" | "whatsapp";
  taskId?: string;
  dataUrl: string;
  caption: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let csrfToken = "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method?.toUpperCase() ?? "GET";
  const requestCsrfToken = method === "GET" || method === "HEAD" || method === "OPTIONS" ? "" : csrfToken || readCookie("diario_csrf");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(requestCsrfToken ? { "X-CSRF-Token": requestCsrfToken } : {}),
        ...init?.headers
      },
      ...init
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API local.", 0);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? (await response.json()) as T & { error?: string; csrfToken?: string }
    : ({ error: await response.text() } as T & { error?: string; csrfToken?: string });

  if (body.csrfToken) {
    csrfToken = body.csrfToken;
  }

  if (!response.ok) {
    throw new ApiError(body.error ?? "Erro inesperado na API", response.status);
  }

  return body;
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length) ?? "";
}

export const api = {
  async login(payload: { email: string; password: string }) {
    return request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getCurrentUser() {
    return request<{ user: User }>("/api/auth/me");
  },

  async logout() {
    const response = await request<{ ok: true }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({})
    });
    csrfToken = "";
    return response;
  },

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
    return request<{ project: Project; counters: { reports: number; activities: number; occurrences: number; comments: number; photos: number; videos: number }; recentReports: Report[]; recentPhotos: ReportAttachment[] }>(`/api/projects/${id}/overview`);
  },

  async getProjectWeather(id: string, date: string) {
    return request<{ weather: WeatherSuggestion; source: { provider: string; date: string; latitude: number; longitude: number }; warning: string }>(`/api/projects/${id}/weather?date=${encodeURIComponent(date)}`);
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

  async getReportAttachments(id: string) {
    return request<{ attachments: ReportAttachment[] }>(`/api/reports/${id}/attachments`);
  },

  async createReportAttachment(id: string, payload: AttachmentPayload) {
    return request<{ attachment: ReportAttachment }>(`/api/reports/${id}/attachments`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getProjectGroups() {
    return request<{ projectGroups: CatalogItem[] }>("/api/catalogs/project-groups");
  },

  async getChecklists() {
    return request<{ checklists: ChecklistTemplate[] }>("/api/catalogs/checklists");
  },

  async createCatalogItem(kind: "labor" | "equipment" | "occurrences" | "project-groups", payload: CatalogItemPayload) {
    return request<{ item: CatalogItem }>(`/api/catalogs/items/${kind}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateCatalogItem(kind: "labor" | "equipment" | "occurrences" | "project-groups", id: string, payload: CatalogItemPayload) {
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
