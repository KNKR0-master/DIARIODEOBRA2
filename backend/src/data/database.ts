import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { checklists, company, equipment, labor, occurrenceTypes, projects, reports, reportTemplates, signatures, users } from "./seed.js";
import type { AuditLog, CatalogItem, ChecklistItem, ChecklistTemplate, Company, PdfVersion, Project, Report, ReportSections, ReportTemplate, Signature, User } from "../types.js";

type CountRow = { count: number };

type CompanyRow = {
  id: string;
  name: string;
  default_language: "pt-BR";
  timezone: string;
  require_photos_by_default: number;
};

type UserRow = {
  id: string;
  company_id: string;
  name: string;
  email: string;
  job_title: string;
  access_profile: User["accessProfile"];
  status: User["status"];
  signature_id: string;
  created_at: string;
};

type SignatureRow = {
  id: string;
  user_id: string;
  type: Signature["type"];
  display_name: string;
  created_at: string;
  metadata_json: string;
};

type ProjectRow = {
  id: string;
  company_id: string;
  name: string;
  status: Project["status"];
  group_name: string;
  contract_type: Project["contractType"];
  responsible: string;
  contractor: string;
  contract: string;
  address: string;
  start_date: string;
  expected_end_date: string;
  task_list_enabled: number;
  require_photos: number;
};

type ReportTemplateRow = {
  id: string;
  name: string;
  status: ReportTemplate["status"];
  type: ReportTemplate["type"];
  date_type: ReportTemplate["dateType"];
  enabled_items_json: string;
  signature_pdf_display: ReportTemplate["signaturePdfDisplay"];
};

type CatalogItemRow = {
  id: string;
  kind: string;
  description: string;
  group_name: string | null;
  status: CatalogItem["status"];
  source_type: CatalogItem["sourceType"];
};

type ChecklistTemplateRow = {
  id: string;
  name: string;
  status: ChecklistTemplate["status"];
};

type ChecklistItemRow = {
  id: string;
  template_id: string;
  item_order: number;
  item_label: string;
  question: string;
  answer_type: ChecklistItem["answerType"];
  allow_multiple_responses: number;
  answers_json: string;
};

type ReportRow = {
  id: string;
  report_number: number;
  project_id: string;
  template_id: string;
  report_date: string;
  status: Report["status"];
  creator_user_id: string;
  creator_name: string;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  approver_user_id: string | null;
  approver_name: string | null;
  signature_id: string | null;
  pdf_version_id: string | null;
  hash: string | null;
};

type ReportSectionRow = {
  report_id: string;
  weather: string;
  labor: string;
  equipment: string;
  activities: string;
  occurrences: string;
  comments: string;
  checklist_notes: string;
};

type AuditLogRow = {
  id: string;
  entity_type: AuditLog["entityType"];
  entity_id: string;
  event_type: string;
  actor_user_id: string;
  actor_name: string;
  occurred_at: string;
  metadata_json: string;
};

type PdfVersionRow = {
  id: string;
  report_id: string;
  version_number: number;
  status: PdfVersion["status"];
  file_path: string | null;
  created_at: string;
  metadata_json: string;
};

const sourceDir = dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = resolve(sourceDir, "../../.data/app.sqlite");

const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  return JSON.parse(value) as T;
};

const toBool = (value: boolean) => (value ? 1 : 0);

const fromBool = (value: number) => Boolean(value);

const getDatabasePath = () => process.env.DATABASE_PATH ?? defaultDatabasePath;

const emptySections = (): ReportSections => ({
  weather: "",
  labor: "",
  equipment: "",
  activities: "",
  occurrences: "",
  comments: "",
  checklistNotes: ""
});

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    defaultLanguage: row.default_language,
    timezone: row.timezone,
    requirePhotosByDefault: fromBool(row.require_photos_by_default)
  };
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    email: row.email,
    jobTitle: row.job_title,
    accessProfile: row.access_profile,
    status: row.status,
    signatureId: row.signature_id,
    createdAt: row.created_at
  };
}

function toSignature(row: SignatureRow): Signature {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    displayName: row.display_name,
    createdAt: row.created_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {})
  };
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    status: row.status,
    group: row.group_name,
    contractType: row.contract_type,
    responsible: row.responsible,
    contractor: row.contractor,
    contract: row.contract,
    address: row.address,
    startDate: row.start_date,
    expectedEndDate: row.expected_end_date,
    taskListEnabled: fromBool(row.task_list_enabled),
    requirePhotos: fromBool(row.require_photos)
  };
}

function toReportTemplate(row: ReportTemplateRow): ReportTemplate {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    type: row.type,
    dateType: row.date_type,
    enabledItems: parseJson<string[]>(row.enabled_items_json, []),
    signaturePdfDisplay: row.signature_pdf_display
  };
}

function toCatalogItem(row: CatalogItemRow): CatalogItem {
  return {
    id: row.id,
    description: row.description,
    group: row.group_name ?? undefined,
    status: row.status,
    sourceType: row.source_type
  };
}

function toChecklistTemplate(row: ChecklistTemplateRow, items: ChecklistItem[]): ChecklistTemplate {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    items
  };
}

function toChecklistItem(row: ChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    order: row.item_order,
    itemLabel: row.item_label,
    question: row.question,
    answerType: row.answer_type,
    allowMultipleResponses: fromBool(row.allow_multiple_responses),
    answers: parseJson<string[]>(row.answers_json, [])
  };
}

function toReport(row: ReportRow, sectionRow?: ReportSectionRow): Report {
  const sections = sectionRow
    ? {
        weather: sectionRow.weather,
        labor: sectionRow.labor,
        equipment: sectionRow.equipment,
        activities: sectionRow.activities,
        occurrences: sectionRow.occurrences,
        comments: sectionRow.comments,
        checklistNotes: sectionRow.checklist_notes
      }
    : emptySections();

  return {
    id: row.id,
    number: row.report_number,
    projectId: row.project_id,
    templateId: row.template_id,
    reportDate: row.report_date,
    status: row.status,
    creatorUserId: row.creator_user_id,
    creatorName: row.creator_name,
    createdAt: row.created_at,
    submittedAt: row.submitted_at ?? undefined,
    sections,
    approvedAt: row.approved_at ?? undefined,
    approverUserId: row.approver_user_id ?? undefined,
    approverName: row.approver_name ?? undefined,
    signatureId: row.signature_id ?? undefined,
    pdfVersionId: row.pdf_version_id ?? undefined,
    hash: row.hash ?? undefined
  };
}

function toAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    eventType: row.event_type,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    occurredAt: row.occurred_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {})
  };
}

function toPdfVersion(row: PdfVersionRow): PdfVersion {
  return {
    id: row.id,
    reportId: row.report_id,
    versionNumber: row.version_number,
    status: row.status,
    filePath: row.file_path ?? undefined,
    createdAt: row.created_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {})
  };
}

class AppDatabase {
  private readonly db: DatabaseSync;

  constructor(path = getDatabasePath()) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.migrate();
    this.seed();
  }

  getCompany() {
    const row = this.db.prepare("SELECT * FROM companies LIMIT 1").get() as CompanyRow | undefined;
    if (!row) {
      throw new Error("Company seed not found");
    }

    return toCompany(row);
  }

  getCounts() {
    return {
      projects: this.count("projects"),
      reports: this.count("reports"),
      reportTemplates: this.count("report_templates"),
      labor: this.countCatalog("labor"),
      equipment: this.countCatalog("equipment"),
      occurrenceTypes: this.countCatalog("occurrence_type"),
      checklists: this.count("checklist_templates"),
      users: this.count("users"),
      auditLogs: this.count("audit_logs")
    };
  }

  listUsers() {
    return (this.db.prepare("SELECT * FROM users ORDER BY name").all() as UserRow[]).map(toUser);
  }

  getUser(id: string) {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
    return row ? toUser(row) : undefined;
  }

  listProjects() {
    return (this.db.prepare("SELECT * FROM projects ORDER BY name").all() as ProjectRow[]).map(toProject);
  }

  getProject(id: string) {
    const row = this.db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as ProjectRow | undefined;
    return row ? toProject(row) : undefined;
  }

  createProject(project: Project, actor: AuditActor) {
    this.db
      .prepare(
        `INSERT INTO projects (
          id, company_id, name, status, group_name, contract_type, responsible, contractor, contract,
          address, start_date, expected_end_date, task_list_enabled, require_photos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(project.id, project.companyId, project.name, project.status, project.group, project.contractType, project.responsible, project.contractor, project.contract, project.address, project.startDate, project.expectedEndDate, toBool(project.taskListEnabled), toBool(project.requirePhotos));

    this.writeAudit({
      entityType: "project",
      entityId: project.id,
      eventType: "project.created",
      actor,
      metadata: { name: project.name, status: project.status }
    });

    return project;
  }

  listReportTemplates() {
    return (this.db.prepare("SELECT * FROM report_templates ORDER BY name").all() as ReportTemplateRow[]).map(toReportTemplate);
  }

  getReportTemplate(id: string) {
    const row = this.db.prepare("SELECT * FROM report_templates WHERE id = ?").get(id) as ReportTemplateRow | undefined;
    return row ? toReportTemplate(row) : undefined;
  }

  listCatalog(kind: "labor" | "equipment" | "occurrence_type") {
    return (this.db.prepare("SELECT * FROM catalog_items WHERE kind = ? ORDER BY description").all(kind) as CatalogItemRow[]).map(toCatalogItem);
  }

  listChecklists() {
    const rows = this.db.prepare("SELECT * FROM checklist_templates ORDER BY name").all() as ChecklistTemplateRow[];

    return rows.map((row) => {
      const items = (this.db.prepare("SELECT * FROM checklist_items WHERE template_id = ? ORDER BY item_order").all(row.id) as ChecklistItemRow[]).map(toChecklistItem);
      return toChecklistTemplate(row, items);
    });
  }

  listReports(filters: { projectId?: string; status?: string } = {}) {
    const clauses: string[] = [];
    const values: string[] = [];

    if (filters.projectId) {
      clauses.push("project_id = ?");
      values.push(filters.projectId);
    }

    if (filters.status) {
      clauses.push("status = ?");
      values.push(filters.status);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = this.db.prepare(`SELECT * FROM reports ${where} ORDER BY report_date DESC, report_number DESC`).all(...values) as ReportRow[];

    return rows.map((row) => this.hydrateReport(row));
  }

  getReport(id: string) {
    const row = this.db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as ReportRow | undefined;
    return row ? this.hydrateReport(row) : undefined;
  }

  getLastReport(projectId: string) {
    const row = this.db.prepare("SELECT * FROM reports WHERE project_id = ? ORDER BY report_date DESC, report_number DESC LIMIT 1").get(projectId) as ReportRow | undefined;
    return row ? this.hydrateReport(row) : undefined;
  }

  nextReportNumber() {
    const row = this.db.prepare("SELECT COALESCE(MAX(report_number), 0) + 1 AS count FROM reports").get() as CountRow;
    return row.count;
  }

  createReport(report: Report, actor: AuditActor) {
    this.withTransaction(() => {
      this.insertReport(report);
      this.upsertReportSections(report.id, report.sections);
      this.writeAudit({
        entityType: "report",
        entityId: report.id,
        eventType: "report.created",
        actor,
        metadata: {
          projectId: report.projectId,
          templateId: report.templateId,
          reportDate: report.reportDate,
          status: report.status
        }
      });
    });

    return this.getReport(report.id) as Report;
  }

  updateReportSections(report: Report, actor: AuditActor, changedFields: string[]) {
    this.withTransaction(() => {
      this.db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(report.status, report.id);
      this.upsertReportSections(report.id, report.sections);
      this.writeAudit({
        entityType: "report",
        entityId: report.id,
        eventType: "report.edited",
        actor,
        metadata: {
          status: report.status,
          changedFields
        }
      });
    });

    return this.getReport(report.id) as Report;
  }

  submitReport(report: Report, actor: AuditActor) {
    this.withTransaction(() => {
      this.updateReportMetadata(report);
      this.writeAudit({
        entityType: "report",
        entityId: report.id,
        eventType: "report.submitted_for_review",
        actor,
        metadata: {
          status: report.status,
          submittedAt: report.submittedAt
        }
      });
    });

    return this.getReport(report.id) as Report;
  }

  approveReport(report: Report, pdfVersion: PdfVersion, actor: AuditActor) {
    this.withTransaction(() => {
      this.updateReportMetadata(report);
      this.insertPdfVersion(pdfVersion);
      this.writeAudit({
        entityType: "report",
        entityId: report.id,
        eventType: "report.approved",
        actor,
        metadata: {
          approvedAt: report.approvedAt,
          signatureId: report.signatureId,
          pdfVersionId: report.pdfVersionId,
          hash: report.hash
        }
      });
      this.writeAudit({
        entityType: "report_pdf",
        entityId: pdfVersion.id,
        eventType: "pdf.placeholder_created",
        actor,
        metadata: {
          reportId: report.id,
          versionNumber: pdfVersion.versionNumber,
          status: pdfVersion.status
        }
      });
    });

    return this.getReport(report.id) as Report;
  }

  rejectReport(report: Report, actor: AuditActor, reason: string) {
    this.withTransaction(() => {
      this.updateReportMetadata(report);
      this.upsertReportSections(report.id, report.sections);
      this.writeAudit({
        entityType: "report",
        entityId: report.id,
        eventType: "report.rejected",
        actor,
        metadata: { reason }
      });
    });

    return this.getReport(report.id) as Report;
  }

  nextPdfVersionNumber(reportId: string) {
    const row = this.db.prepare("SELECT COALESCE(MAX(version_number), 0) + 1 AS count FROM pdf_versions WHERE report_id = ?").get(reportId) as CountRow;
    return row.count;
  }

  listAuditLogs(entityType: AuditLog["entityType"], entityId: string) {
    return (this.db.prepare("SELECT * FROM audit_logs WHERE entity_type = ? AND entity_id = ? ORDER BY occurred_at ASC").all(entityType, entityId) as AuditLogRow[]).map(toAuditLog);
  }

  listPdfVersions(reportId: string) {
    return (this.db.prepare("SELECT * FROM pdf_versions WHERE report_id = ? ORDER BY version_number ASC").all(reportId) as PdfVersionRow[]).map(toPdfVersion);
  }

  private count(tableName: string) {
    const row = this.db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get() as CountRow;
    return row.count;
  }

  private countCatalog(kind: string) {
    const row = this.db.prepare("SELECT COUNT(*) AS count FROM catalog_items WHERE kind = ?").get(kind) as CountRow;
    return row.count;
  }

  private hydrateReport(row: ReportRow) {
    const sectionRow = this.db.prepare("SELECT * FROM report_sections WHERE report_id = ?").get(row.id) as ReportSectionRow | undefined;
    return toReport(row, sectionRow);
  }

  private insertReport(report: Report) {
    this.db
      .prepare(
        `INSERT INTO reports (
          id, report_number, project_id, template_id, report_date, status, creator_user_id, creator_name,
          created_at, submitted_at, approved_at, approver_user_id, approver_name, signature_id, pdf_version_id, hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(report.id, report.number, report.projectId, report.templateId, report.reportDate, report.status, report.creatorUserId, report.creatorName, report.createdAt, report.submittedAt ?? null, report.approvedAt ?? null, report.approverUserId ?? null, report.approverName ?? null, report.signatureId ?? null, report.pdfVersionId ?? null, report.hash ?? null);
  }

  private updateReportMetadata(report: Report) {
    this.db
      .prepare(
        `UPDATE reports
         SET status = ?, submitted_at = ?, approved_at = ?, approver_user_id = ?, approver_name = ?,
             signature_id = ?, pdf_version_id = ?, hash = ?
         WHERE id = ?`
      )
      .run(report.status, report.submittedAt ?? null, report.approvedAt ?? null, report.approverUserId ?? null, report.approverName ?? null, report.signatureId ?? null, report.pdfVersionId ?? null, report.hash ?? null, report.id);
  }

  private upsertReportSections(reportId: string, sections: ReportSections) {
    this.db
      .prepare(
        `INSERT INTO report_sections (
          report_id, weather, labor, equipment, activities, occurrences, comments, checklist_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(report_id) DO UPDATE SET
          weather = excluded.weather,
          labor = excluded.labor,
          equipment = excluded.equipment,
          activities = excluded.activities,
          occurrences = excluded.occurrences,
          comments = excluded.comments,
          checklist_notes = excluded.checklist_notes`
      )
      .run(reportId, sections.weather, sections.labor, sections.equipment, sections.activities, sections.occurrences, sections.comments, sections.checklistNotes);
  }

  private insertPdfVersion(pdfVersion: PdfVersion) {
    this.db
      .prepare(
        `INSERT INTO pdf_versions (
          id, report_id, version_number, status, file_path, created_at, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(pdfVersion.id, pdfVersion.reportId, pdfVersion.versionNumber, pdfVersion.status, pdfVersion.filePath ?? null, pdfVersion.createdAt, JSON.stringify(pdfVersion.metadata));
  }

  private writeAudit(input: { entityType: AuditLog["entityType"]; entityId: string; eventType: string; actor: AuditActor; metadata: Record<string, unknown> }) {
    this.db
      .prepare(
        `INSERT INTO audit_logs (
          id, entity_type, entity_id, event_type, actor_user_id, actor_name, occurred_at, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(`audit-${Date.now()}-${randomUUID().slice(0, 8)}`, input.entityType, input.entityId, input.eventType, input.actor.actorUserId, input.actor.actorName, new Date().toISOString(), JSON.stringify(input.metadata));
  }

  private withTransaction<T>(callback: () => T) {
    this.db.exec("BEGIN IMMEDIATE;");
    try {
      const result = callback();
      this.db.exec("COMMIT;");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK;");
      throw error;
    }
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        default_language TEXT NOT NULL,
        timezone TEXT NOT NULL,
        require_photos_by_default INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS signatures (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        display_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        job_title TEXT NOT NULL,
        access_profile TEXT NOT NULL,
        status TEXT NOT NULL,
        signature_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        group_name TEXT NOT NULL,
        contract_type TEXT NOT NULL,
        responsible TEXT NOT NULL DEFAULT '',
        contractor TEXT NOT NULL DEFAULT '',
        contract TEXT NOT NULL DEFAULT '',
        address TEXT NOT NULL DEFAULT '',
        start_date TEXT NOT NULL DEFAULT '',
        expected_end_date TEXT NOT NULL DEFAULT '',
        task_list_enabled INTEGER NOT NULL DEFAULT 0,
        require_photos INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS report_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        date_type TEXT NOT NULL,
        enabled_items_json TEXT NOT NULL,
        signature_pdf_display TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS catalog_items (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        description TEXT NOT NULL,
        group_name TEXT,
        status TEXT NOT NULL,
        source_type TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_catalog_items_kind ON catalog_items(kind);

      CREATE TABLE IF NOT EXISTS checklist_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL REFERENCES checklist_templates(id),
        item_order INTEGER NOT NULL,
        item_label TEXT NOT NULL,
        question TEXT NOT NULL,
        answer_type TEXT NOT NULL,
        allow_multiple_responses INTEGER NOT NULL DEFAULT 0,
        answers_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        report_number INTEGER NOT NULL UNIQUE,
        project_id TEXT NOT NULL REFERENCES projects(id),
        template_id TEXT NOT NULL REFERENCES report_templates(id),
        report_date TEXT NOT NULL,
        status TEXT NOT NULL,
        creator_user_id TEXT NOT NULL REFERENCES users(id),
        creator_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        submitted_at TEXT,
        approved_at TEXT,
        approver_user_id TEXT,
        approver_name TEXT,
        signature_id TEXT,
        pdf_version_id TEXT,
        hash TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

      CREATE TABLE IF NOT EXISTS report_sections (
        report_id TEXT PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
        weather TEXT NOT NULL DEFAULT '',
        labor TEXT NOT NULL DEFAULT '',
        equipment TEXT NOT NULL DEFAULT '',
        activities TEXT NOT NULL DEFAULT '',
        occurrences TEXT NOT NULL DEFAULT '',
        comments TEXT NOT NULL DEFAULT '',
        checklist_notes TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS pdf_versions (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL REFERENCES reports(id),
        version_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        file_path TEXT,
        created_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        UNIQUE(report_id, version_number)
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        actor_user_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, occurred_at);
    `);
  }

  private seed() {
    this.db
      .prepare("INSERT OR IGNORE INTO companies (id, name, default_language, timezone, require_photos_by_default) VALUES (?, ?, ?, ?, ?)")
      .run(company.id, company.name, company.defaultLanguage, company.timezone, toBool(company.requirePhotosByDefault));

    for (const signature of signatures) {
      this.db
        .prepare("INSERT OR IGNORE INTO signatures (id, user_id, type, display_name, created_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?)")
        .run(signature.id, signature.userId, signature.type, signature.displayName, signature.createdAt, JSON.stringify(signature.metadata));
    }

    for (const user of users) {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO users (
            id, company_id, name, email, job_title, access_profile, status, signature_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(user.id, user.companyId, user.name, user.email, user.jobTitle, user.accessProfile, user.status, user.signatureId, user.createdAt);
    }

    for (const project of projects) {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO projects (
            id, company_id, name, status, group_name, contract_type, responsible, contractor, contract,
            address, start_date, expected_end_date, task_list_enabled, require_photos
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(project.id, project.companyId, project.name, project.status, project.group, project.contractType, project.responsible, project.contractor, project.contract, project.address, project.startDate, project.expectedEndDate, toBool(project.taskListEnabled), toBool(project.requirePhotos));
    }

    for (const template of reportTemplates) {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO report_templates (
            id, name, status, type, date_type, enabled_items_json, signature_pdf_display
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(template.id, template.name, template.status, template.type, template.dateType, JSON.stringify(template.enabledItems), template.signaturePdfDisplay);
    }

    this.seedCatalog("labor", labor);
    this.seedCatalog("equipment", equipment);
    this.seedCatalog("occurrence_type", occurrenceTypes);

    for (const checklist of checklists) {
      this.db.prepare("INSERT OR IGNORE INTO checklist_templates (id, name, status) VALUES (?, ?, ?)").run(checklist.id, checklist.name, checklist.status);

      for (const item of checklist.items) {
        this.db
          .prepare(
            `INSERT OR IGNORE INTO checklist_items (
              id, template_id, item_order, item_label, question, answer_type, allow_multiple_responses, answers_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(item.id, checklist.id, item.order, item.itemLabel, item.question, item.answerType, toBool(item.allowMultipleResponses), JSON.stringify(item.answers));
      }
    }

    for (const report of reports) {
      this.insertSeedReport(report);
    }
  }

  private seedCatalog(kind: string, items: CatalogItem[]) {
    for (const item of items) {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO catalog_items (
            id, kind, description, group_name, status, source_type
          ) VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(item.id, kind, item.description, item.group ?? null, item.status, item.sourceType);
    }
  }

  private insertSeedReport(report: Report) {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO reports (
          id, report_number, project_id, template_id, report_date, status, creator_user_id, creator_name,
          created_at, submitted_at, approved_at, approver_user_id, approver_name, signature_id, pdf_version_id, hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(report.id, report.number, report.projectId, report.templateId, report.reportDate, report.status, report.creatorUserId, report.creatorName, report.createdAt, report.submittedAt ?? null, report.approvedAt ?? null, report.approverUserId ?? null, report.approverName ?? null, report.signatureId ?? null, report.pdfVersionId ?? null, report.hash ?? null);

    this.upsertReportSections(report.id, report.sections);

    this.db
      .prepare(
        `INSERT OR IGNORE INTO audit_logs (
          id, entity_type, entity_id, event_type, actor_user_id, actor_name, occurred_at, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(`audit-seed-${report.id}`, "report", report.id, "report.seeded", report.creatorUserId, report.creatorName, report.createdAt, JSON.stringify({ source: "seed" }));
  }
}

export interface AuditActor {
  actorUserId: string;
  actorName: string;
}

export const database = new AppDatabase();
