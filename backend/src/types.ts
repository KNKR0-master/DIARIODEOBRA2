export type ProjectStatus = "not_started" | "stalled" | "in_progress" | "completed";
export type ContractType = "client" | "contractor" | "hired";
export type ReportStatus = "draft" | "pending_review" | "approved" | "rejected" | "revised" | "amended";
export type AccessProfile = "administrator" | "customized" | "field_user" | "reviewer_approver" | "client_read_only";
export type UserStatus = "active" | "inactive";

export interface Company {
  id: string;
  name: string;
  defaultLanguage: "pt-BR";
  timezone: string;
  requirePhotosByDefault: boolean;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  jobTitle: string;
  accessProfile: AccessProfile;
  status: UserStatus;
  signatureId: string;
  createdAt: string;
}

export interface Signature {
  id: string;
  userId: string;
  type: "virtual" | "drawn" | "image";
  displayName: string;
  createdAt: string;
  metadata: Record<string, unknown>;
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
  scheduleItem: string;
  startDate: string;
  dueDate: string;
  percentComplete: number;
}

export interface ReportStructuredData {
  laborEntries: ReportLaborEntry[];
  equipmentEntries: ReportEquipmentEntry[];
  occurrenceEntries: ReportOccurrenceEntry[];
  checklistResponses: ReportChecklistResponse[];
  tasks: ReportTask[];
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
