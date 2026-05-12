import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { checklists, company, equipment, labor, occurrenceTypes, projects, reports, reportTemplates } from "../data/seed.js";
import type { ContractType, ProjectStatus } from "../types.js";

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

  app.get("/api/reports", async () => ({ reports }));

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

