import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { database } from "../data/database.js";
import { authenticateRequest, clearFailedLogins, clearSessionCookie, createCsrfToken, createSessionForUser, getAuthActor, getFailedLoginState, hashPassword, hashSessionToken, recordFailedLogin, requireProfiles, requireWriteAccess, setCsrfCookie, setSessionCookie, validatePasswordPolicy, verifyCsrfToken, verifyPassword } from "./auth.js";
import type { AuditLog, CatalogItem, ChecklistTemplate, ContractType, PdfVersion, Project, ProjectStatus, Report, ReportActivityEntry, ReportAttachment, ReportChecklistResponse, ReportEquipmentEntry, ReportLaborEntry, ReportOccurrenceEntry, ReportSections, ReportStructuredData, ReportTask, ReportTemplate, User } from "../types.js";

type StructuredDataInput = {
  laborEntries?: Array<Omit<ReportLaborEntry, "id" | "reportId"> & { id?: string }>;
  equipmentEntries?: Array<Omit<ReportEquipmentEntry, "id" | "reportId"> & { id?: string }>;
  occurrenceEntries?: Array<Omit<ReportOccurrenceEntry, "id" | "reportId"> & { id?: string }>;
  checklistResponses?: Array<Omit<ReportChecklistResponse, "id" | "reportId"> & { id?: string }>;
  tasks?: Array<Omit<ReportTask, "id" | "reportId"> & { id?: string }>;
  activityEntries?: Array<Omit<ReportActivityEntry, "id" | "reportId"> & { id?: string }>;
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
  latitude: z.string().optional().default(""),
  longitude: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  expectedEndDate: z.string().optional().default(""),
  taskListEnabled: z.boolean().optional().default(false),
  requirePhotos: z.boolean().optional().default(false)
});

const updateProjectSchema = createProjectSchema;

const projectWeatherQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  jobTitle: z.string().optional().default(""),
  accessProfile: z.enum(["administrator", "customized", "field_user", "reviewer_approver", "client_read_only"]).default("field_user"),
  status: z.enum(["active", "inactive"]).default("active"),
  password: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const reportTemplateSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  type: z.enum(["standard", "customized"]).default("customized"),
  dateType: z.enum(["daily", "period"]).default("daily"),
  enabledItems: z.array(z.string()).min(1),
  signaturePdfDisplay: z.enum(["last_page", "all_pages"]).default("last_page")
});

const catalogItemSchema = z.object({
  description: z.string().min(1),
  group: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  sourceType: z.enum(["standard", "customized"]).default("customized")
});

const checklistItemSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().positive(),
  itemLabel: z.string().min(1),
  question: z.string().min(1),
  answerType: z.enum(["checkbox", "text", "number", "date", "photo", "single_choice", "multiple_choice"]).default("checkbox"),
  allowMultipleResponses: z.boolean().default(false),
  answers: z.array(z.string()).default([])
});

const checklistSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  items: z.array(checklistItemSchema).min(1)
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

const maxAttachmentDataUrlLength = 12 * 1024 * 1024;

const createReportSchema = z.object({
  projectId: z.string().min(1),
  templateId: z.string().min(1).optional().default("template-rdo"),
  reportDate: z.string().min(1),
  copyFromLast: z.boolean().optional().default(false)
});

const updateReportSchema = z.object({
  sections: reportSectionsSchema.partial(),
  structuredData: z
    .object({
      laborEntries: z.array(
        z.object({
          id: z.string().optional(),
          catalogItemId: z.string().optional(),
          description: z.string().min(1),
          quantity: z.number().nonnegative(),
          unit: z.string().min(1).default("profissionais"),
          sourceType: z.enum(["own", "outsourced"]).optional().default("own"),
          serviceProvider: z.string().optional().default(""),
          notes: z.string().optional().default("")
        })
      ),
      equipmentEntries: z.array(
        z.object({
          id: z.string().optional(),
          catalogItemId: z.string().optional(),
          description: z.string().min(1),
          quantity: z.number().nonnegative(),
          hours: z.number().nonnegative().default(0),
          originType: z.enum(["own", "rented", "other"]).optional().default("own"),
          originDetail: z.string().optional().default(""),
          rentalDate: z.string().optional().default(""),
          returnDeadline: z.string().optional().default(""),
          rentalCompany: z.string().optional().default(""),
          returnAlertEnabled: z.boolean().optional().default(false),
          returnAlertDaysBefore: z.number().nonnegative().optional().default(3),
          photoDataUrl: z.string().max(maxAttachmentDataUrlLength).optional().default(""),
          photoFileName: z.string().optional().default(""),
          notes: z.string().optional().default("")
        })
      ),
      occurrenceEntries: z.array(
        z.object({
          id: z.string().optional(),
          catalogItemId: z.string().optional(),
          description: z.string().min(1),
          severity: z.enum(["info", "attention", "critical"]).default("info"),
          notes: z.string().optional().default("")
        })
      ),
      checklistResponses: z.array(
        z.object({
          id: z.string().optional(),
          checklistId: z.string().optional(),
          checklistItemId: z.string().optional(),
          itemLabel: z.string().min(1),
          question: z.string().min(1),
          answer: z.string().min(1),
          compliant: z.boolean().optional(),
          notes: z.string().optional().default("")
        })
      ),
      tasks: z.array(
        z.object({
          id: z.string().optional(),
          description: z.string().min(1),
          status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
          owner: z.string().optional().default(""),
          scheduleItem: z.string().optional().default(""),
          startDate: z.string().optional().default(""),
          dueDate: z.string().optional().default(""),
          percentComplete: z.number().min(0).max(100).optional().default(0)
        })
      ),
      activityEntries: z.array(
        z.object({
          id: z.string().optional(),
          description: z.string().min(1),
          quantity: z.number().nonnegative().optional().default(0),
          unit: z.string().optional().default(""),
          percentComplete: z.number().min(0).max(100).optional().default(0),
          status: z.enum(["started", "in_progress", "completed", "not_started", "paused", "not_executed"]).default("in_progress"),
          startTime: z.string().optional().default(""),
          endTime: z.string().optional().default(""),
          laborEntryIds: z.array(z.string()).optional().default([]),
          equipmentEntryIds: z.array(z.string()).optional().default([])
        })
      )
    })
    .optional()
});

const attachmentSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  attachmentType: z.enum(["photo", "video", "document"]).default("photo"),
  source: z.enum(["local_upload", "whatsapp"]).default("local_upload"),
  taskId: z.string().optional(),
  dataUrl: z.string().min(1).max(maxAttachmentDataUrlLength),
  caption: z.string().optional().default("")
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

const emptyStructuredData = (): ReportStructuredData => ({
  laborEntries: [],
  equipmentEntries: [],
  occurrenceEntries: [],
  checklistResponses: [],
  tasks: [],
  activityEntries: []
});

const catalogKinds = {
  labor: "labor",
  equipment: "equipment",
  occurrences: "occurrence_type",
  "project-groups": "project_group"
} as const;

const getCatalogKind = (kind: string) => catalogKinds[kind as keyof typeof catalogKinds];

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
        structuredData: report.structuredData,
        creatorUserId: report.creatorUserId,
        submittedAt: report.submittedAt,
        approverUserId: report.approverUserId,
        approvedAt: report.approvedAt,
        signatureId: report.signatureId,
        pdfVersionId: report.pdfVersionId
      })
    )
    .digest("hex");

type WeatherPeriod = "Manhã" | "Tarde" | "Noite";
type WeatherOption = "Claro" | "Nublado" | "Chuvoso";
type WorkConditionOption = "Praticável" | "Parcialmente Praticável" | "Impraticável";

type WeatherSuggestion = {
  tempo: Record<WeatherPeriod, WeatherOption | "">;
  condicoes: Record<WeatherPeriod, WorkConditionOption | "">;
  indicePluviometrico: string;
};

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    weather_code?: number[];
    cloud_cover?: number[];
    precipitation?: number[];
  };
  daily?: {
    precipitation_sum?: number[];
  };
  reason?: string;
  error?: boolean;
};

const weatherPeriods: Array<{ key: WeatherPeriod; hours: number[] }> = [
  { key: "Manhã", hours: [6, 7, 8, 9, 10, 11] },
  { key: "Tarde", hours: [12, 13, 14, 15, 16, 17] },
  { key: "Noite", hours: [18, 19, 20, 21, 22, 23] }
];

const emptyWeatherSuggestion = (): WeatherSuggestion => ({
  tempo: { Manhã: "", Tarde: "", Noite: "" },
  condicoes: { Manhã: "", Tarde: "", Noite: "" },
  indicePluviometrico: ""
});

const rainyWeatherCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);
const cloudyWeatherCodes = new Set([2, 3, 45, 48]);
const severeWeatherCodes = new Set([65, 67, 75, 82, 86, 95, 96, 99]);

const asFiniteNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const asCoordinateNumber = (value: unknown) => {
  if (typeof value === "string" && !value.trim()) return undefined;
  return asFiniteNumber(value);
};

const isValidLatitude = (value: number) => value >= -90 && value <= 90;
const isValidLongitude = (value: number) => value >= -180 && value <= 180;

const hourFromOpenMeteoTime = (value: string) => {
  const hourText = value.split("T")[1]?.slice(0, 2) ?? "";
  const hour = Number(hourText);
  return Number.isFinite(hour) ? hour : undefined;
};

function buildWeatherSuggestion(data: OpenMeteoResponse): WeatherSuggestion {
  const suggestion = emptyWeatherSuggestion();
  const hourly = data.hourly;
  const times = hourly?.time ?? [];
  const codes = hourly?.weather_code ?? [];
  const clouds = hourly?.cloud_cover ?? [];
  const precipitation = hourly?.precipitation ?? [];

  const dailyPrecipitation = asFiniteNumber(data.daily?.precipitation_sum?.[0]);
  const hourlyPrecipitationTotal = precipitation.reduce((total, value) => total + (asFiniteNumber(value) ?? 0), 0);
  const precipitationTotal = dailyPrecipitation ?? hourlyPrecipitationTotal;
  suggestion.indicePluviometrico = Number.isFinite(precipitationTotal) ? `${Number(precipitationTotal.toFixed(1))}` : "";

  for (const period of weatherPeriods) {
    const indexes = times
      .map((time, index) => ({ hour: hourFromOpenMeteoTime(time), index }))
      .filter(({ hour }) => hour !== undefined && period.hours.includes(hour));

    if (!indexes.length) continue;

    const periodCodes = indexes.map(({ index }) => asFiniteNumber(codes[index]) ?? 0);
    const periodClouds = indexes.map(({ index }) => asFiniteNumber(clouds[index])).filter((value): value is number => value !== undefined);
    const periodRain = indexes.reduce((total, { index }) => total + (asFiniteNumber(precipitation[index]) ?? 0), 0);
    const averageCloudCover = periodClouds.length ? periodClouds.reduce((total, value) => total + value, 0) / periodClouds.length : 0;
    const hasRain = periodRain >= 0.2 || periodCodes.some((code) => rainyWeatherCodes.has(code));
    const hasClouds = averageCloudCover >= 55 || periodCodes.some((code) => cloudyWeatherCodes.has(code));
    const hasSevereWeather = periodRain >= 15 || periodCodes.some((code) => severeWeatherCodes.has(code));

    suggestion.tempo[period.key] = hasRain ? "Chuvoso" : hasClouds ? "Nublado" : "Claro";
    suggestion.condicoes[period.key] = hasSevereWeather ? "Impraticável" : hasRain || periodRain >= 2 ? "Parcialmente Praticável" : "Praticável";
  }

  return suggestion;
}

const normalizeStructuredData = (reportId: string, structuredData?: StructuredDataInput): ReportStructuredData => ({
  laborEntries: (structuredData?.laborEntries ?? []).map((entry): ReportLaborEntry => ({
    id: entry.id || `report-labor-${randomUUID()}`,
    reportId,
    catalogItemId: entry.catalogItemId,
    description: entry.description,
    quantity: Number(entry.quantity) || 0,
    unit: entry.unit || "profissionais",
    sourceType: entry.sourceType ?? "own",
    serviceProvider: entry.sourceType === "outsourced" ? entry.serviceProvider ?? "" : "",
    notes: entry.notes ?? ""
  })),
  equipmentEntries: (structuredData?.equipmentEntries ?? []).map((entry): ReportEquipmentEntry => ({
    id: entry.id || `report-equipment-${randomUUID()}`,
    reportId,
    catalogItemId: entry.catalogItemId,
    description: entry.description,
    quantity: Number(entry.quantity) || 0,
    hours: Number(entry.hours) || 0,
    originType: entry.originType ?? "own",
    originDetail: entry.originType === "other" ? entry.originDetail ?? "" : "",
    rentalDate: entry.rentalDate ?? "",
    returnDeadline: entry.returnDeadline ?? "",
    rentalCompany: entry.rentalCompany ?? "",
    returnAlertEnabled: Boolean(entry.returnAlertEnabled),
    returnAlertDaysBefore: Number(entry.returnAlertDaysBefore) || 0,
    photoDataUrl: entry.photoDataUrl ?? "",
    photoFileName: entry.photoFileName ?? "",
    notes: entry.notes ?? ""
  })),
  occurrenceEntries: (structuredData?.occurrenceEntries ?? []).map((entry): ReportOccurrenceEntry => ({
    id: entry.id || `report-occurrence-${randomUUID()}`,
    reportId,
    catalogItemId: entry.catalogItemId,
    description: entry.description,
    severity: entry.severity ?? "info",
    notes: entry.notes ?? ""
  })),
  checklistResponses: (structuredData?.checklistResponses ?? []).map((entry): ReportChecklistResponse => ({
    id: entry.id || `report-checklist-${randomUUID()}`,
    reportId,
    checklistId: entry.checklistId,
    checklistItemId: entry.checklistItemId,
    itemLabel: entry.itemLabel,
    question: entry.question,
    answer: entry.answer,
    compliant: entry.compliant,
    notes: entry.notes ?? ""
  })),
  tasks: (structuredData?.tasks ?? []).map((task): ReportTask => ({
    id: task.id || `report-task-${randomUUID()}`,
    reportId,
    description: task.description,
    status: task.status ?? "pending",
    owner: task.owner ?? "",
    scheduleItem: task.scheduleItem ?? "",
    startDate: task.startDate ?? "",
    dueDate: task.dueDate ?? "",
    percentComplete: task.percentComplete ?? (task.status === "completed" ? 100 : 0)
  })),
  activityEntries: (structuredData?.activityEntries ?? []).map((activity): ReportActivityEntry => ({
    id: activity.id || `report-activity-${randomUUID()}`,
    reportId,
    description: activity.description,
    quantity: Number(activity.quantity) || 0,
    unit: activity.unit ?? "",
    percentComplete: Math.max(0, Math.min(100, Number(activity.percentComplete) || 0)),
    status: activity.status ?? "in_progress",
    startTime: activity.startTime ?? "",
    endTime: activity.endTime ?? "",
    laborEntryIds: activity.laborEntryIds ?? [],
    equipmentEntryIds: activity.equipmentEntryIds ?? []
  }))
});

const attachManualEquipmentToCatalog = (structuredData: ReportStructuredData, actor: ReturnType<typeof getAuthActor>) => {
  return {
    ...structuredData,
    equipmentEntries: structuredData.equipmentEntries.map((entry) => {
      if (entry.catalogItemId || !entry.description.trim()) return entry;
      const existingItem = database.findCatalogItemByDescription("equipment", entry.description);
      const catalogItem = existingItem
        ? existingItem.status === "active" ? existingItem : database.updateCatalogItem("equipment", { ...existingItem, status: "active" }, actor) ?? existingItem
        : database.createCatalogItem("equipment", {
        id: `equipment-${randomUUID()}`,
        description: entry.description.trim(),
        status: "active",
        sourceType: "customized"
      }, actor);
      return { ...entry, catalogItemId: catalogItem.id };
    })
  };
};

export async function registerRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublic = path === "/health" || path === "/api/auth/login";
    const isLogout = path === "/api/auth/logout";

    if (isPublic || !path.startsWith("/api")) {
      return;
    }

    const authResult = await authenticateRequest(request, reply);
    if (authResult) return authResult;

    if (isLogout) return;

    return verifyCsrfToken(request, reply);
  });

  app.get("/health", async () => {
    const company = database.getCompany();

    return {
      ok: true,
      service: "construction-report-backend",
      language: company.defaultLanguage,
      persistence: "sqlite"
    };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const parsedBody = loginSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid login payload" });
    }

    const payload = parsedBody.data;
    const throttleKey = `${request.ip}:${payload.email.toLowerCase()}`;

    if (getFailedLoginState(throttleKey).locked) {
      return reply.code(429).send({ error: "Too many login attempts. Try again later." });
    }

    const user = database.getUserByEmail(payload.email);
    const passwordHash = user ? database.getUserPasswordHash(user.id) : "";
    const validPassword = user ? await verifyPassword(passwordHash, payload.password) : false;

    if (!user || user.status !== "active" || !validPassword) {
      recordFailedLogin(throttleKey);
      return reply.code(401).send({ error: "Invalid e-mail or password" });
    }

    clearFailedLogins(throttleKey);
    const { token, csrfToken } = createSessionForUser(user, request);
    setSessionCookie(reply, token, csrfToken);

    return { user, csrfToken };
  });

  app.get("/api/auth/me", async (request, reply) => {
    const csrfToken = createCsrfToken();
    if (request.auth?.session) {
      database.updateAuthSessionCsrf(request.auth.session.id, hashSessionToken(csrfToken));
      setCsrfCookie(reply, csrfToken);
    }

    return { user: request.auth?.user, csrfToken };
  });

  app.post("/api/auth/logout", async (request, reply) => {
    const token = request.cookies?.diario_session;

    if (token) {
      database.deleteAuthSession(hashSessionToken(token), getAuthActor(request));
    }

    clearSessionCookie(reply);
    return { ok: true };
  });

  app.get("/api/bootstrap", async () => ({
    company: database.getCompany(),
    counts: database.getCounts()
  }));

  app.get("/api/users", async () => ({ users: database.listUsers() }));

  app.post("/api/users", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator"]);
    if (denied) return denied;

    const parsedBody = userSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid user payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const password = payload.password ?? "";

    if (!validatePasswordPolicy(password)) {
      return reply.code(400).send({ error: "Password must have 8-128 characters and include letters and numbers" });
    }

    const user: User = {
      id: `user-${randomUUID()}`,
      companyId: database.getCompany().id,
      name: payload.name,
      email: payload.email,
      jobTitle: payload.jobTitle,
      accessProfile: payload.accessProfile,
      status: payload.status,
      signatureId: `sig-user-${randomUUID().slice(0, 8)}-virtual`,
      createdAt: nowIso()
    };
    const passwordHash = await hashPassword(password);

    return reply.code(201).send({ user: database.createUser(user, getAuthActor(request), passwordHash) });
  });

  app.patch("/api/users/:id", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator"]);
    if (denied) return denied;

    const { id } = request.params as { id: string };
    const existingUser = database.getUser(id);

    if (!existingUser) {
      return reply.code(404).send({ error: "User not found" });
    }

    const parsedBody = userSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid user payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const user: User = {
      ...existingUser,
      name: payload.name,
      email: payload.email,
      jobTitle: payload.jobTitle,
      accessProfile: payload.accessProfile,
      status: payload.status
    };

    const updatedUser = database.updateUser(user, getAuthActor(request));
    if (!updatedUser) {
      return reply.code(404).send({ error: "User not found" });
    }

    if (payload.password) {
      if (!validatePasswordPolicy(payload.password)) {
        return reply.code(400).send({ error: "Password must have 8-128 characters and include letters and numbers" });
      }

      database.updateUserPassword(updatedUser.id, await hashPassword(payload.password), getAuthActor(request));
    }

    return { user: updatedUser };
  });

  app.get("/api/projects", async () => ({ projects: database.listProjects() }));

  app.post("/api/projects", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const parsedBody = createProjectSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid project payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const project: Project = {
      id: `project-${randomUUID()}`,
      companyId: database.getCompany().id,
      name: payload.name,
      status: payload.status as ProjectStatus,
      group: payload.group,
      contractType: payload.contractType as ContractType,
      responsible: payload.responsible,
      contractor: payload.contractor,
      contract: payload.contract,
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      startDate: payload.startDate,
      expectedEndDate: payload.expectedEndDate,
      taskListEnabled: payload.taskListEnabled,
      requirePhotos: payload.requirePhotos
    };

    return reply.code(201).send({ project: database.createProject(project, getAuthActor(request)) });
  });

  app.patch("/api/projects/:id", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const { id } = request.params as { id: string };
    const existingProject = database.getProject(id);

    if (!existingProject) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const parsedBody = updateProjectSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid project payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const project: Project = {
      ...existingProject,
      name: payload.name,
      status: payload.status as ProjectStatus,
      group: payload.group,
      contractType: payload.contractType as ContractType,
      responsible: payload.responsible,
      contractor: payload.contractor,
      contract: payload.contract,
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      startDate: payload.startDate,
      expectedEndDate: payload.expectedEndDate,
      taskListEnabled: payload.taskListEnabled,
      requirePhotos: payload.requirePhotos
    };

    const updatedProject = database.updateProject(project, getAuthActor(request));
    if (!updatedProject) {
      return reply.code(404).send({ error: "Project not found" });
    }

    return { project: updatedProject };
  });

  app.get("/api/projects/:id/overview", async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = database.getProject(id);

    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const projectReports = database.listReports({ projectId: id });
    const recentPhotos = database.listProjectRecentAttachments(id, "photo", 12);

    return {
      project,
      counters: {
        reports: projectReports.length,
        activities: projectReports.filter((report) => report.sections.activities.trim()).length,
        occurrences: projectReports.reduce((total, report) => total + report.structuredData.occurrenceEntries.length, 0),
        comments: projectReports.filter((report) => report.sections.comments.trim()).length,
        photos: database.countProjectAttachments(id, "photo"),
        videos: 0
      },
      recentReports: projectReports,
      recentPhotos
    };
  });

  app.get("/api/projects/:id/weather", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsedQuery = projectWeatherQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return reply.code(400).send({ error: "Invalid weather query", details: parsedQuery.error.flatten() });
    }

    const project = database.getProject(id);
    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const latitude = asCoordinateNumber(project.latitude);
    const longitude = asCoordinateNumber(project.longitude);
    if (latitude === undefined || longitude === undefined) {
      return reply.code(400).send({ error: "Cadastre as coordenadas da obra antes de buscar dados climáticos." });
    }

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return reply.code(400).send({ error: "As coordenadas da obra estão fora da faixa válida." });
    }

    const date = parsedQuery.data.date ?? new Date().toISOString().slice(0, 10);
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: "weather_code,cloud_cover,precipitation",
      daily: "precipitation_sum",
      timezone: "auto",
      start_date: date,
      end_date: date
    });

    let response: Response;
    let body: OpenMeteoResponse;
    try {
      response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
        signal: AbortSignal.timeout(10000)
      });
      body = (await response.json()) as OpenMeteoResponse;
    } catch {
      return reply.code(502).send({ error: "Não foi possível consultar o Open-Meteo." });
    }

    if (!response.ok || body.error) {
      return reply.code(502).send({ error: body.reason ?? "Não foi possível consultar o Open-Meteo." });
    }

    return {
      weather: buildWeatherSuggestion(body),
      source: {
        provider: "Open-Meteo",
        date,
        latitude,
        longitude
      },
      warning: "Confira as informações sugeridas. As condições reais na obra podem ser diferentes dos dados coletados pelas agências de meteorologia."
    };
  });

  app.get("/api/reports", async (request) => {
    const query = request.query as { projectId?: string; status?: string };
    return { reports: database.listReports({ projectId: query.projectId, status: query.status }) };
  });

  app.get("/api/reports/:id/attachments", async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    return { attachments: database.listReportAttachments(id) };
  });

  app.post("/api/reports/:id/attachments", async (request, reply) => {
    const denied = requireWriteAccess(request, reply);
    if (denied) return denied;

    const { id } = request.params as { id: string };
    const report = database.getReport(id);

    if (!report) {
      return reply.code(404).send({ error: "Report not found" });
    }

    const parsedBody = attachmentSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid attachment payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const attachment: ReportAttachment = {
      id: `attachment-${randomUUID()}`,
      reportId: report.id,
      projectId: report.projectId,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      attachmentType: payload.attachmentType,
      source: payload.source,
      taskId: payload.taskId,
      dataUrl: payload.dataUrl,
      caption: payload.caption,
      createdAt: new Date().toISOString(),
      createdByUserId: request.auth?.user.id ?? "system",
      createdByName: request.auth?.user.name ?? "System"
    };

    return reply.code(201).send({ attachment: database.createReportAttachment(attachment, getAuthActor(request)) });
  });

  app.post("/api/reports", async (request, reply) => {
    const denied = requireWriteAccess(request, reply);
    if (denied) return denied;

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

    const currentUser = request.auth?.user;
    const lastReport = database.getLastReport(payload.projectId);
    const number = database.nextReportNumber();
    const reportId = `report-${number}-${randomUUID()}`;
    const report: Report = {
      id: reportId,
      number,
      projectId: payload.projectId,
      templateId: payload.templateId,
      reportDate: payload.reportDate,
      status: "draft",
      creatorUserId: currentUser?.id ?? "system",
      creatorName: currentUser?.name ?? "System",
      createdAt: nowIso(),
      sections: payload.copyFromLast && lastReport ? { ...lastReport.sections } : emptySections(),
      structuredData: payload.copyFromLast && lastReport ? normalizeStructuredData(reportId, lastReport.structuredData) : emptyStructuredData()
    };

    return reply.code(201).send({ report: database.createReport(report, getAuthActor(request)) });
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
    const denied = requireWriteAccess(request, reply);
    if (denied) return denied;

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

    const changedFields = [
      ...Object.keys(parsedBody.data.sections),
      ...(parsedBody.data.structuredData ? ["structuredData"] : [])
    ];
    const normalizedStructuredData = parsedBody.data.structuredData ? normalizeStructuredData(report.id, parsedBody.data.structuredData) : report.structuredData;
    const updatedReport: Report = {
      ...report,
      status: report.status === "pending_review" ? "revised" : report.status,
      sections: {
        ...report.sections,
        ...parsedBody.data.sections
      },
      structuredData: parsedBody.data.structuredData ? attachManualEquipmentToCatalog(normalizedStructuredData, getAuthActor(request)) : normalizedStructuredData
    };

    return { report: database.updateReportSections(updatedReport, getAuthActor(request), changedFields) };
  });

  app.post("/api/reports/:id/submit-review", async (request, reply) => {
    const denied = requireWriteAccess(request, reply);
    if (denied) return denied;

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

    return { report: database.submitReport(updatedReport, getAuthActor(request)) };
  });

  app.post("/api/reports/:id/approve", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "reviewer_approver"]);
    if (denied) return denied;

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

    const approver = request.auth?.user ?? database.getUser(parsedBody.data.approverUserId);
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
        actorUserId: approvedReport.approverUserId ?? "system",
        actorName: approvedReport.approverName ?? "System"
      })
    };
  });

  app.post("/api/reports/:id/reject", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "reviewer_approver"]);
    if (denied) return denied;

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

    return { report: database.rejectReport(updatedReport, getAuthActor(request), parsedBody.data.reason) };
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

  app.post("/api/report-templates", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const parsedBody = reportTemplateSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid report template payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const reportTemplate: ReportTemplate = {
      id: `template-${randomUUID()}`,
      name: payload.name,
      status: payload.status,
      type: payload.type,
      dateType: payload.dateType,
      enabledItems: payload.enabledItems,
      signaturePdfDisplay: payload.signaturePdfDisplay
    };

    return reply.code(201).send({ reportTemplate: database.createReportTemplate(reportTemplate, getAuthActor(request)) });
  });

  app.patch("/api/report-templates/:id", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const { id } = request.params as { id: string };
    const existingTemplate = database.getReportTemplate(id);

    if (!existingTemplate) {
      return reply.code(404).send({ error: "Report template not found" });
    }

    const parsedBody = reportTemplateSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid report template payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const reportTemplate: ReportTemplate = {
      ...existingTemplate,
      name: payload.name,
      status: payload.status,
      type: payload.type,
      dateType: payload.dateType,
      enabledItems: payload.enabledItems,
      signaturePdfDisplay: payload.signaturePdfDisplay
    };

    const updatedTemplate = database.updateReportTemplate(reportTemplate, getAuthActor(request));
    if (!updatedTemplate) {
      return reply.code(404).send({ error: "Report template not found" });
    }

    return { reportTemplate: updatedTemplate };
  });

  app.get("/api/catalogs/labor", async () => ({ labor: database.listCatalog("labor") }));

  app.get("/api/catalogs/equipment", async () => ({ equipment: database.listCatalog("equipment") }));

  app.get("/api/catalogs/occurrence-types", async () => ({ occurrenceTypes: database.listCatalog("occurrence_type") }));

  app.get("/api/catalogs/project-groups", async () => ({ projectGroups: database.listCatalog("project_group") }));

  app.get("/api/catalogs/checklists", async () => ({ checklists: database.listChecklists() }));

  app.post("/api/catalogs/items/:kind", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const { kind } = request.params as { kind: string };
    const catalogKind = getCatalogKind(kind);

    if (!catalogKind) {
      return reply.code(400).send({ error: "Invalid catalog kind" });
    }

    const parsedBody = catalogItemSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid catalog payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const item: CatalogItem = {
      id: `${catalogKind}-${randomUUID()}`,
      description: payload.description,
      group: payload.group || undefined,
      status: payload.status,
      sourceType: payload.sourceType
    };

    return reply.code(201).send({ item: database.createCatalogItem(catalogKind, item, getAuthActor(request)) });
  });

  app.patch("/api/catalogs/items/:kind/:id", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const { kind, id } = request.params as { kind: string; id: string };
    const catalogKind = getCatalogKind(kind);

    if (!catalogKind) {
      return reply.code(400).send({ error: "Invalid catalog kind" });
    }

    const existingItem = database.getCatalogItem(id);

    if (!existingItem) {
      return reply.code(404).send({ error: "Catalog item not found" });
    }

    const parsedBody = catalogItemSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid catalog payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const item: CatalogItem = {
      ...existingItem,
      description: payload.description,
      group: payload.group || undefined,
      status: payload.status,
      sourceType: payload.sourceType
    };

    const updatedItem = database.updateCatalogItem(catalogKind, item, getAuthActor(request));
    if (!updatedItem) {
      return reply.code(404).send({ error: "Catalog item not found" });
    }

    return { item: updatedItem };
  });

  app.post("/api/catalogs/checklists", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const parsedBody = checklistSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid checklist payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const checklist: ChecklistTemplate = {
      id: `checklist-${randomUUID()}`,
      name: payload.name,
      status: payload.status,
      items: payload.items.map((item, index) => ({
        id: item.id ?? `checklist-item-${randomUUID()}-${index}`,
        order: item.order,
        itemLabel: item.itemLabel,
        question: item.question,
        answerType: item.answerType,
        allowMultipleResponses: item.allowMultipleResponses,
        answers: item.answers
      }))
    };

    return reply.code(201).send({ checklist: database.createChecklist(checklist, getAuthActor(request)) });
  });

  app.patch("/api/catalogs/checklists/:id", async (request, reply) => {
    const denied = requireProfiles(request, reply, ["administrator", "customized"]);
    if (denied) return denied;

    const { id } = request.params as { id: string };
    const existingChecklist = database.getChecklist(id);

    if (!existingChecklist) {
      return reply.code(404).send({ error: "Checklist not found" });
    }

    const parsedBody = checklistSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({ error: "Invalid checklist payload", details: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    const checklist: ChecklistTemplate = {
      ...existingChecklist,
      name: payload.name,
      status: payload.status,
      items: payload.items.map((item, index) => ({
        id: item.id ?? `checklist-item-${randomUUID()}-${index}`,
        order: item.order,
        itemLabel: item.itemLabel,
        question: item.question,
        answerType: item.answerType,
        allowMultipleResponses: item.allowMultipleResponses,
        answers: item.answers
      }))
    };

    const updatedChecklist = database.updateChecklist(checklist, getAuthActor(request));
    if (!updatedChecklist) {
      return reply.code(404).send({ error: "Checklist not found" });
    }

    return { checklist: updatedChecklist };
  });

  app.post("/api/whatsapp/webhook", async (request, reply) => {
    return reply.code(202).send({
      accepted: true,
      nextStep: "Persist inbound message, download media, transcribe audio, and create draft report.",
      receivedBody: request.body
    });
  });
}
