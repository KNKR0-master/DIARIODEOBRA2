import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bot,
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
  MessageSquare,
  Mic,
  Plus,
  Printer,
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
import type { AuditLog, CatalogItem, ChecklistTemplate, ContractType, CreateProjectPayload, Project, ProjectStatus, Report, ReportSections, ReportTemplate } from "./api";

type Page = "projects" | "overview" | "reports" | "report-detail" | "analysis" | "chat" | "settings-profile" | "settings-users" | "settings-templates" | "settings-catalogs";

const menuItems = [
  { page: "projects" as Page, label: "Obras", icon: Building2 },
  { page: "reports" as Page, label: "Relatórios", icon: ClipboardList },
  { page: "analysis" as Page, label: "Análise de dados", icon: BarChart3 },
  { page: "settings-profile" as Page, label: "Cadastros", icon: Settings }
];

const settingsItems = [
  { page: "settings-profile" as Page, label: "Meu perfil", icon: User, count: null },
  { page: "settings-users" as Page, label: "Usuários", icon: Users, count: "1" },
  { page: "settings-templates" as Page, label: "Modelos de relatório", icon: ClipboardCheck, count: "1" },
  { page: "settings-catalogs" as Page, label: "Cadastros", icon: ListChecks, count: "4" }
];

const reportFields: Array<{ key: keyof ReportSections; label: string; placeholder: string; rows: number }> = [
  { key: "weather", label: "Condições climáticas", placeholder: "Ex: manhã com tempo aberto, tarde chuvosa.", rows: 3 },
  { key: "labor", label: "Mão de obra", placeholder: "Ex: Pedreiro: 2\nServente: 3", rows: 5 },
  { key: "equipment", label: "Equipamentos", placeholder: "Ex: Betoneira: 1\nCaminhão basculante: 1", rows: 4 },
  { key: "activities", label: "Atividades executadas", placeholder: "Descreva as frentes executadas no dia.", rows: 5 },
  { key: "occurrences", label: "Ocorrências", placeholder: "Registre atrasos, falta de material, acidentes ou impedimentos.", rows: 4 },
  { key: "checklistNotes", label: "Checklist", placeholder: "Resumo das verificações realizadas.", rows: 3 },
  { key: "comments", label: "Comentários", placeholder: "Observações gerais e próximos passos.", rows: 4 }
];

function App() {
  const [page, setPage] = useState<Page>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [labor, setLabor] = useState<CatalogItem[]>([]);
  const [equipment, setEquipment] = useState<CatalogItem[]>([]);
  const [occurrences, setOccurrences] = useState<CatalogItem[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        const [projectsResponse, reportsResponse, templatesResponse, laborResponse, equipmentResponse, occurrenceResponse, checklistResponse] = await Promise.all([
          api.getProjects(),
          api.getReports(),
          api.getReportTemplates(),
          api.getLabor(),
          api.getEquipment(),
          api.getOccurrenceTypes(),
          api.getChecklists()
        ]);

        if (!active) {
          return;
        }

        setProjects(projectsResponse.projects);
        setReports(reportsResponse.reports);
        setTemplates(templatesResponse.reportTemplates);
        setLabor(laborResponse.labor);
        setEquipment(equipmentResponse.equipment);
        setOccurrences(occurrenceResponse.occurrenceTypes);
        setChecklists(checklistResponse.checklists);
        setSelectedProjectId(projectsResponse.projects[0]?.id ?? "");
        setSelectedReportId(reportsResponse.reports[0]?.id ?? "");
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a API.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedReport = reports.find((report) => report.id === selectedReportId);
  const projectReports = useMemo(() => {
    if (!selectedProject) {
      return reports;
    }

    return reports.filter((report) => report.projectId === selectedProject.id);
  }, [reports, selectedProject]);

  const isSettings = page.startsWith("settings");

  const upsertReport = (report: Report) => {
    setReports((current) => [report, ...current.filter((item) => item.id !== report.id)].sort((a, b) => b.reportDate.localeCompare(a.reportDate) || b.number - a.number));
    setSelectedReportId(report.id);
  };

  async function handleCreateProject(payload: CreateProjectPayload) {
    const response = await api.createProject(payload);
    setProjects((current) => [...current, response.project]);
    setSelectedProjectId(response.project.id);
    setPage("overview");
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

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    const firstReport = reports.find((report) => report.projectId === projectId);
    setSelectedReportId(firstReport?.id ?? "");
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
      setShowReportModal(true);
      return;
    }

    setShowProjectModal(true);
  };

  return (
    <div className="app-shell">
      <TopNav activePage={page} onNavigate={setPage} onCreate={handleCreateButton} />
      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <section className="page wide">
            <div className="panel loading-panel">Carregando dados do projeto...</div>
          </section>
        ) : isSettings ? (
          <SettingsLayout activePage={page} onNavigate={setPage} templates={templates} labor={labor} equipment={equipment} occurrences={occurrences} checklists={checklists} />
        ) : page === "overview" && selectedProject ? (
          <ProjectOverview project={selectedProject} reports={projectReports} onBack={() => setPage("projects")} onReports={() => setPage("reports")} onOpenReport={openReport} />
        ) : page === "reports" ? (
          <ReportsPage projects={projects} selectedProjectId={selectedProject?.id ?? ""} reports={projectReports} onSelectProject={setSelectedProjectId} onAddReport={() => setShowReportModal(true)} onOpenReport={openReport} />
        ) : page === "report-detail" && selectedReport ? (
          <ReportDetailPage report={selectedReport} project={projects.find((project) => project.id === selectedReport.projectId)} template={templates.find((template) => template.id === selectedReport.templateId)} onBack={() => setPage("reports")} onSave={handleUpdateReport} onSubmit={handleSubmitReport} onApprove={handleApproveReport} />
        ) : page === "analysis" ? (
          <AnalysisPage reports={reports} />
        ) : page === "chat" ? (
          <ChatHubPage selectedProject={selectedProject} />
        ) : (
          <ProjectsPage projects={projects} reports={reports} onOpenProject={openProject} onAddProject={() => setShowProjectModal(true)} />
        )}
      </main>
      {showProjectModal && (
        <AddProjectModal
          onClose={() => setShowProjectModal(false)}
          onSave={async (payload) => {
            await handleCreateProject(payload);
            setShowProjectModal(false);
          }}
        />
      )}
      {showReportModal && (
        <AddReportModal
          projects={projects}
          templates={templates}
          defaultProjectId={selectedProject?.id ?? ""}
          onClose={() => setShowReportModal(false)}
          onSave={async (payload) => {
            await handleCreateReport(payload);
            setShowReportModal(false);
          }}
        />
      )}
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
  return (
    <section className="page narrow">
      <div className="page-toolbar">
        <h1>Obras ({projects.length})</h1>
        <div className="filters">
          <IconInput icon={Search} placeholder="Pesquisa" />
          <select>
            <option>Todos os projetos</option>
          </select>
          <select>
            <option>Todos os status</option>
          </select>
          <button className="primary-action" onClick={onAddProject}>
            <Plus size={18} />
            Adicionar obra
          </button>
        </div>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
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
    </section>
  );
}

function ProjectOverview({ project, reports, onBack, onReports, onOpenReport }: { project: Project; reports: Report[]; onBack: () => void; onReports: () => void; onOpenReport: (reportId: string) => void }) {
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
      <aside className="project-sidebar">
        <button className="back-title" onClick={onBack}>
          <ArrowLeft size={18} />
          {project.name}
        </button>
        <div className="project-placeholder">
          <ClipboardCheck size={54} />
        </div>
        <button className="side-link active">
          <BarChart3 size={16} />
          Visão geral
        </button>
        <button className="side-link" onClick={onReports}>
          <ClipboardList size={16} />
          Relatórios <span>{reports.length}</span>
        </button>
        <button className="side-link">
          <Search size={16} />
          Filtro de busca
        </button>
        <button className="side-link">
          <Edit3 size={16} />
          Editar projeto
        </button>
      </aside>
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
            {reports.length > 0 ? (
              <div className="compact-list">
                {reports.slice(0, 4).map((report) => (
                  <button className="compact-row" key={report.id} onClick={() => onOpenReport(report.id)}>
                    <FileText size={19} />
                    <span>RDO #{report.number} - {formatDate(report.reportDate)}</span>
                    <strong className={`badge ${reportStatusClass(report.status)}`}>{reportStatusLabel(report.status)}</strong>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyPanel icon={ClipboardList} text="Nenhum relatório encontrado" />
            )}
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
            <h2>Informações do projeto</h2>
            <button className="link-button">Editar</button>
          </div>
          <div className="project-info-grid">
            <Info label="Status" value={projectStatusLabel(project.status)} badge />
            <Info label="Contrato" value={project.contract || "-"} />
            <Info label="Tempo decorrido" value={`${elapsedDays(project.startDate)} dias`} progress />
            <Info label="Endereço" value={project.address || "-"} />
            <Info label="Prazo contratual" value={`${daysBetween(project.startDate, project.expectedEndDate)} dias`} />
            <Info label="Tempo restante" value={`${daysBetween(new Date().toISOString().slice(0, 10), project.expectedEndDate)} dias`} />
            <Info label="Responsável" value={project.responsible || "-"} />
            <Info label="Contratante" value={project.contractor || "-"} />
            <Info label="Início" value={formatDate(project.startDate)} />
            <Info label="Fim previsto" value={formatDate(project.expectedEndDate)} />
          </div>
        </section>
      </section>
    </div>
  );
}

function ReportsPage({ projects, selectedProjectId, reports, onSelectProject, onAddReport, onOpenReport }: { projects: Project[]; selectedProjectId: string; reports: Report[]; onSelectProject: (projectId: string) => void; onAddReport: () => void; onOpenReport: (reportId: string) => void }) {
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
          <IconInput icon={Search} placeholder="Buscar relatório" />
          <select value={selectedProjectId} onChange={(event) => onSelectProject(event.target.value)}>
            {projects.map((project) => (
              <option value={project.id} key={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select>
            <option>Todos os status</option>
            <option>Rascunho</option>
            <option>Em revisão</option>
            <option>Aprovado</option>
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
          <span className="badge gray">{reports.length} registros</span>
        </div>
        <div className="report-list">
          {reports.length > 0 ? (
            reports.map((report) => (
              <button className="report-card-row" key={report.id} onClick={() => onOpenReport(report.id)}>
                <FileText size={22} />
                <div>
                  <strong>RDO #{report.number} - {formatDate(report.reportDate)}</strong>
                  <span>Criado por {report.creatorName} em {formatDateTime(report.createdAt)}</span>
                </div>
                <span className={`badge ${reportStatusClass(report.status)}`}>{reportStatusLabel(report.status)}</span>
              </button>
            ))
          ) : (
            <div className="empty-state">
              <ClipboardList size={38} />
              <strong>Nenhum relatório encontrado</strong>
              <span>Adicione um RDO para iniciar o fluxo de preenchimento e aprovação.</span>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

function ReportDetailPage({ report, project, template, onBack, onSave, onSubmit, onApprove }: { report: Report; project?: Project; template?: ReportTemplate; onBack: () => void; onSave: (reportId: string, sections: Partial<ReportSections>) => Promise<void>; onSubmit: (reportId: string) => Promise<void>; onApprove: (reportId: string) => Promise<void> }) {
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
      .then((response) => {
        if (active) {
          setAuditLogs(response.auditLogs);
        }
      })
      .catch(() => {
        if (active) {
          setAuditLogs([]);
        }
      });

    return () => {
      active = false;
    };
  }, [report]);

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
    setSections((current) => ({
      ...current,
      [key]: value
    }));
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
            {reportFields.map((field) => (
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
            <span>
              <strong>ID do usuário</strong>
              {report.approverUserId ?? "-"}
            </span>
            <span>
              <strong>Assinatura virtual</strong>
              {report.signatureId ?? "-"}
            </span>
            <span>
              <strong>Versão do PDF</strong>
              {report.pdfVersionId ?? "-"}
            </span>
            <span>
              <strong>Hash do relatório</strong>
              {report.hash ? `${report.hash.slice(0, 18)}...` : "-"}
            </span>
          </div>
          <p>O PDF definitivo será gerado depois da aprovação, usando os metadados acima para rastreabilidade.</p>
          <div className="audit-section">
            <h3>Auditoria do relatório</h3>
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => <TimelineItem key={log.id} label={auditEventLabel(log.eventType)} value={`${log.actorName} / ${formatDateTime(log.occurredAt)}${auditSummary(log)}`} done />)
            ) : (
              <span className="muted-text">Nenhum evento registrado.</span>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function AnalysisPage({ reports }: { reports: Report[] }) {
  return (
    <section className="page wide">
      <h1>Análise de dados</h1>
      <div className="dashboard-grid">
        <Metric title="Relatórios aprovados" value={String(reports.filter((report) => report.status === "approved").length)} />
        <Metric title="Aguardando aprovação" value={String(reports.filter((report) => report.status === "pending_review").length)} />
        <Metric title="Ocorrências abertas" value="0" />
        <Metric title="Fotos anexadas" value="0" />
      </div>
      <section className="panel">
        <h2>Insights do projeto</h2>
        <p>A primeira leitura analítica já separa rascunhos, relatórios em revisão e relatórios aprovados. Os próximos indicadores entram quando fotos, ocorrências e produtividade forem persistidos no banco.</p>
      </section>
    </section>
  );
}

function ChatHubPage({ selectedProject }: { selectedProject?: Project }) {
  return (
    <section className="page wide">
      <div className="chat-layout">
        <aside className="chat-list">
          <h1>Chat RDO</h1>
          <button className="chat-thread active">
            <Bot size={20} />
            WhatsApp - {selectedProject?.name ?? "Obra"}
          </button>
        </aside>
        <section className="chat-panel">
          <div className="panel-header">
            <h2>Concentrador de relatórios</h2>
            <span className="badge blue">PT-BR</span>
          </div>
          <div className="message-stack">
            <div className="message inbound">Bom dia, hoje trabalhamos na alvenaria do pavimento 2.</div>
            <div className="message system">Rascunho criado. Faltam mão de obra, equipamentos e ocorrências.</div>
            <div className="message outbound">Quantos profissionais estavam na obra hoje?</div>
          </div>
          <div className="chat-composer">
            <button title="Gravar áudio">
              <Mic size={18} />
            </button>
            <input placeholder="Escreva uma atualização da obra" />
            <button title="Anexar arquivo">
              <Upload size={18} />
            </button>
            <button className="primary-action">Enviar</button>
          </div>
        </section>
      </div>
    </section>
  );
}

function SettingsLayout({ activePage, onNavigate, templates, labor, equipment, occurrences, checklists }: { activePage: Page; onNavigate: (page: Page) => void; templates: ReportTemplate[]; labor: CatalogItem[]; equipment: CatalogItem[]; occurrences: CatalogItem[]; checklists: ChecklistTemplate[] }) {
  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <span className="sidebar-title">Configurações</span>
        {settingsItems.map((item) => (
          <button className={activePage === item.page ? "side-link active" : "side-link"} key={item.page} onClick={() => onNavigate(item.page)}>
            <item.icon size={16} />
            {item.label}
            {item.count && <span>{item.count}</span>}
          </button>
        ))}
        <span className="sidebar-title">Editar projeto</span>
        <button className="side-link">
          <HardHat size={16} />
          Predefinir mão de obra
        </button>
        <button className="side-link">
          <Wrench size={16} />
          Predefinir equipamentos
        </button>
      </aside>
      <section className="settings-content">
        {activePage === "settings-users" ? <UsersSettings /> : activePage === "settings-templates" ? <TemplatesSettings templates={templates} /> : activePage === "settings-catalogs" ? <CatalogSettings labor={labor} equipment={equipment} occurrences={occurrences} checklists={checklists} /> : <ProfileSettings />}
      </section>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="settings-grid">
      <section className="panel form-panel">
        <h2>Informações do usuário</h2>
        <div className="avatar-upload">
          <ClipboardCheck size={44} />
          <button className="small-primary">
            <Camera size={15} />
            Adicionar
          </button>
        </div>
        <label>Nome *</label>
        <input defaultValue="JOAO VICTOR" />
        <label>E-mail de acesso *</label>
        <input defaultValue="joaovictor.castro@tthome.com.br" disabled />
        <button className="secondary-action">Alterar senha</button>
        <button className="save-button">
          <Save size={17} />
          Salvar
        </button>
      </section>
      <div className="right-column">
        <section className="panel signature-panel">
          <div className="panel-header">
            <h2>Minha assinatura</h2>
            <button className="primary-action">
              <Plus size={17} />
              Adicionar
            </button>
          </div>
          <div className="signature-options">
            <button>Assinar na tela</button>
            <button>Selecionar imagem</button>
          </div>
        </section>
        <section className="panel">
          <h2>Empresas que tenho acesso</h2>
          <p>TT HOME LTDA</p>
        </section>
      </div>
    </div>
  );
}

function UsersSettings() {
  return (
    <section className="page-inner">
      <div className="page-toolbar compact">
        <h1>Usuários (1)</h1>
        <div className="filters">
          <IconInput icon={Search} placeholder="Buscar" />
          <select>
            <option>Todos os status</option>
          </select>
          <select>
            <option>Todos os perfis</option>
          </select>
        </div>
      </div>
      <section className="panel table-panel">
        <h2>Administradores (1)</h2>
        <div className="user-row">
          <span className="avatar">JO</span>
          <strong>JOAO VICTOR</strong>
          <span>joaovictor.castro@tthome.com.br</span>
          <span>SOCIO PROPRIETARIO</span>
          <span className="badge green">Ativo</span>
          <button>
            <Edit3 size={17} />
          </button>
          <button>
            <X size={17} />
          </button>
        </div>
      </section>
      <section className="panel empty-strip">
        <h2>Customizados (0)</h2>
      </section>
      <section className="panel empty-strip">
        <h2>Clientes (0)</h2>
      </section>
    </section>
  );
}

function TemplatesSettings({ templates }: { templates: ReportTemplate[] }) {
  const template = templates[0];
  const items = [
    "Condições climáticas",
    "Mão de obra",
    "Equipamento",
    "Atividade",
    "Ocorrência",
    "Checklist",
    "Comentário",
    "Fotos",
    "Vídeo",
    "Anexo",
    "Assinatura"
  ];

  return (
    <section className="page-inner">
      <div className="page-toolbar compact">
        <h1>Modelos de relatório ({templates.length})</h1>
        <button className="primary-action">
          <Plus size={18} />
          Adicionar
        </button>
      </div>
      <section className="panel">
        <div className="notice">Depois de adicionar modelos, habilite o modelo nas obras em que será usado.</div>
        {templates.map((item) => (
          <div className="template-row" key={item.id}>
            <span>{item.name}</span>
            <span className="badge green">Ativo</span>
            <span className="badge gray">{item.type === "standard" ? "Padrão" : "Customizado"}</span>
            <button>
              <Edit3 size={17} />
            </button>
          </div>
        ))}
      </section>
      <section className="panel template-editor">
        <h2>Editar modelo de relatório</h2>
        <label>Nome do relatório *</label>
        <input defaultValue={template?.name ?? "Relatório Diário de Obra (RDO)"} />
        <div className="checkbox-grid">
          {items.map((item) => (
            <label key={item}>
              <input type="checkbox" defaultChecked />
              {item}
            </label>
          ))}
        </div>
        <label>
          <input type="radio" name="signature" defaultChecked />
          Exibir assinatura somente na última página do PDF
        </label>
      </section>
    </section>
  );
}

function CatalogSettings({ labor, equipment, occurrences, checklists }: { labor: CatalogItem[]; equipment: CatalogItem[]; occurrences: CatalogItem[]; checklists: ChecklistTemplate[] }) {
  return (
    <section className="catalog-grid">
      <CatalogPanel title="Mão de obra" icon={HardHat} items={labor} />
      <CatalogPanel title="Equipamentos" icon={Wrench} items={equipment} />
      <CatalogPanel title="Tipos de ocorrência" icon={ShieldCheck} items={occurrences} />
      <section className="panel">
        <div className="panel-header">
          <h2>Checklist ({checklists.length})</h2>
          <button className="primary-action">
            <Plus size={17} />
            Adicionar
          </button>
        </div>
        {checklists.map((checklist) => (
          <div className="checklist-card" key={checklist.id}>
            <strong>{checklist.name}</strong>
            {checklist.items.map((item) => (
              <span key={item.id}>{item.itemLabel}: {item.question}</span>
            ))}
          </div>
        ))}
      </section>
    </section>
  );
}

function AddProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (payload: CreateProjectPayload) => Promise<void> }) {
  const [mode, setMode] = useState<"complete" | "simple">("complete");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    responsible: "",
    contractor: "",
    contract: "",
    address: "",
    startDate: "",
    expectedEndDate: "",
    group: "Todas as obras",
    status: "in_progress" as ProjectStatus,
    contractType: "contractor" as ContractType,
    taskListEnabled: false,
    requirePhotos: false
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave(form);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a obra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Adicionar obra" onClose={onClose}>
      <form className="modal-form" onSubmit={(event) => void submit(event)}>
        {error && <div className="error-banner compact">{error}</div>}
        <div className="radio-row">
          <label>
            <input type="radio" checked={mode === "complete"} onChange={() => setMode("complete")} />
            Cadastro completo
          </label>
          <label>
            <input type="radio" checked={mode === "simple"} onChange={() => setMode("simple")} />
            Cadastro simples
          </label>
        </div>
        <label>Nome *</label>
        <input required placeholder="Ex: Shopping Central" value={form.name} onChange={(event) => update("name", event.target.value)} />
        {mode === "complete" && (
          <div className="form-grid">
            <Field label="Responsável" value={form.responsible} onChange={(value) => update("responsible", value)} placeholder="Ex: Engenheiro" />
            <SelectField label="Tipo de contrato" value={form.contractType} onChange={(value) => update("contractType", value as ContractType)} options={[["contractor", "Contratada"], ["client", "Contratante"], ["hired", "Terceirizada"]]} />
            <Field label="Contratante" value={form.contractor} onChange={(value) => update("contractor", value)} placeholder="Ex: Prefeitura" />
            <Field label="Data de início" value={form.startDate} onChange={(value) => update("startDate", value)} type="date" />
            <Field label="Fim previsto" value={form.expectedEndDate} onChange={(value) => update("expectedEndDate", value)} type="date" />
            <Field label="Grupo" value={form.group} onChange={(value) => update("group", value)} />
            <Field label="Contrato" value={form.contract} onChange={(value) => update("contract", value)} placeholder="Número do contrato" />
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
        <input placeholder="Ex: Av. ABC, 100, Centro" value={form.address} onChange={(event) => update("address", event.target.value)} />
        <label className="check-line">
          <input type="checkbox" checked={form.taskListEnabled} onChange={(event) => update("taskListEnabled", event.target.checked)} />
          Lista de tarefas
        </label>
        <label className="check-line">
          <input type="checkbox" checked={form.requirePhotos} onChange={(event) => update("requirePhotos", event.target.checked)} />
          Exigir fotos no relatório
        </label>
        <div className="modal-actions">
          <button className="secondary-action" type="button" onClick={onClose}>
            Fechar
          </button>
          <button className="save-button" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddReportModal({ projects, templates, defaultProjectId, onClose, onSave }: { projects: Project[]; templates: ReportTemplate[]; defaultProjectId: string; onClose: () => void; onSave: (payload: { projectId: string; templateId: string; reportDate: string; copyFromLast: boolean }) => Promise<void> }) {
  const [form, setForm] = useState({
    projectId: defaultProjectId,
    templateId: templates[0]?.id ?? "template-rdo",
    reportDate: new Date().toISOString().slice(0, 10),
    copyFromLast: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave(form);
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
        <select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
          {projects.map((project) => (
            <option value={project.id} key={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <label>Modelo *</label>
        <select value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>
          {templates.map((template) => (
            <option value={template.id} key={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <label>Data do relatório *</label>
        <input required type="date" value={form.reportDate} onChange={(event) => setForm((current) => ({ ...current, reportDate: event.target.value }))} />
        <div className="copy-options">
          <label>
            <input type="checkbox" checked={form.copyFromLast} onChange={(event) => setForm((current) => ({ ...current, copyFromLast: event.target.checked }))} />
            Copiar informações do último relatório
          </label>
          <label>
            <input type="checkbox" disabled />
            Copiar de uma data específica
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary-action" type="button" onClick={onClose}>
            Fechar
          </button>
          <button className="save-button" type="submit" disabled={saving || !form.projectId || !form.templateId}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => (
          <option value={optionValue} key={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}

function IconInput({ icon: Icon, placeholder }: { icon: LucideIcon; placeholder: string }) {
  return (
    <div className="icon-input">
      <Icon size={16} />
      <input placeholder={placeholder} />
    </div>
  );
}

function EmptyPanel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="empty-state">
      <Icon size={38} />
      <strong>{text}</strong>
      <span>Adicione dados ao relatório para acompanhar a evolução.</span>
    </div>
  );
}

function Info({ label, value, badge, progress }: { label: string; value: string; badge?: boolean; progress?: boolean }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      {progress && <div className="progress-bar"><i /></div>}
      {badge ? <strong className="badge blue">{value}</strong> : <strong>{value}</strong>}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{title}</span>
    </article>
  );
}

function TimelineItem({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className={done ? "timeline-item done" : "timeline-item"}>
      <span>{done ? <CheckCircle2 size={16} /> : <FileText size={16} />}</span>
      <div>
        <strong>{label}</strong>
        <small>{value}</small>
      </div>
    </div>
  );
}

function CatalogPanel({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: CatalogItem[] }) {
  return (
    <section className="panel catalog-panel">
      <div className="panel-header">
        <h2>{title} ({items.length})</h2>
        <div className="icon-actions">
          <button title="Imprimir">
            <Printer size={16} />
          </button>
          <button title="Importar">
            <Upload size={16} />
          </button>
          <button className="primary-action">
            <Plus size={17} />
            Adicionar
          </button>
        </div>
      </div>
      <IconInput icon={Search} placeholder="Buscar" />
      <div className="table-list">
        {items.map((item) => (
          <div className="table-row" key={item.id}>
            <Icon size={16} />
            <span>{item.description}</span>
            <button>
              <Edit3 size={16} />
            </button>
            <button>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function projectStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    not_started: "Não iniciado",
    stalled: "Paralisado",
    in_progress: "Em andamento",
    completed: "Concluído"
  };

  return labels[status];
}

function projectStatusClass(status: ProjectStatus) {
  if (status === "completed") {
    return "green";
  }

  if (status === "stalled") {
    return "red";
  }

  return "blue";
}

function reportStatusLabel(status: Report["status"]) {
  const labels: Record<Report["status"], string> = {
    draft: "Rascunho",
    pending_review: "Em revisão",
    approved: "Aprovado",
    rejected: "Rejeitado",
    revised: "Revisado",
    amended: "Retificado"
  };

  return labels[status];
}

function reportStatusClass(status: Report["status"]) {
  const classes: Record<Report["status"], string> = {
    draft: "gray",
    pending_review: "blue",
    approved: "green",
    rejected: "red",
    revised: "orange",
    amended: "gray"
  };

  return classes[status];
}

function auditEventLabel(eventType: string) {
  const labels: Record<string, string> = {
    "report.seeded": "Seed inicial",
    "report.created": "Relatório criado",
    "report.edited": "Relatório editado",
    "report.submitted_for_review": "Enviado para revisão",
    "report.approved": "Relatório aprovado",
    "report.rejected": "Relatório rejeitado",
    "pdf.placeholder_created": "PDF reservado"
  };

  return labels[eventType] ?? eventType;
}

function auditSummary(log: AuditLog) {
  const changedFields = log.metadata.changedFields;

  if (Array.isArray(changedFields) && changedFields.length > 0) {
    return ` / Campos: ${changedFields.join(", ")}`;
  }

  if (typeof log.metadata.status === "string") {
    return ` / Status: ${log.metadata.status}`;
  }

  if (typeof log.metadata.pdfVersionId === "string") {
    return ` / PDF: ${log.metadata.pdfVersionId}`;
  }

  return "";
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

function daysBetween(start: string, end: string) {
  if (!start || !end) {
    return 0;
  }

  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);

  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
}

function elapsedDays(start: string) {
  return daysBetween(start, new Date().toISOString().slice(0, 10));
}

export default App;
