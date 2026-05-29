import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Edit3,
  FileLock2,
  FileText,
  HardHat,
  ListChecks,
  LockKeyhole,
  Mic,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Upload,
  User,
  Users,
  Video,
  Wrench,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "./api";
import type {
  AccessProfile,
  AuditLog,
  CatalogItem,
  CatalogItemPayload,
  ChecklistPayload,
  ChecklistTemplate,
  ContractType,
  CreateProjectPayload,
  Project,
  ProjectStatus,
  Report,
  ReportSections,
  ReportTemplate,
  ReportTemplatePayload,
  User as AppUser,
  UserPayload
} from "./api";

type Page =
  | "projects"
  | "overview"
  | "project-search"
  | "reports"
  | "report-detail"
  | "analysis"
  | "chat"
  | "settings-profile"
  | "settings-company"
  | "settings-users"
  | "settings-project-groups"
  | "settings-templates"
  | "settings-labor"
  | "settings-equipment"
  | "settings-occurrences"
  | "settings-checklist"
  | "settings-project-labor"
  | "settings-project-equipment";

type CatalogKind = "labor" | "equipment" | "occurrences";
type ModalState =
  | { type: "project-create" }
  | { type: "project-edit"; project: Project }
  | { type: "report-create" }
  | { type: "user"; user?: AppUser }
  | { type: "template"; template?: ReportTemplate }
  | { type: "catalog"; kind: CatalogKind; item?: CatalogItem }
  | { type: "checklist"; checklist?: ChecklistTemplate }
  | { type: "signature" }
  | null;

const reportItemOptions = [
  ["working_hours", "Horário de trabalho"],
  ["weather_conditions", "Condição climática"],
  ["labor", "Mão de obra"],
  ["equipment", "Equipamento"],
  ["activity", "Atividade"],
  ["occurrence", "Ocorrência"],
  ["checklist", "Checklist"],
  ["material_control", "Controle de material"],
  ["commentary", "Comentário"],
  ["photo_gallery", "Foto"],
  ["video", "Vídeo"],
  ["attachment", "Anexo"],
  ["signature", "Assinatura"]
] as const;

const reportFields: Array<{ key: keyof ReportSections; item: string; label: string; placeholder: string; rows: number }> = [
  { key: "weather", item: "weather_conditions", label: "Condições climáticas", placeholder: "Ex: manhã com tempo aberto, tarde chuvosa.", rows: 3 },
  { key: "labor", item: "labor", label: "Mão de obra", placeholder: "Ex: Pedreiro: 2\nServente: 3", rows: 5 },
  { key: "equipment", item: "equipment", label: "Equipamentos", placeholder: "Ex: Betoneira: 1\nCaminhão basculante: 1", rows: 4 },
  { key: "activities", item: "activity", label: "Atividades executadas", placeholder: "Descreva as frentes executadas no dia.", rows: 5 },
  { key: "occurrences", item: "occurrence", label: "Ocorrências", placeholder: "Registre atrasos, falta de material, acidentes ou impedimentos.", rows: 4 },
  { key: "checklistNotes", item: "checklist", label: "Checklist", placeholder: "Resumo das verificações realizadas.", rows: 3 },
  { key: "comments", item: "commentary", label: "Comentários", placeholder: "Observações gerais e próximos passos.", rows: 4 }
];

const menuItems = [
  { page: "projects" as Page, label: "Obras", icon: Building2 },
  { page: "reports" as Page, label: "Relatórios", icon: ClipboardList },
  { page: "analysis" as Page, label: "Análise de dados", icon: BarChart3 },
  { page: "settings-profile" as Page, label: "Cadastros", icon: Settings }
];

const settingsItems = [
  { page: "settings-profile" as Page, label: "Meu perfil", icon: User },
  { page: "settings-company" as Page, label: "Empresa", icon: Building2 },
  { page: "settings-users" as Page, label: "Usuários", icon: Users },
  { page: "settings-project-groups" as Page, label: "Grupos de obras", icon: Briefcase },
  { page: "settings-templates" as Page, label: "Modelos de relatório", icon: ClipboardCheck },
  { page: "settings-labor" as Page, label: "Mão de obra", icon: HardHat },
  { page: "settings-equipment" as Page, label: "Equipamento", icon: Wrench },
  { page: "settings-occurrences" as Page, label: "Tipos de ocorrência", icon: ShieldCheck },
  { page: "settings-checklist" as Page, label: "Checklist", icon: ListChecks },
  { page: "settings-project-labor" as Page, label: "Predefinir mão de obra", icon: HardHat },
  { page: "settings-project-equipment" as Page, label: "Predefinir equipamentos", icon: Wrench }
];

function App() {
  const [page, setPage] = useState<Page>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [labor, setLabor] = useState<CatalogItem[]>([]);
  const [equipment, setEquipment] = useState<CatalogItem[]>([]);
  const [occurrences, setOccurrences] = useState<CatalogItem[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [projectsResponse, reportsResponse, templatesResponse, usersResponse, laborResponse, equipmentResponse, occurrenceResponse, checklistResponse] = await Promise.all([
        api.getProjects(),
        api.getReports(),
        api.getReportTemplates(),
        api.getUsers(),
        api.getLabor(),
        api.getEquipment(),
        api.getOccurrenceTypes(),
        api.getChecklists()
      ]);

      setProjects(projectsResponse.projects);
      setReports(reportsResponse.reports);
      setTemplates(templatesResponse.reportTemplates);
      setUsers(usersResponse.users);
      setLabor(laborResponse.labor);
      setEquipment(equipmentResponse.equipment);
      setOccurrences(occurrenceResponse.occurrenceTypes);
      setChecklists(checklistResponse.checklists);
      setSelectedProjectId((current) => current || projectsResponse.projects[0]?.id || "");
      setSelectedReportId((current) => current || reportsResponse.reports[0]?.id || "");
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a API.");
    } finally {
      setLoading(false);
    }
  }

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedReport = reports.find((report) => report.id === selectedReportId);
  const projectReports = selectedProject ? reports.filter((report) => report.projectId === selectedProject.id) : reports;
  const isSettings = page.startsWith("settings");

  const upsertReport = (report: Report) => {
    setReports((current) => [report, ...current.filter((item) => item.id !== report.id)].sort(sortReports));
    setSelectedReportId(report.id);
  };

  const upsertProject = (project: Project) => {
    setProjects((current) => [project, ...current.filter((item) => item.id !== project.id)].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedProjectId(project.id);
  };

  async function handleCreateProject(payload: CreateProjectPayload) {
    const response = await api.createProject(payload);
    upsertProject(response.project);
    setPage("overview");
  }

  async function handleUpdateProject(id: string, payload: CreateProjectPayload) {
    const response = await api.updateProject(id, payload);
    upsertProject(response.project);
  }

  async function handleCreateReport(payload: { projectId: string; templateId: string; reportDate: string; copyFromLast: boolean }) {
    const response = await api.createReport(payload);
    upsertReport(response.report);
    setSelectedProjectId(response.report.projectId);
    setPage("report-detail");
  }

  async function handleUpdateReport(reportId: string, sections: Partial<ReportSections>) {
    const response = await api.updateReport(reportId, sections);
    upsertReport(response.report);
  }

  async function handleSubmitReport(reportId: string) {
    const response = await api.submitReport(reportId);
    upsertReport(response.report);
  }

  async function handleApproveReport(reportId: string) {
    const response = await api.approveReport(reportId);
    upsertReport(response.report);
  }

  async function handleSaveUser(payload: UserPayload, user?: AppUser) {
    const response = user ? await api.updateUser(user.id, payload) : await api.createUser(payload);
    setUsers((current) => [response.user, ...current.filter((item) => item.id !== response.user.id)].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleSaveTemplate(payload: ReportTemplatePayload, template?: ReportTemplate) {
    const response = template ? await api.updateReportTemplate(template.id, payload) : await api.createReportTemplate(payload);
    setTemplates((current) => [response.reportTemplate, ...current.filter((item) => item.id !== response.reportTemplate.id)].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleSaveCatalog(kind: CatalogKind, payload: CatalogItemPayload, item?: CatalogItem) {
    const response = item ? await api.updateCatalogItem(kind, item.id, payload) : await api.createCatalogItem(kind, payload);
    const setMap = { labor: setLabor, equipment: setEquipment, occurrences: setOccurrences };
    setMap[kind]((current) => [response.item, ...current.filter((entry) => entry.id !== response.item.id)].sort((a, b) => a.description.localeCompare(b.description)));
  }

  async function handleSaveChecklist(payload: ChecklistPayload, checklist?: ChecklistTemplate) {
    const response = checklist ? await api.updateChecklist(checklist.id, payload) : await api.createChecklist(payload);
    setChecklists((current) => [response.checklist, ...current.filter((entry) => entry.id !== response.checklist.id)].sort((a, b) => a.name.localeCompare(b.name)));
  }

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedReportId(reports.find((report) => report.projectId === projectId)?.id ?? "");
    setPage("overview");
  };

  const openReport = (reportId: string) => {
    const report = reports.find((item) => item.id === reportId);
    if (report) {
      setSelectedProjectId(report.projectId);
      setSelectedReportId(report.id);
      setPage("report-detail");
    }
  };

  const handleCreateButton = () => {
    if (page === "reports" || page === "report-detail") {
      setModal({ type: "report-create" });
      return;
    }

    if (page === "settings-users") {
      setModal({ type: "user" });
      return;
    }

    if (page === "settings-templates") {
      setModal({ type: "template" });
      return;
    }

    if (page === "settings-labor") {
      setModal({ type: "catalog", kind: "labor" });
      return;
    }

    if (page === "settings-equipment") {
      setModal({ type: "catalog", kind: "equipment" });
      return;
    }

    if (page === "settings-occurrences") {
      setModal({ type: "catalog", kind: "occurrences" });
      return;
    }

    if (page === "settings-checklist") {
      setModal({ type: "checklist" });
      return;
    }

    setModal({ type: "project-create" });
  };

  return (
    <div className="app-shell">
      <TopNav activePage={page} onNavigate={setPage} onCreate={handleCreateButton} />
      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <section className="page wide">
            <div className="panel loading-panel">Carregando dados do sistema...</div>
          </section>
        ) : isSettings ? (
          <SettingsLayout
            activePage={page}
            onNavigate={setPage}
            users={users}
            templates={templates}
            labor={labor}
            equipment={equipment}
            occurrences={occurrences}
            checklists={checklists}
            projects={projects}
            onOpenModal={setModal}
          />
        ) : page === "overview" && selectedProject ? (
          <ProjectOverview
            project={selectedProject}
            reports={projectReports}
            onBack={() => setPage("projects")}
            onReports={() => setPage("reports")}
            onSearch={() => setPage("project-search")}
            onEdit={() => setModal({ type: "project-edit", project: selectedProject })}
            onOpenReport={openReport}
          />
        ) : page === "project-search" && selectedProject ? (
          <ProjectSearchPage
            project={selectedProject}
            reports={projectReports}
            onBack={() => setPage("overview")}
            onOverview={() => setPage("overview")}
            onReports={() => setPage("reports")}
            onEdit={() => setModal({ type: "project-edit", project: selectedProject })}
            onOpenReport={openReport}
          />
        ) : page === "reports" ? (
          <ReportsPage projects={projects} selectedProjectId={selectedProject?.id ?? ""} reports={projectReports} onSelectProject={setSelectedProjectId} onAddReport={() => setModal({ type: "report-create" })} onOpenReport={openReport} />
        ) : page === "report-detail" && selectedReport ? (
          <ReportDetailPage
            report={selectedReport}
            project={projects.find((project) => project.id === selectedReport.projectId)}
            template={templates.find((template) => template.id === selectedReport.templateId)}
            labor={labor}
            equipment={equipment}
            occurrences={occurrences}
            checklists={checklists}
            onBack={() => setPage("reports")}
            onSave={handleUpdateReport}
            onSubmit={handleSubmitReport}
            onApprove={handleApproveReport}
          />
        ) : page === "analysis" ? (
          <AnalysisPage reports={reports} />
        ) : page === "chat" ? (
          <ChatHubPage selectedProject={selectedProject} />
        ) : (
          <ProjectsPage projects={projects} reports={reports} onOpenProject={openProject} onAddProject={() => setModal({ type: "project-create" })} />
        )}
      </main>
      <AppModal
        modal={modal}
        projects={projects}
        templates={templates}
        onClose={() => setModal(null)}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onCreateReport={handleCreateReport}
        onSaveUser={handleSaveUser}
        onSaveTemplate={handleSaveTemplate}
        onSaveCatalog={handleSaveCatalog}
        onSaveChecklist={handleSaveChecklist}
      />
    </div>
  );
}

function TopNav({ activePage, onNavigate, onCreate }: { activePage: Page; onNavigate: (page: Page) => void; onCreate: () => void }) {
  return (
    <header className="top-nav">
      <div className="brand">TT HOME LTDA</div>
      <nav className="top-menu">
        {menuItems.map((item) => {
          const isActive = activePage === item.page || (item.page === "settings-profile" && activePage.startsWith("settings"));
          return (
            <button className={isActive ? "nav-item active" : "nav-item"} key={item.page} onClick={() => onNavigate(item.page)}>
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
        <button className={activePage === "chat" ? "nav-item active" : "nav-item"} onClick={() => onNavigate("chat")}>
          <Bot size={16} />
          Chat RDO
        </button>
      </nav>
      <div className="top-actions">
        <button className="language">PT-BR</button>
        <button className="create-button" onClick={onCreate}>
          <Plus size={17} />
          ADICIONAR
        </button>
        <div className="user-chip">
          <span>JO</span>
          <div>
            <strong>JOAO VICTOR</strong>
            <small>Administrador</small>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProjectsPage({ projects, reports, onOpenProject, onAddProject }: { projects: Project[]; reports: Report[]; onOpenProject: (projectId: string) => void; onAddProject: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const groups = Array.from(new Set(projects.map((project) => project.group).filter(Boolean))).sort();
  const visibleProjects = projects.filter((project) => matchesQuery([project.name, project.responsible, project.contractor, project.address], query) && (status === "all" || project.status === status) && (group === "all" || project.group === group));

  return (
    <section className="page narrow">
      <div className="page-toolbar">
        <h1>Obras ({visibleProjects.length})</h1>
        <div className="filters">
          <IconInput icon={Search} placeholder="Pesquisa" value={query} onChange={setQuery} />
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="all">Todas as obras</option>
            {groups.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos os status</option>
            <option value="not_started">Não iniciado</option>
            <option value="stalled">Paralisado</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluído</option>
          </select>
          <button className="primary-action" onClick={onAddProject}>
            <Plus size={18} />
            Adicionar obra
          </button>
        </div>
      </div>
      <div className="project-grid">
        {visibleProjects.map((project) => (
          <button className="project-card" key={project.id} onClick={() => onOpenProject(project.id)}>
            <span className={`badge ${projectStatusClass(project.status)}`}>{projectStatusLabel(project.status)}</span>
            <div className="project-icon">
              <ClipboardCheck size={52} />
            </div>
            <div className="project-card-footer">
              <span>
                <CalendarDays size={15} /> {reports.filter((report) => report.projectId === project.id).length}
              </span>
              <strong>{project.name}</strong>
            </div>
          </button>
        ))}
      </div>
      {visibleProjects.length === 0 && <EmptyState icon={Building2} title="Nenhuma obra encontrada" text="Ajuste a pesquisa ou o status para ver outros resultados." />}
    </section>
  );
}

function ProjectOverview({ project, reports, onBack, onReports, onSearch, onEdit, onOpenReport }: { project: Project; reports: Report[]; onBack: () => void; onReports: () => void; onSearch: () => void; onEdit: () => void; onOpenReport: (reportId: string) => void }) {
  const approved = reports.filter((report) => report.status === "approved").length;
  const pending = reports.filter((report) => report.status === "pending_review").length;
  const drafts = reports.filter((report) => report.status === "draft" || report.status === "revised").length;
  const cards = [
    { label: "Relatórios", value: reports.length, icon: CalendarDays },
    { label: "Rascunhos", value: drafts, icon: ClipboardList },
    { label: "Em revisão", value: pending, icon: ShieldCheck },
    { label: "Aprovados", value: approved, icon: CheckCircle2 },
    { label: "Fotos", value: 0, icon: Camera },
    { label: "Vídeos", value: 0, icon: Video }
  ];

  return (
    <div className="project-layout">
      <ProjectSidebar project={project} reportsCount={reports.length} active="overview" onBack={onBack} onOverview={() => undefined} onReports={onReports} onSearch={onSearch} onEdit={onEdit} />
      <section className="project-content">
        <div className="kpi-row">
          {cards.map((card) => (
            <article className="kpi-card" key={card.label}>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
              <card.icon size={24} />
            </article>
          ))}
        </div>
        <div className="split-panels">
          <section className="panel">
            <div className="panel-header">
              <h2>Relatórios recentes</h2>
              <button className="link-button" onClick={onReports}>
                Ver todos
              </button>
            </div>
            {reports.length > 0 ? <ReportCompactList reports={reports.slice(0, 4)} onOpenReport={onOpenReport} /> : <EmptyState icon={ClipboardList} title="Nenhum relatório encontrado" text="Adicione dados ao relatório para acompanhar a evolução." />}
          </section>
          <section className="panel empty-panel">
            <h2>Fotos recentes</h2>
            <div>
              <Camera size={42} />
              <strong>Nenhuma foto encontrada</strong>
              <span>As fotos serão exibidas quando forem anexadas aos RDOs.</span>
            </div>
          </section>
        </div>
        <section className="panel">
          <div className="panel-header">
            <h2>Informações da obra</h2>
            <button className="link-button" onClick={onEdit}>
              Editar
            </button>
          </div>
          <ProjectInfo project={project} />
        </section>
      </section>
    </div>
  );
}

function ProjectSearchPage({
  project,
  reports,
  onBack,
  onOverview,
  onReports,
  onEdit,
  onOpenReport
}: {
  project: Project;
  reports: Report[];
  onBack: () => void;
  onOverview: () => void;
  onReports: () => void;
  onEdit: () => void;
  onOpenReport: (reportId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const filteredReports = reports.filter((report) => {
    const textMatches = matchesQuery([`RDO ${report.number}`, report.reportDate, report.creatorName, report.sections.activities, report.sections.occurrences, report.sections.comments], query);
    const statusMatches = status === "all" || report.status === status;
    const dateMatches = !date || report.reportDate === date;
    return textMatches && statusMatches && dateMatches;
  });

  return (
    <div className="project-layout">
      <ProjectSidebar project={project} reportsCount={reports.length} active="search" onBack={onBack} onOverview={onOverview} onReports={onReports} onSearch={() => undefined} onEdit={onEdit} />
      <section className="project-content">
        <div className="page-toolbar">
          <h1>Filtro de busca</h1>
          <div className="filters">
            <IconInput icon={Search} placeholder="Buscar nos RDOs" value={query} onChange={setQuery} />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="pending_review">Em revisão</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
        </div>
        <section className="panel">
          <div className="panel-header">
            <h2>Resultados ({filteredReports.length})</h2>
          </div>
          {filteredReports.length > 0 ? <ReportCompactList reports={filteredReports} onOpenReport={onOpenReport} /> : <EmptyState icon={Search} title="Nenhum relatório encontrado" text="Altere a busca, status ou data para localizar outro RDO." />}
        </section>
      </section>
    </div>
  );
}

function ReportsPage({ projects, selectedProjectId, reports, onSelectProject, onAddReport, onOpenReport }: { projects: Project[]; selectedProjectId: string; reports: Report[]; onSelectProject: (projectId: string) => void; onAddReport: () => void; onOpenReport: (reportId: string) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visibleReports = reports.filter((report) => matchesQuery([`RDO ${report.number}`, report.reportDate, report.creatorName, report.sections.activities, report.sections.occurrences], query) && (status === "all" || report.status === status));
  const statusCounts = {
    draft: reports.filter((report) => report.status === "draft" || report.status === "revised").length,
    pending: reports.filter((report) => report.status === "pending_review").length,
    approved: reports.filter((report) => report.status === "approved").length
  };

  return (
    <section className="page wide">
      <div className="page-toolbar">
        <h1>Relatórios</h1>
        <div className="filters">
          <IconInput icon={Search} placeholder="Buscar relatório" value={query} onChange={setQuery} />
          <select value={selectedProjectId} onChange={(event) => onSelectProject(event.target.value)}>
            {projects.map((project) => (
              <option value={project.id} key={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="pending_review">Em revisão</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <button className="primary-action" onClick={onAddReport}>
            <Plus size={18} />
            Adicionar RDO
          </button>
        </div>
      </div>
      <div className="state-strip">
        <Metric title="Preenchendo" value={String(statusCounts.draft)} />
        <Metric title="Para revisar" value={String(statusCounts.pending)} />
        <Metric title="Aprovados e bloqueados" value={String(statusCounts.approved)} />
      </div>
      <section className="panel">
        <div className="panel-header">
          <h2>Caixa de entrada de relatórios</h2>
          <span className="badge gray">{visibleReports.length} registros</span>
        </div>
        {visibleReports.length > 0 ? <ReportList reports={visibleReports} onOpenReport={onOpenReport} /> : <EmptyState icon={ClipboardList} title="Nenhum relatório encontrado" text="Ajuste a busca ou crie um novo RDO." />}
      </section>
    </section>
  );
}

function ReportDetailPage({ report, project, template, labor, equipment, occurrences, checklists, onBack, onSave, onSubmit, onApprove }: { report: Report; project?: Project; template?: ReportTemplate; labor: CatalogItem[]; equipment: CatalogItem[]; occurrences: CatalogItem[]; checklists: ChecklistTemplate[]; onBack: () => void; onSave: (reportId: string, sections: Partial<ReportSections>) => Promise<void>; onSubmit: (reportId: string) => Promise<void>; onApprove: (reportId: string) => Promise<void> }) {
  const [sections, setSections] = useState(report.sections);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setSections(report.sections);
    setAuditLogs([]);
    setError("");
    api
      .getReportAudit(report.id)
      .then((response) => active && setAuditLogs(response.auditLogs))
      .catch(() => active && setAuditLogs([]));
    return () => {
      active = false;
    };
  }, [report]);

  const enabledItems = template?.enabledItems ?? reportItemOptions.map(([value]) => value);
  const visibleFields = reportFields.filter((field) => enabledItems.includes(field.item));
  const locked = report.status === "approved";
  const canSubmit = report.status === "draft" || report.status === "rejected" || report.status === "revised";
  const canApprove = report.status === "pending_review";

  async function runAction(action: string, callback: () => Promise<void>) {
    try {
      setBusy(action);
      setError("");
      await callback();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Não foi possível concluir a ação.");
    } finally {
      setBusy("");
    }
  }

  const changeSection = (key: keyof ReportSections, value: string) => {
    setSections((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="page wide">
      <button className="back-title inline-back" onClick={onBack}>
        <ArrowLeft size={18} />
        Relatórios
      </button>
      <div className="report-detail-header">
        <div>
          <h1>RDO #{report.number} - {formatDate(report.reportDate)}</h1>
          <span>{project?.name ?? "Obra"} / {template?.name ?? "Relatório Diário de Obra"}</span>
        </div>
        <span className={`badge ${reportStatusClass(report.status)}`}>{reportStatusLabel(report.status)}</span>
      </div>
      {locked && (
        <div className="lock-banner">
          <LockKeyhole size={18} />
          Relatório aprovado e bloqueado. Edições ficam indisponíveis depois da aprovação.
        </div>
      )}
      {error && <div className="error-banner compact">{error}</div>}
      <div className="report-editor-layout">
        <section className="panel report-editor">
          <div className="panel-header">
            <h2>Preenchimento do relatório</h2>
            <span className="badge gray">{locked ? "Somente leitura" : "Editável"}</span>
          </div>
          <div className="editor-grid">
            {visibleFields.map((field) => (
              <label className="editor-field" key={field.key}>
                {field.label}
                <textarea disabled={locked} rows={field.rows} value={sections[field.key]} placeholder={field.placeholder} onChange={(event) => changeSection(field.key, event.target.value)} />
              </label>
            ))}
          </div>
          <div className="button-row">
            <button className="secondary-action" disabled={locked || Boolean(busy)} onClick={() => void runAction("save", () => onSave(report.id, sections))}>
              <Save size={17} />
              {busy === "save" ? "Salvando..." : "Salvar rascunho"}
            </button>
            <button className="primary-action" disabled={!canSubmit || Boolean(busy)} onClick={() => void runAction("submit", () => onSubmit(report.id))}>
              <Send size={17} />
              {busy === "submit" ? "Enviando..." : "Enviar para revisão"}
            </button>
            <button className="save-button" disabled={!canApprove || Boolean(busy)} onClick={() => void runAction("approve", () => onApprove(report.id))}>
              <CheckCircle2 size={17} />
              {busy === "approve" ? "Aprovando..." : "Aprovar relatório"}
            </button>
          </div>
        </section>
        <aside className="panel approval-sidebar">
          <div className="panel-header">
            <h2>Aprovação e assinatura</h2>
            <FileLock2 size={20} />
          </div>
          <div className="timeline">
            <TimelineItem label="Criado" value={`${report.creatorName} / ${formatDateTime(report.createdAt)}`} done />
            <TimelineItem label="Enviado para revisão" value={report.submittedAt ? formatDateTime(report.submittedAt) : "Pendente"} done={Boolean(report.submittedAt)} />
            <TimelineItem label="Aprovado" value={report.approvedAt ? `${report.approverName} / ${formatDateTime(report.approvedAt)}` : "Pendente"} done={Boolean(report.approvedAt)} />
          </div>
          <div className="approval-meta">
            <span><strong>ID do usuário</strong>{report.approverUserId ?? "-"}</span>
            <span><strong>Assinatura virtual</strong>{report.signatureId ?? "-"}</span>
            <span><strong>Versão do PDF</strong>{report.pdfVersionId ?? "-"}</span>
            <span><strong>Hash do relatório</strong>{report.hash ? `${report.hash.slice(0, 18)}...` : "-"}</span>
          </div>
          <ParameterSummary labor={labor} equipment={equipment} occurrences={occurrences} checklists={checklists} enabledItems={enabledItems} />
          <div className="audit-section">
            <h3>Auditoria do relatório</h3>
            {auditLogs.length > 0 ? auditLogs.map((log) => <TimelineItem key={log.id} label={auditEventLabel(log.eventType)} value={`${log.actorName} / ${formatDateTime(log.occurredAt)}${auditSummary(log)}`} done />) : <span className="muted-text">Nenhum evento registrado.</span>}
          </div>
        </aside>
      </div>
    </section>
  );
}

function SettingsLayout({ activePage, onNavigate, users, templates, labor, equipment, occurrences, checklists, projects, onOpenModal }: { activePage: Page; onNavigate: (page: Page) => void; users: AppUser[]; templates: ReportTemplate[]; labor: CatalogItem[]; equipment: CatalogItem[]; occurrences: CatalogItem[]; checklists: ChecklistTemplate[]; projects: Project[]; onOpenModal: (modal: ModalState) => void }) {
  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <span className="sidebar-title">Configurações</span>
        {settingsItems.slice(0, 3).map((item) => <SettingsButton key={item.page} item={item} activePage={activePage} onNavigate={onNavigate} count={item.page === "settings-users" ? users.length : undefined} />)}
        <span className="sidebar-title">Pré-cadastro</span>
        {settingsItems.slice(3, 9).map((item) => (
          <SettingsButton
            key={item.page}
            item={item}
            activePage={activePage}
            onNavigate={onNavigate}
            count={item.page === "settings-project-groups" ? new Set(projects.map((project) => project.group)).size : item.page === "settings-templates" ? templates.length : item.page === "settings-labor" ? labor.length : item.page === "settings-equipment" ? equipment.length : item.page === "settings-occurrences" ? occurrences.length : item.page === "settings-checklist" ? checklists.length : undefined}
          />
        ))}
        <span className="sidebar-title">Editar obra</span>
        {settingsItems.slice(9).map((item) => <SettingsButton key={item.page} item={item} activePage={activePage} onNavigate={onNavigate} />)}
      </aside>
      <section className="settings-content">
        {activePage === "settings-users" ? (
          <UsersSettings users={users} onOpenModal={onOpenModal} />
        ) : activePage === "settings-templates" ? (
          <TemplatesSettings templates={templates} onOpenModal={onOpenModal} />
        ) : activePage === "settings-labor" ? (
          <CatalogSettings title="Mão de obra" kind="labor" icon={HardHat} items={labor} onOpenModal={onOpenModal} />
        ) : activePage === "settings-equipment" ? (
          <CatalogSettings title="Equipamentos" kind="equipment" icon={Wrench} items={equipment} onOpenModal={onOpenModal} />
        ) : activePage === "settings-occurrences" ? (
          <CatalogSettings title="Tipos de ocorrência" kind="occurrences" icon={ShieldCheck} items={occurrences} onOpenModal={onOpenModal} />
        ) : activePage === "settings-checklist" ? (
          <ChecklistSettings checklists={checklists} onOpenModal={onOpenModal} />
        ) : activePage === "settings-project-groups" ? (
          <ProjectGroupsSettings projects={projects} />
        ) : activePage === "settings-company" ? (
          <CompanySettings />
        ) : activePage === "settings-project-labor" ? (
          <ProjectPredefineSettings title="Predefinir mão de obra por obra" projects={projects} items={labor} />
        ) : activePage === "settings-project-equipment" ? (
          <ProjectPredefineSettings title="Predefinir equipamentos por obra" projects={projects} items={equipment} />
        ) : (
          <ProfileSettings onOpenModal={onOpenModal} />
        )}
      </section>
    </div>
  );
}

function AppModal(props: {
  modal: ModalState;
  projects: Project[];
  templates: ReportTemplate[];
  onClose: () => void;
  onCreateProject: (payload: CreateProjectPayload) => Promise<void>;
  onUpdateProject: (id: string, payload: CreateProjectPayload) => Promise<void>;
  onCreateReport: (payload: { projectId: string; templateId: string; reportDate: string; copyFromLast: boolean }) => Promise<void>;
  onSaveUser: (payload: UserPayload, user?: AppUser) => Promise<void>;
  onSaveTemplate: (payload: ReportTemplatePayload, template?: ReportTemplate) => Promise<void>;
  onSaveCatalog: (kind: CatalogKind, payload: CatalogItemPayload, item?: CatalogItem) => Promise<void>;
  onSaveChecklist: (payload: ChecklistPayload, checklist?: ChecklistTemplate) => Promise<void>;
}) {
  const { modal, onClose } = props;
  if (!modal) return null;
  if (modal.type === "project-create") return <ProjectModal title="Adicionar obra" onClose={onClose} onSave={props.onCreateProject} />;
  if (modal.type === "project-edit") return <ProjectModal title="Editar obra" project={modal.project} onClose={onClose} onSave={(payload) => props.onUpdateProject(modal.project.id, payload)} />;
  if (modal.type === "report-create") return <AddReportModal projects={props.projects} templates={props.templates} defaultProjectId={props.projects[0]?.id ?? ""} onClose={onClose} onSave={props.onCreateReport} />;
  if (modal.type === "user") return <UserModal user={modal.user} onClose={onClose} onSave={(payload) => props.onSaveUser(payload, modal.user)} />;
  if (modal.type === "template") return <ReportTemplateModal template={modal.template} onClose={onClose} onSave={(payload) => props.onSaveTemplate(payload, modal.template)} />;
  if (modal.type === "catalog") return <CatalogItemModal kind={modal.kind} item={modal.item} onClose={onClose} onSave={(payload) => props.onSaveCatalog(modal.kind, payload, modal.item)} />;
  if (modal.type === "checklist") return <ChecklistModal checklist={modal.checklist} onClose={onClose} onSave={(payload) => props.onSaveChecklist(payload, modal.checklist)} />;
  if (modal.type === "signature") return <SignatureModal onClose={onClose} />;
}

function ProjectModal({ title, project, onClose, onSave }: { title: string; project?: Project; onClose: () => void; onSave: (payload: CreateProjectPayload) => Promise<void> }) {
  const [mode, setMode] = useState<"complete" | "simple">("complete");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateProjectPayload>({
    name: project?.name ?? "",
    responsible: project?.responsible ?? "",
    contractor: project?.contractor ?? "",
    contract: project?.contract ?? "",
    address: project?.address ?? "",
    startDate: project?.startDate ?? "",
    expectedEndDate: project?.expectedEndDate ?? "",
    group: project?.group ?? "Todas as obras",
    status: project?.status ?? "in_progress",
    contractType: project?.contractType ?? "contractor",
    taskListEnabled: project?.taskListEnabled ?? false,
    requirePhotos: project?.requirePhotos ?? false
  });

  const update = <K extends keyof CreateProjectPayload>(key: K, value: CreateProjectPayload[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave(form);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a obra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} compact>
      <form className="modal-form" onSubmit={(event) => void submit(event)}>
        {error && <div className="error-banner compact">{error}</div>}
        <div className="radio-row">
          <label><input type="radio" checked={mode === "complete"} onChange={() => setMode("complete")} /> Cadastro completo</label>
          <label><input type="radio" checked={mode === "simple"} onChange={() => setMode("simple")} /> Cadastro simples</label>
        </div>
        <label>Nome *</label>
        <input required placeholder="Ex: Shopping Central" value={form.name} onChange={(event) => update("name", event.target.value)} />
        {mode === "complete" && (
          <div className="form-grid compact-form-grid">
            <Field label="Responsável" value={form.responsible ?? ""} onChange={(value) => update("responsible", value)} placeholder="Ex: Engenheiro" />
            <SelectField label="Tipo de contrato" value={form.contractType} onChange={(value) => update("contractType", value as ContractType)} options={[["contractor", "Contratada"], ["client", "Contratante"], ["hired", "Terceirizada"]]} />
            <Field label="Contratante" value={form.contractor ?? ""} onChange={(value) => update("contractor", value)} placeholder="Ex: Prefeitura" />
            <Field label="Data de início" value={form.startDate ?? ""} onChange={(value) => update("startDate", value)} type="date" />
            <Field label="Fim previsto" value={form.expectedEndDate ?? ""} onChange={(value) => update("expectedEndDate", value)} type="date" />
            <Field label="Grupo" value={form.group} onChange={(value) => update("group", value)} />
            <Field label="Contrato" value={form.contract ?? ""} onChange={(value) => update("contract", value)} placeholder="Número do contrato" />
            <SelectField label="Status" value={form.status} onChange={(value) => update("status", value as ProjectStatus)} options={[["in_progress", "Em andamento"], ["not_started", "Não iniciado"], ["stalled", "Paralisado"], ["completed", "Concluído"]]} />
          </div>
        )}
        {mode === "simple" && (
          <div className="form-grid simple">
            <SelectField label="Status" value={form.status} onChange={(value) => update("status", value as ProjectStatus)} options={[["in_progress", "Em andamento"], ["not_started", "Não iniciado"], ["stalled", "Paralisado"], ["completed", "Concluído"]]} />
            <Field label="Grupo" value={form.group} onChange={(value) => update("group", value)} />
          </div>
        )}
        <label>Endereço</label>
        <input placeholder="Ex: Av. ABC, 100, Centro" value={form.address ?? ""} onChange={(event) => update("address", event.target.value)} />
        <div className="inline-checks">
          <label className="check-line"><input type="checkbox" checked={Boolean(form.taskListEnabled)} onChange={(event) => update("taskListEnabled", event.target.checked)} /> Lista de tarefas</label>
          <label className="check-line"><input type="checkbox" checked={Boolean(form.requirePhotos)} onChange={(event) => update("requirePhotos", event.target.checked)} /> Exigir fotos no RDO</label>
        </div>
        <ModalActions saving={saving} onClose={onClose} />
      </form>
    </Modal>
  );
}

function AddReportModal({ projects, templates, defaultProjectId, onClose, onSave }: { projects: Project[]; templates: ReportTemplate[]; defaultProjectId: string; onClose: () => void; onSave: (payload: { projectId: string; templateId: string; reportDate: string; copyFromLast: boolean }) => Promise<void> }) {
  const [form, setForm] = useState({ projectId: defaultProjectId, templateId: templates[0]?.id ?? "template-rdo", reportDate: new Date().toISOString().slice(0, 10), copyFromLast: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave(form);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível criar o relatório.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal title="Adicionar relatório" onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => void submit(event)}>
        {error && <div className="error-banner compact">{error}</div>}
        <label>Selecione a obra *</label>
        <select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select>
        <label>Modelo *</label>
        <select value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>{templates.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}</select>
        <label>Data do relatório *</label>
        <input required type="date" value={form.reportDate} onChange={(event) => setForm((current) => ({ ...current, reportDate: event.target.value }))} />
        <div className="copy-options">
          <label><input type="checkbox" checked={form.copyFromLast} onChange={(event) => setForm((current) => ({ ...current, copyFromLast: event.target.checked }))} /> Copiar informações do último relatório</label>
          <label><input type="checkbox" disabled title="Será implementado quando houver seleção histórica por data." /> Copiar de uma data específica</label>
        </div>
        <ModalActions saving={saving} onClose={onClose} disabled={!form.projectId || !form.templateId} />
      </form>
    </Modal>
  );
}

function UserModal({ user, onClose, onSave }: { user?: AppUser; onClose: () => void; onSave: (payload: UserPayload) => Promise<void> }) {
  const [form, setForm] = useState<UserPayload>({ name: user?.name ?? "", email: user?.email ?? "", jobTitle: user?.jobTitle ?? "", accessProfile: user?.accessProfile ?? "field_user", status: user?.status ?? "active" });
  return (
    <SimpleFormModal title={user ? "Editar usuário" : "Adicionar usuário"} onClose={onClose} onSave={() => onSave(form)}>
      <Field label="Nome *" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
      <Field label="E-mail de acesso *" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} type="email" />
      <Field label="Cargo" value={form.jobTitle} onChange={(value) => setForm((current) => ({ ...current, jobTitle: value }))} />
      <SelectField label="Perfil de acesso" value={form.accessProfile} onChange={(value) => setForm((current) => ({ ...current, accessProfile: value as AccessProfile }))} options={[["administrator", "Administrador"], ["customized", "Customizado"], ["field_user", "Campo"], ["reviewer_approver", "Revisor/Aprovador"], ["client_read_only", "Cliente leitura"]]} />
      <SelectField label="Status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value as "active" | "inactive" }))} options={[["active", "Ativo"], ["inactive", "Inativo"]]} />
    </SimpleFormModal>
  );
}

function ReportTemplateModal({ template, onClose, onSave }: { template?: ReportTemplate; onClose: () => void; onSave: (payload: ReportTemplatePayload) => Promise<void> }) {
  const [form, setForm] = useState<ReportTemplatePayload>({ name: template?.name ?? "Relatório Diário de Obra (RDO)", status: template?.status ?? "active", type: template?.type ?? "customized", dateType: template?.dateType ?? "daily", enabledItems: template?.enabledItems ?? reportItemOptions.map(([value]) => value), signaturePdfDisplay: template?.signaturePdfDisplay ?? "last_page" });
  const toggleItem = (value: string) => setForm((current) => ({ ...current, enabledItems: current.enabledItems.includes(value) ? current.enabledItems.filter((item) => item !== value) : [...current.enabledItems, value] }));
  return (
    <SimpleFormModal title={template ? "Editar modelo de relatório" : "Adicionar modelo de relatório"} onClose={onClose} onSave={() => onSave(form)} wide>
      <label>Nome do relatório *</label>
      <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
      <div className="radio-stack">
        <span>Tipo de data</span>
        <label><input type="radio" checked={form.dateType === "daily"} onChange={() => setForm((current) => ({ ...current, dateType: "daily" }))} /> Um relatório por dia (dd/mm/aaaa)</label>
        <label><input type="radio" checked={form.dateType === "period"} onChange={() => setForm((current) => ({ ...current, dateType: "period" }))} /> Um relatório por período (dd/mm/aaaa) até (dd/mm/aaaa)</label>
      </div>
      <div>
        <label>Itens do relatório *</label>
        <div className="checkbox-grid">
          {reportItemOptions.map(([value, label]) => <label key={value}><input type="checkbox" checked={form.enabledItems.includes(value)} onChange={() => toggleItem(value)} /> {label}</label>)}
        </div>
      </div>
      <div className="radio-stack">
        <span>Assinatura nos relatórios</span>
        <label><input type="radio" checked={form.signaturePdfDisplay === "all_pages"} onChange={() => setForm((current) => ({ ...current, signaturePdfDisplay: "all_pages" }))} /> Exibir assinatura em todas as páginas do PDF</label>
        <label><input type="radio" checked={form.signaturePdfDisplay === "last_page"} onChange={() => setForm((current) => ({ ...current, signaturePdfDisplay: "last_page" }))} /> Exibir assinatura somente na última página do PDF</label>
      </div>
    </SimpleFormModal>
  );
}

function CatalogItemModal({ kind, item, onClose, onSave }: { kind: CatalogKind; item?: CatalogItem; onClose: () => void; onSave: (payload: CatalogItemPayload) => Promise<void> }) {
  const [form, setForm] = useState<CatalogItemPayload>({ description: item?.description ?? "", group: item?.group ?? (kind === "labor" ? "Mão de Obra Própria" : ""), status: item?.status ?? "active", sourceType: item?.sourceType ?? "customized" });
  return (
    <SimpleFormModal title={`${item ? "Editar" : "Adicionar"} ${catalogKindLabel(kind).toLowerCase()}`} onClose={onClose} onSave={() => onSave(form)}>
      <Field label="Descrição *" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
      {kind === "labor" && <Field label="Grupo" value={form.group ?? ""} onChange={(value) => setForm((current) => ({ ...current, group: value }))} />}
      <SelectField label="Status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value as "active" | "inactive" }))} options={[["active", "Ativo"], ["inactive", "Inativo"]]} />
    </SimpleFormModal>
  );
}

function ChecklistModal({ checklist, onClose, onSave }: { checklist?: ChecklistTemplate; onClose: () => void; onSave: (payload: ChecklistPayload) => Promise<void> }) {
  const [form, setForm] = useState<ChecklistPayload>({ name: checklist?.name ?? "", status: checklist?.status ?? "active", items: checklist?.items ?? [{ id: "item-1", order: 1, itemLabel: "1º Item", question: "", answerType: "checkbox", allowMultipleResponses: false, answers: ["Atende", "Não atende", "Não aplicável"] }] });
  const firstItem = form.items[0];
  const updateItem = (updates: Partial<typeof firstItem>) => setForm((current) => ({ ...current, items: [{ ...current.items[0], ...updates }] }));
  return (
    <SimpleFormModal title={checklist ? "Editar checklist" : "Adicionar checklist"} onClose={onClose} onSave={() => onSave(form)} wide>
      <Field label="Nome *" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
      <div className="checklist-card">
        <strong>1º Item</strong>
        <Field label="Item" value={firstItem.itemLabel} onChange={(value) => updateItem({ itemLabel: value })} />
        <Field label="Pergunta *" value={firstItem.question} onChange={(value) => updateItem({ question: value })} />
        <SelectField label="Tipo de resposta" value={firstItem.answerType} onChange={(value) => updateItem({ answerType: value })} options={[["checkbox", "Checkbox"], ["text", "Texto"], ["number", "Número"], ["single_choice", "Escolha única"], ["multiple_choice", "Múltipla escolha"]]} />
        <label className="check-line"><input type="checkbox" checked={firstItem.allowMultipleResponses} onChange={(event) => updateItem({ allowMultipleResponses: event.target.checked })} /> Permitir múltiplas respostas</label>
        <Field label="Respostas" value={firstItem.answers.join(", ")} onChange={(value) => updateItem({ answers: value.split(",").map((answer) => answer.trim()).filter(Boolean) })} />
      </div>
    </SimpleFormModal>
  );
}

function SignatureModal({ onClose }: { onClose: () => void }) {
  const [signatureMode, setSignatureMode] = useState<"draw" | "image" | null>(null);
  return (
    <Modal title="Minha assinatura" onClose={onClose}>
      <div className="signature-options">
        <button className={signatureMode === "draw" ? "primary-action" : "secondary-action"} onClick={() => setSignatureMode("draw")}>Assinar na tela</button>
        <button className={signatureMode === "image" ? "primary-action" : "secondary-action"} onClick={() => setSignatureMode("image")}>Selecionar imagem</button>
      </div>
      {signatureMode === "draw" && <div className="signature-pad-preview">JOAO VICTOR</div>}
      {signatureMode === "image" && <input type="file" accept="image/*" />}
      <p className="muted-text">A assinatura virtual atual já está vinculada ao usuário e será aplicada nos RDOs aprovados.</p>
      <div className="modal-actions"><button className="save-button" onClick={onClose}>Entendi</button></div>
    </Modal>
  );
}

function SimpleFormModal({ title, children, onClose, onSave, wide }: { title: string; children: ReactNode; onClose: () => void; onSave: () => Promise<void>; wide?: boolean }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <form className="modal-form" onSubmit={(event) => void submit(event)}>
        {error && <div className="error-banner compact">{error}</div>}
        {children}
        <ModalActions saving={saving} onClose={onClose} />
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose, wide, compact }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; compact?: boolean }) {
  return (
    <div className="modal-backdrop">
      <section className={wide ? "modal wide-modal" : compact ? "modal compact-modal" : "modal"}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

function ModalActions({ saving, disabled, onClose }: { saving: boolean; disabled?: boolean; onClose: () => void }) {
  return (
    <div className="modal-actions">
      <button className="secondary-action" type="button" onClick={onClose}>Fechar</button>
      <button className="save-button" type="submit" disabled={saving || disabled}>{saving ? "Salvando..." : "Salvar"}</button>
    </div>
  );
}

function ProfileSettings({ onOpenModal }: { onOpenModal: (modal: ModalState) => void }) {
  const [name, setName] = useState("JOAO VICTOR");
  const [savedAt, setSavedAt] = useState("");
  return (
    <div className="settings-grid">
      <section className="panel form-panel">
        <h2>Informações do usuário</h2>
        <div className="avatar-upload"><ClipboardCheck size={44} /><button className="small-primary" disabled title="Upload de arquivos entra na etapa de anexos."><Camera size={15} />Adicionar foto</button></div>
        <label>Nome *</label><input value={name} onChange={(event) => setName(event.target.value)} />
        <label>E-mail de acesso *</label><input defaultValue="joaovictor.castro@tthome.com.br" disabled />
        <button className="secondary-action" disabled title="Troca de senha depende do módulo de autenticação.">Alterar senha</button>
        <button className="save-button" onClick={() => setSavedAt(new Date().toLocaleTimeString("pt-BR"))}><Save size={17} />Salvar</button>
        {savedAt && <span className="muted-text">Perfil atualizado às {savedAt}.</span>}
      </section>
      <div className="right-column">
        <section className="panel signature-panel">
          <div className="panel-header"><h2>Minha assinatura</h2><button className="primary-action" onClick={() => onOpenModal({ type: "signature" })}><Plus size={17} />Adicionar</button></div>
          <p>Assinatura virtual vinculada ao usuário para aprovar relatórios.</p>
        </section>
        <section className="panel"><h2>Empresas que tenho acesso</h2><p>TT HOME LTDA</p></section>
      </div>
    </div>
  );
}

function UsersSettings({ users, onOpenModal }: { users: AppUser[]; onOpenModal: (modal: ModalState) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [profile, setProfile] = useState("all");
  const visibleUsers = users.filter((user) => matchesQuery([user.name, user.email, user.jobTitle], query) && (status === "all" || user.status === status) && (profile === "all" || user.accessProfile === profile));
  return (
    <section className="page-inner">
      <div className="page-toolbar compact"><h1>Usuários ({visibleUsers.length})</h1><div className="filters"><IconInput icon={Search} placeholder="Buscar" value={query} onChange={setQuery} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option><option value="active">Ativo</option><option value="inactive">Inativo</option></select><select value={profile} onChange={(event) => setProfile(event.target.value)}><option value="all">Todos os perfis</option><option value="administrator">Administrador</option><option value="field_user">Campo</option><option value="reviewer_approver">Revisor/Aprovador</option></select><button className="primary-action" onClick={() => onOpenModal({ type: "user" })}><Plus size={18} />Adicionar</button></div></div>
      <section className="panel table-panel">
        <h2>Usuários de acesso</h2>
        {visibleUsers.map((user) => <div className="user-row" key={user.id}><span className="avatar">{initials(user.name)}</span><strong>{user.name}</strong><span>{user.email}</span><span>{accessProfileLabel(user.accessProfile)}</span><span className={`badge ${user.status === "active" ? "green" : "gray"}`}>{user.status === "active" ? "Ativo" : "Inativo"}</span><button onClick={() => onOpenModal({ type: "user", user })}><Edit3 size={17} /></button></div>)}
      </section>
    </section>
  );
}

function TemplatesSettings({ templates, onOpenModal }: { templates: ReportTemplate[]; onOpenModal: (modal: ModalState) => void }) {
  const [query, setQuery] = useState("");
  const visibleTemplates = templates.filter((template) => matchesQuery([template.name, template.type, template.status], query));
  return (
    <section className="page-inner">
      <div className="page-toolbar compact"><h1>Modelos de relatório ({visibleTemplates.length})</h1><div className="filters"><IconInput icon={Search} placeholder="Buscar modelo" value={query} onChange={setQuery} /><button className="primary-action" onClick={() => onOpenModal({ type: "template" })}><Plus size={18} />Adicionar</button></div></div>
      <section className="panel">
        <div className="notice">Depois de adicionar modelos, habilite o modelo nas obras em que será usado.</div>
        {visibleTemplates.map((template) => <div className="template-row" key={template.id}><span>{template.name}</span><span className={`badge ${template.status === "active" ? "green" : "gray"}`}>{template.status === "active" ? "Ativo" : "Inativo"}</span><span className="badge gray">{template.type === "standard" ? "Padrão" : "Customizado"}</span><button onClick={() => onOpenModal({ type: "template", template })}><Edit3 size={17} /></button></div>)}
      </section>
    </section>
  );
}

function CatalogSettings({ title, kind, icon: Icon, items, onOpenModal }: { title: string; kind: CatalogKind; icon: LucideIcon; items: CatalogItem[]; onOpenModal: (modal: ModalState) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visibleItems = items.filter((item) => matchesQuery([item.description, item.group ?? ""], query) && (status === "all" || item.status === status));
  return (
    <section className="page-inner">
      <div className="page-toolbar compact"><h1>{title} ({visibleItems.length})</h1><div className="filters"><IconInput icon={Search} placeholder="Buscar" value={query} onChange={setQuery} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option><option value="active">Ativo</option><option value="inactive">Inativo</option></select><button className="primary-action" onClick={() => onOpenModal({ type: "catalog", kind })}><Plus size={18} />Adicionar</button></div></div>
      <section className="panel catalog-panel">
        <div className="table-list">
          {visibleItems.map((item) => <div className="table-row" key={item.id}><Icon size={16} /><span>{item.description}</span><span>{item.group ?? ""}</span><button onClick={() => onOpenModal({ type: "catalog", kind, item })}><Edit3 size={16} /></button></div>)}
        </div>
      </section>
    </section>
  );
}

function ChecklistSettings({ checklists, onOpenModal }: { checklists: ChecklistTemplate[]; onOpenModal: (modal: ModalState) => void }) {
  const [query, setQuery] = useState("");
  const visibleChecklists = checklists.filter((checklist) => matchesQuery([checklist.name, checklist.status, checklist.items.map((item) => item.question).join(" ")], query));
  return (
    <section className="page-inner">
      <div className="page-toolbar compact"><h1>Checklist ({visibleChecklists.length})</h1><div className="filters"><IconInput icon={Search} placeholder="Buscar checklist" value={query} onChange={setQuery} /><button className="primary-action" onClick={() => onOpenModal({ type: "checklist" })}><Plus size={18} />Adicionar</button></div></div>
      <section className="panel">
        {visibleChecklists.map((checklist) => <div className="template-row" key={checklist.id}><span>{checklist.name}</span><span className={`badge ${checklist.status === "active" ? "green" : "gray"}`}>{checklist.status === "active" ? "Ativo" : "Inativo"}</span><span>{checklist.items.length} item(ns)</span><button onClick={() => onOpenModal({ type: "checklist", checklist })}><Edit3 size={17} /></button></div>)}
        {visibleChecklists.length === 0 && <EmptyState icon={ListChecks} title="Nenhum checklist encontrado" text="Ajuste a busca ou adicione um novo checklist." />}
      </section>
    </section>
  );
}

function CompanySettings() {
  const [name, setName] = useState("TT HOME LTDA");
  const [requirePhotos, setRequirePhotos] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  return <section className="page-inner"><section className="panel form-panel"><h2>Empresa</h2><label>Nome</label><input value={name} onChange={(event) => setName(event.target.value)} /><label>Idioma padrão</label><input defaultValue="PT-BR" disabled /><label className="check-line"><input type="checkbox" checked={requirePhotos} onChange={(event) => setRequirePhotos(event.target.checked)} /> Exigir fotos por padrão</label><button className="save-button" onClick={() => setSavedAt(new Date().toLocaleTimeString("pt-BR"))}><Save size={17} />Salvar</button>{savedAt && <span className="muted-text">Configuração salva às {savedAt}.</span>}</section></section>;
}

function ProjectGroupsSettings({ projects }: { projects: Project[] }) {
  const groups = Array.from(new Set(projects.map((project) => project.group))).filter(Boolean);
  return <section className="page-inner"><section className="panel"><h2>Grupos de obras ({groups.length})</h2>{groups.map((group) => <div className="table-row" key={group}><Briefcase size={16} /><span>{group}</span><span>{projects.filter((project) => project.group === group).length} obra(s)</span></div>)}</section></section>;
}

function ProjectPredefineSettings({ title, projects, items }: { title: string; projects: Project[]; items: CatalogItem[] }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [selectedIds, setSelectedIds] = useState(() => items.filter((item) => item.status === "active").map((item) => item.id));
  const [savedAt, setSavedAt] = useState("");
  const toggleItem = (itemId: string) => setSelectedIds((current) => (current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]));
  return <section className="page-inner"><section className="panel"><h2>{title}</h2><p className="muted-text">Selecione uma obra e use os cadastros ativos como lista padrão do relatório. A persistência por obra entra na próxima etapa de regras de obra.</p><select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select><div className="parameter-list">{items.slice(0, 12).map((item) => <label key={item.id}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleItem(item.id)} /> {item.description}</label>)}</div><button className="save-button" onClick={() => setSavedAt(new Date().toLocaleTimeString("pt-BR"))}><Save size={17} />Salvar seleção</button>{savedAt && <span className="muted-text">Seleção aplicada localmente às {savedAt}.</span>}</section></section>;
}

function AnalysisPage({ reports }: { reports: Report[] }) {
  return <section className="page wide"><h1>Análise de dados</h1><div className="dashboard-grid"><Metric title="Relatórios aprovados" value={String(reports.filter((report) => report.status === "approved").length)} /><Metric title="Aguardando aprovação" value={String(reports.filter((report) => report.status === "pending_review").length)} /><Metric title="Ocorrências abertas" value={String(reports.filter((report) => report.sections.occurrences.trim()).length)} /><Metric title="Fotos anexadas" value="0" /></div><section className="panel"><h2>Insights da obra</h2><p>A base já separa rascunhos, revisão e aprovados. Os próximos indicadores entram quando produção, fotos e ocorrências forem estruturados por seção.</p></section></section>;
}

function ChatHubPage({ selectedProject }: { selectedProject?: Project }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { type: "inbound", text: "Bom dia, hoje trabalhamos na alvenaria do pavimento 2." },
    { type: "system", text: "Rascunho criado. Faltam mão de obra, equipamentos e ocorrências." },
    { type: "outbound", text: "Quantos profissionais estavam na obra hoje?" }
  ]);
  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { type: "outbound", text }, { type: "system", text: "Atualização recebida e marcada para extração do RDO." }]);
    setDraft("");
  };

  return (
    <section className="page wide">
      <div className="chat-layout">
        <aside className="chat-list"><h1>Chat RDO</h1><button className="chat-thread active"><Bot size={20} />WhatsApp - {selectedProject?.name ?? "Obra"}</button></aside>
        <section className="chat-panel">
          <div className="panel-header"><h2>Concentrador de relatórios</h2><span className="badge blue">PT-BR</span></div>
          <div className="message-stack">{messages.map((message, index) => <div className={`message ${message.type}`} key={`${message.type}-${index}`}>{message.text}</div>)}</div>
          <div className="chat-composer">
            <button title="Gravar áudio" disabled><Mic size={18} /></button>
            <input placeholder="Escreva uma atualização da obra" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} />
            <button title="Anexar arquivo" disabled><Upload size={18} /></button>
            <button className="primary-action" onClick={sendMessage}>Enviar</button>
          </div>
        </section>
      </div>
    </section>
  );
}

function ProjectSidebar({ project, reportsCount, active, onBack, onOverview, onReports, onSearch, onEdit }: { project: Project; reportsCount: number; active: "overview" | "search"; onBack: () => void; onOverview: () => void; onReports: () => void; onSearch: () => void; onEdit: () => void }) {
  return <aside className="project-sidebar"><button className="back-title" onClick={onBack}><ArrowLeft size={18} />{project.name}</button><div className="project-placeholder"><ClipboardCheck size={54} /></div><button className={active === "overview" ? "side-link active" : "side-link"} onClick={onOverview}><BarChart3 size={16} />Visão geral</button><button className="side-link" onClick={onReports}><ClipboardList size={16} />Relatórios <span>{reportsCount}</span></button><button className={active === "search" ? "side-link active" : "side-link"} onClick={onSearch}><Search size={16} />Filtro de busca</button><button className="side-link" onClick={onEdit}><Edit3 size={16} />Editar obra</button></aside>;
}

function ProjectInfo({ project }: { project: Project }) {
  return <div className="project-info-grid"><Info label="Status" value={projectStatusLabel(project.status)} badge /><Info label="Contrato" value={project.contract || "-"} /><Info label="Tempo decorrido" value={`${elapsedDays(project.startDate)} dias`} progress /><Info label="Endereço" value={project.address || "-"} /><Info label="Prazo contratual" value={`${daysBetween(project.startDate, project.expectedEndDate)} dias`} /><Info label="Tempo restante" value={`${daysBetween(new Date().toISOString().slice(0, 10), project.expectedEndDate)} dias`} /><Info label="Responsável" value={project.responsible || "-"} /><Info label="Contratante" value={project.contractor || "-"} /><Info label="Início" value={formatDate(project.startDate)} /><Info label="Fim previsto" value={formatDate(project.expectedEndDate)} /><Info label="Fotos obrigatórias" value={project.requirePhotos ? "Sim" : "Não"} /><Info label="Lista de tarefas" value={project.taskListEnabled ? "Sim" : "Não"} /></div>;
}

function ReportCompactList({ reports, onOpenReport }: { reports: Report[]; onOpenReport: (reportId: string) => void }) {
  return <div className="compact-list">{reports.map((report) => <button className="compact-row" key={report.id} onClick={() => onOpenReport(report.id)}><FileText size={19} /><span>RDO #{report.number} - {formatDate(report.reportDate)}</span><strong className={`badge ${reportStatusClass(report.status)}`}>{reportStatusLabel(report.status)}</strong></button>)}</div>;
}

function ReportList({ reports, onOpenReport }: { reports: Report[]; onOpenReport: (reportId: string) => void }) {
  return <div className="report-list">{reports.map((report) => <button className="report-card-row" key={report.id} onClick={() => onOpenReport(report.id)}><FileText size={22} /><div><strong>RDO #{report.number} - {formatDate(report.reportDate)}</strong><span>Criado por {report.creatorName} em {formatDateTime(report.createdAt)}</span></div><span className={`badge ${reportStatusClass(report.status)}`}>{reportStatusLabel(report.status)}</span></button>)}</div>;
}

function ParameterSummary({ labor, equipment, occurrences, checklists, enabledItems }: { labor: CatalogItem[]; equipment: CatalogItem[]; occurrences: CatalogItem[]; checklists: ChecklistTemplate[]; enabledItems: readonly string[] }) {
  return <div className="parameter-summary"><h3>Parâmetros vinculados</h3><span>Mão de obra: {enabledItems.includes("labor") ? labor.filter((item) => item.status === "active").length : "desativado"}</span><span>Equipamentos: {enabledItems.includes("equipment") ? equipment.filter((item) => item.status === "active").length : "desativado"}</span><span>Ocorrências: {enabledItems.includes("occurrence") ? occurrences.filter((item) => item.status === "active").length : "desativado"}</span><span>Checklists: {enabledItems.includes("checklist") ? checklists.filter((item) => item.status === "active").length : "desativado"}</span></div>;
}

function SettingsButton({ item, activePage, onNavigate, count }: { item: { page: Page; label: string; icon: LucideIcon }; activePage: Page; onNavigate: (page: Page) => void; count?: number }) {
  return <button className={activePage === item.page ? "side-link active" : "side-link"} onClick={() => onNavigate(item.page)}><item.icon size={16} />{item.label}{typeof count === "number" && <span>{count}</span>}</button>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <div><label>{label}</label><input type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return <div><label>{label}</label><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, labelText]) => <option value={optionValue} key={optionValue}>{labelText}</option>)}</select></div>;
}

function IconInput({ icon: Icon, placeholder, value, onChange }: { icon: LucideIcon; placeholder: string; value: string; onChange: (value: string) => void }) {
  return <div className="icon-input"><Icon size={16} /><input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="empty-state"><Icon size={38} /><strong>{title}</strong><span>{text}</span></div>;
}

function Info({ label, value, badge, progress }: { label: string; value: string; badge?: boolean; progress?: boolean }) {
  return <div className="info-item"><span>{label}</span>{progress && <div className="progress-bar"><i /></div>}{badge ? <strong className="badge blue">{value}</strong> : <strong>{value}</strong>}</div>;
}

function Metric({ title, value }: { title: string; value: string }) {
  return <article className="metric-card"><strong>{value}</strong><span>{title}</span></article>;
}

function TimelineItem({ label, value, done }: { label: string; value: string; done: boolean }) {
  return <div className={done ? "timeline-item done" : "timeline-item"}><span>{done ? <CheckCircle2 size={16} /> : <FileText size={16} />}</span><div><strong>{label}</strong><small>{value}</small></div></div>;
}

function matchesQuery(values: Array<string | number | undefined>, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  return values.some((value) => normalize(String(value ?? "")).includes(normalizedQuery));
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function sortReports(a: Report, b: Report) {
  return b.reportDate.localeCompare(a.reportDate) || b.number - a.number;
}

function projectStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = { not_started: "Não iniciado", stalled: "Paralisado", in_progress: "Em andamento", completed: "Concluído" };
  return labels[status];
}

function projectStatusClass(status: ProjectStatus) {
  return status === "completed" ? "green" : status === "stalled" ? "red" : "blue";
}

function reportStatusLabel(status: Report["status"]) {
  const labels: Record<Report["status"], string> = { draft: "Rascunho", pending_review: "Em revisão", approved: "Aprovado", rejected: "Rejeitado", revised: "Revisado", amended: "Retificado" };
  return labels[status];
}

function reportStatusClass(status: Report["status"]) {
  const classes: Record<Report["status"], string> = { draft: "gray", pending_review: "blue", approved: "green", rejected: "red", revised: "orange", amended: "gray" };
  return classes[status];
}

function accessProfileLabel(profile: AccessProfile) {
  const labels: Record<AccessProfile, string> = { administrator: "Administrador", customized: "Customizado", field_user: "Campo", reviewer_approver: "Revisor/Aprovador", client_read_only: "Cliente leitura" };
  return labels[profile];
}

function catalogKindLabel(kind: CatalogKind) {
  return kind === "labor" ? "Mão de obra" : kind === "equipment" ? "Equipamento" : "Tipo de ocorrência";
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function auditEventLabel(eventType: string) {
  const labels: Record<string, string> = { "report.seeded": "Seed inicial", "report.created": "Relatório criado", "report.edited": "Relatório editado", "report.submitted_for_review": "Enviado para revisão", "report.approved": "Relatório aprovado", "report.rejected": "Relatório rejeitado", "pdf.placeholder_created": "PDF reservado" };
  return labels[eventType] ?? eventType;
}

function auditSummary(log: AuditLog) {
  const changedFields = log.metadata.changedFields;
  if (Array.isArray(changedFields) && changedFields.length > 0) return ` / Campos: ${changedFields.join(", ")}`;
  if (typeof log.metadata.status === "string") return ` / Status: ${log.metadata.status}`;
  if (typeof log.metadata.pdfVersionId === "string") return ` / PDF: ${log.metadata.pdfVersionId}`;
  return "";
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) / 86_400_000));
}

function elapsedDays(start: string) {
  return daysBetween(start, new Date().toISOString().slice(0, 10));
}

export default App;
