import { createHash } from "node:crypto";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { database } from "../data/database.js";
import type { AuditLog, ContractType, PdfVersion, Project, ProjectStatus, Report, ReportSections } from "../types.js";

const defaultActor = {
  actorUserId: "user-joao",
  actorName: "JOAO VICTOR"
};

const createProjectSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["not_started", "stalled", "in_progress", "completed"]).default("in_progress"),
  group: z.string().min(1).default("Todas as obras"),
  contractType: z.enum(["client", "contractor", "hired"]).default("contractor"),
  responsible: z.string().optional().default(""),
  contractor: z.string().optional().default(""),
  contract: z.string().optional().default(""),
  address: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  expectedEndDate: z.string().optional().default(""),
  taskListEnabled: z.boolean().optional().default(false),
  requirePhotos: z.boolean().optional().default(false)
});

const reportSectionsSchema = z.object({
  weather: z.string().default(""),
  labor: z.string().default(""),
  equipment: z.string().default(""),
  activities: z.string().default(""),
  occurrences: z.string().default(""),
  comments: z.string().default(""),
  checklistNotes: z.string().default("")
});

const createReportSchema = z.object({
  projectId: z.string().min(1),
  templateId: z.string().min(1).optional().default("template-rdo"),
  reportDate: z.string().min(1),
  copyFromLast: z.boolean().optional().default(false)
});

const updateReportSchema = z.object({
  sections: reportSectionsSchema.partial()
});

const approvalSchema = z.object({
  approverUserId: z.string().min(1).optional().default("user-joao"),
  approverName: z.string().min(1).optional().default("JOAO VICTOR")
});

const rejectionSchema = z.object({
  reason: z.string().optional().default("")
});

const emptySections = (): ReportSections => ({
  weather: "",
  labor: "",
  equipment: "",
  activities: "",
  occurrences: "",
  comments: "",
  checklistNotes: ""
});

const nowIso = () => new Date().toISOString();

const buildReportHash = (report: Report) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        id: report.id,
        number: report.number,
        projectId: report.projectId,
        templateId: report.templateId,
        reportDate: report.reportDate,
        status: "approved",
        sections: report.sections,
        creatorUserId: report.creatorUserId,
        submittedAt: report.submittedAt,
        approverUserId: report.approverUserId,
        approvedAt: report.approvedAt,
        signatureId: report.signatureId,
        pdfVersionId: report.pdfVersionId
      })
    )
    .digest("hex");

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const company = database.getCompany();

    return {
      ok: true,
      service: "construction-report-backend",
      language: company.defaultLanguage,
      persistence: "sqlite"
    };
  });

  app.get("/api/bootstrap", async () => ({
    company: database.getCompany(),
    counts: database.getCounts()
  }));

  app.get("/api/users", async () => ({ users: database.listUsers() }));

  app.get("/api/projects", async () => ({ projects: database.listProjects() }));

  app.post("/api/projects", async (request, reply) => {
    const parsedBody = createProjectSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid project payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const project: Project = {
      id: `project-${Date.now()}`,
      companyId: database.getCompany().id,
      name: payload.name,
      status: payload.status as ProjectStatus,
      group: payload.group,
      contractType: payload.contractType as ContractType,
      responsible: payload.responsible,
      contractor: payload.contractor,
      contract: payload.contract,
      address: payload.address,
      startDate: payload.startDate,
      expectedEndDate: payload.expectedEndDate,
      taskListEnabled: payload.taskListEnabled,
      requirePhotos: payload.requirePhotos
    };

    return reply.code(201).send({ project: database.createProject(project, defaultActor) });
  });

  app.get("/api/projects/:id/overview", async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = database.getProject(id);

    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const projectReports = database.listReports({ projectId: id });

    return {
      project,
      counters: {
        reports: projectReports.length,
        activities: projectReports.filter((report) => report.sections.activities.trim()).length,
        occurrences: projectReports.filter((report) => report.sections.occurrences.trim()).length,
        comments: projectReports.filter((report) => report.sections.comments.trim()).length,
        photos: 0,
        videos: 0
      },
      recentReports: projectReports,
      recentPhotos: []
    };
  });

  app.get("/api/reports", async (request) => {
    const query = request.query as { projectId?: string; status?: string };
    return { reports: database.listReports({ projectId: query.projectId, status: query.status }) };
  });

  app.post("/api/reports", async (request, reply) => {
    const parsedBody = createReportSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid report payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const project = database.getProject(payload.projectId);
    const template = database.getReportTemplate(payload.templateId);

    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    if (!template) {
      return reply.code(404).send({ error: "Report template not found" });
    }

    const currentUser = database.getUser(defaultActor.actorUserId);
    const lastReport = database.getLastReport(payload.projectId);
    const number = database.nextReportNumber();
    const report: Report = {
      id: `report-${number}-${Date.now()}`,
      number,
      projectId: payload.projectId,
      templateId: payload.templateId,
      reportDate: payload.reportDate,
      status: "draft",
      creatorUserId: currentUser?.id ?? defaultActor.actorUserId,
      creatorName: currentUser?.name ?? defaultActor.actorName,
      createdAt: nowIso(),
      sections: payload.copyFromLast && lastReport ? { ...lastReport.sections } : emptySections()
    };

    return reply.code(201).send({ report: database.createReport(report, defaultActor) });
  });

  app.get("/api/reports/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    return { report };
  });

  app.patch("/api/reports/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    if (report.status === "approved") {
      return reply.code(409).send({ error: "Approved reports are immutable" });
    }

    const parsedBody = updateReportSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid report update payload", details: parsedBody.error.flatten() });
    }

    const changedFields = Object.keys(parsedBody.data.sections);
    const updatedReport: Report = {
      ...report,
      status: report.status === "pending_review" ? "revised" : report.status,
      sections: {
        ...report.sections,
        ...parsedBody.data.sections
      }
    };

    return { report: database.updateReportSections(updatedReport, defaultActor, changedFields) };
  });

  app.post("/api/reports/:id/submit-review", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    if (report.status === "approved") {
      return reply.code(409).send({ error: "Approved reports are immutable" });
    }

    if (!["draft", "rejected", "revised"].includes(report.status)) {
      return reply.code(409).send({ error: `Report cannot be submitted from status ${report.status}` });
    }

    const updatedReport: Report = {
      ...report,
      status: "pending_review",
      submittedAt: nowIso()
    };

    return { report: database.submitReport(updatedReport, defaultActor) };
  });

  app.post("/api/reports/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    if (report.status === "approved") {
      return reply.code(409).send({ error: "Report is already approved" });
    }

    if (report.status !== "pending_review") {
      return reply.code(409).send({ error: `Report cannot be approved from status ${report.status}` });
    }

    const parsedBody = approvalSchema.safeParse(request.body ?? {});

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid approval payload", details: parsedBody.error.flatten() });
    }

    const approver = database.getUser(parsedBody.data.approverUserId);
    const approvedAt = nowIso();
    const versionNumber = database.nextPdfVersionNumber(report.id);
    const pdfVersionId = `pdf-${report.id}-v${versionNumber}`;
    const approvedReport: Report = {
      ...report,
      status: "approved",
      approverUserId: approver?.id ?? parsedBody.data.approverUserId,
      approverName: approver?.name ?? parsedBody.data.approverName,
      approvedAt,
      signatureId: approver?.signatureId ?? `sig-${parsedBody.data.approverUserId}-${approvedAt.replace(/\D/g, "").slice(0, 14)}`,
      pdfVersionId
    };

    approvedReport.hash = buildReportHash(approvedReport);

    const pdfVersion: PdfVersion = {
      id: pdfVersionId,
      reportId: report.id,
      versionNumber,
      status: "placeholder",
      createdAt: approvedAt,
      metadata: {
        provider: "pending",
        reason: "PDF provider will be attached after persistence and audit base",
        reportHash: approvedReport.hash
      }
    };

    return {
      report: database.approveReport(approvedReport, pdfVersion, {
        actorUserId: approvedReport.approverUserId ?? defaultActor.actorUserId,
        actorName: approvedReport.approverName ?? defaultActor.actorName
      })
    };
  });

  app.post("/api/reports/:id/reject", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    if (report.status !== "pending_review") {
      return reply.code(409).send({ error: `Report cannot be rejected from status ${report.status}` });
    }

    const parsedBody = rejectionSchema.safeParse(request.body ?? {});

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid rejection payload", details: parsedBody.error.flatten() });
    }

    const updatedReport: Report = {
      ...report,
      status: "rejected",
      sections: {
        ...report.sections,
        comments: [report.sections.comments, parsedBody.data.reason].filter(Boolean).join("\n\nRevisao: ")
      }
    };

    return { report: database.rejectReport(updatedReport, defaultActor, parsedBody.data.reason) };
  });

  app.get("/api/reports/:id/audit", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    return { auditLogs: database.listAuditLogs("report", id) };
  });

  app.get("/api/reports/:id/pdf-versions", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    return { pdfVersions: database.listPdfVersions(id) };
  });

  app.get("/api/audit/:entityType/:entityId", async (request, reply) => {
    const { entityType, entityId } = request.params as { entityType: AuditLog["entityType"]; entityId: string };
    const allowedTypes: AuditLog["entityType"][] = ["project", "report", "report_pdf", "user", "signature", "system"];

    if (!allowedTypes.includes(entityType)) {
      return reply.code(400).send({ error: "Invalid audit entity type" });
    }

    return { auditLogs: database.listAuditLogs(entityType, entityId) };
  });

  app.get("/api/report-templates", async () => ({ reportTemplates: database.listReportTemplates() }));

  app.get("/api/catalogs/labor", async () => ({ labor: database.listCatalog("labor") }));

  app.get("/api/catalogs/equipment", async () => ({ equipment: database.listCatalog("equipment") }));

  app.get("/api/catalogs/occurrence-types", async () => ({ occurrenceTypes: database.listCatalog("occurrence_type") }));

  app.get("/api/catalogs/checklists", async () => ({ checklists: database.listChecklists() }));

  app.post("/api/whatsapp/webhook", async (request, reply) => {
    return reply.code(202).send({
      accepted: true,
      nextStep: "Persist inbound message, download media, transcribe audio, and create draft report.",
      receivedBody: request.body
    });
  });
}
