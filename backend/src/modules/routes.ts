import { createHash } from "node:crypto";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { checklists, company, equipment, labor, occurrenceTypes, projects, reports, reportTemplates } from "../data/seed.js";
import type { ContractType, ProjectStatus, Report, ReportSections } from "../types.js";

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

const nextReportNumber = () => Math.max(0, ...reports.map((report) => report.number)) + 1;

const findReport = (id: string) => reports.find((report) => report.id === id);

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
  app.get("/health", async () => ({
    ok: true,
    service: "construction-report-backend",
    language: company.defaultLanguage
  }));

  app.get("/api/bootstrap", async () => ({
    company,
    counts: {
      projects: projects.length,
      reports: reports.length,
      reportTemplates: reportTemplates.length,
      labor: labor.length,
      equipment: equipment.length,
      occurrenceTypes: occurrenceTypes.length,
      checklists: checklists.length
    }
  }));

  app.get("/api/projects", async () => ({ projects }));

  app.post("/api/projects", async (request, reply) => {
    const payload = createProjectSchema.parse(request.body);
    const project = {
      id: `project-${projects.length + 1}`,
      companyId: company.id,
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

    projects.push(project);
    return reply.code(201).send({ project });
  });

  app.get("/api/projects/:id/overview", async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = projects.find((item) => item.id === id);

    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const projectReports = reports.filter((report) => report.projectId === id);

    return {
      project,
      counters: {
        reports: projectReports.length,
        activities: 0,
        occurrences: 0,
        comments: 0,
        photos: 0,
        videos: 0
      },
      recentReports: projectReports,
      recentPhotos: []
    };
  });

  app.get("/api/reports", async (request) => {
    const query = request.query as { projectId?: string; status?: string };
    let filteredReports = [...reports];

    if (query.projectId) {
      filteredReports = filteredReports.filter((report) => report.projectId === query.projectId);
    }

    if (query.status) {
      filteredReports = filteredReports.filter((report) => report.status === query.status);
    }

    filteredReports.sort((a, b) => b.reportDate.localeCompare(a.reportDate) || b.number - a.number);

    return { reports: filteredReports };
  });

  app.post("/api/reports", async (request, reply) => {
    const parsedBody = createReportSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid report payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const project = projects.find((item) => item.id === payload.projectId);
    const template = reportTemplates.find((item) => item.id === payload.templateId);

    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    if (!template) {
      return reply.code(404).send({ error: "Report template not found" });
    }

    const lastReport = [...reports]
      .filter((report) => report.projectId === payload.projectId)
      .sort((a, b) => b.reportDate.localeCompare(a.reportDate) || b.number - a.number)[0];

    const number = nextReportNumber();
    const report: Report = {
      id: `report-${number}-${Date.now()}`,
      number,
      projectId: payload.projectId,
      templateId: payload.templateId,
      reportDate: payload.reportDate,
      status: "draft",
      creatorUserId: "user-joao",
      creatorName: "JOAO VICTOR",
      createdAt: nowIso(),
      sections: payload.copyFromLast && lastReport ? { ...lastReport.sections } : emptySections()
    };

    reports.push(report);
    return reply.code(201).send({ report });
  });

  app.get("/api/reports/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = findReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    return { report };
  });

  app.patch("/api/reports/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = findReport(id);

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

    report.sections = {
      ...report.sections,
      ...parsedBody.data.sections
    };

    if (report.status === "pending_review") {
      report.status = "revised";
    }

    return { report };
  });

  app.post("/api/reports/:id/submit-review", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = findReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    if (report.status === "approved") {
      return reply.code(409).send({ error: "Approved reports are immutable" });
    }

    if (!["draft", "rejected", "revised"].includes(report.status)) {
      return reply.code(409).send({ error: `Report cannot be submitted from status ${report.status}` });
    }

    report.status = "pending_review";
    report.submittedAt = nowIso();

    return { report };
  });

  app.post("/api/reports/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = findReport(id);

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

    report.status = "approved";
    report.approverUserId = parsedBody.data.approverUserId;
    report.approverName = parsedBody.data.approverName;
    report.approvedAt = nowIso();
    report.signatureId = `sig-${report.approverUserId}-${report.approvedAt.replace(/\D/g, "").slice(0, 14)}`;
    report.pdfVersionId = `pdf-${report.id}-v1`;
    report.hash = buildReportHash(report);

    return { report };
  });

  app.post("/api/reports/:id/reject", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = findReport(id);

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

    report.status = "rejected";
    report.sections.comments = [report.sections.comments, parsedBody.data.reason].filter(Boolean).join("\n\nRevisao: ");

    return { report };
  });

  app.get("/api/report-templates", async () => ({ reportTemplates }));

  app.get("/api/catalogs/labor", async () => ({ labor }));

  app.get("/api/catalogs/equipment", async () => ({ equipment }));

  app.get("/api/catalogs/occurrence-types", async () => ({ occurrenceTypes }));

  app.get("/api/catalogs/checklists", async () => ({ checklists }));

  app.post("/api/whatsapp/webhook", async (request, reply) => {
    return reply.code(202).send({
      accepted: true,
      nextStep: "Persist inbound message, download media, transcribe audio, and create draft report.",
      receivedBody: request.body
    });
  });
}
