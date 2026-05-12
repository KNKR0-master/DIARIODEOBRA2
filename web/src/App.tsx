import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  Camera,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  Edit3,
  FileText,
  HardHat,
  ListChecks,
  Menu,
  MessageSquare,
  Mic,
  Plus,
  Printer,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  User,
  Users,
  Video,
  Wrench,
  X
} from "lucide-react";
import { equipment, labor, occurrences, project } from "./data";

type Page = "projects" | "overview" | "reports" | "analysis" | "chat" | "settings-profile" | "settings-users" | "settings-templates" | "settings-catalogs";

const menuItems = [
  { page: "projects" as Page, label: "Projetos", icon: Building2 },
  { page: "reports" as Page, label: "Relatorios", icon: ClipboardList },
  { page: "analysis" as Page, label: "Analise de dados", icon: BarChart3 },
  { page: "settings-profile" as Page, label: "Configuracoes", icon: Settings }
];

const settingsItems = [
  { page: "settings-profile" as Page, label: "Meu perfil", icon: User, count: null },
  { page: "settings-users" as Page, label: "Usuarios", icon: Users, count: "1" },
  { page: "settings-templates" as Page, label: "Modelos de relatorio", icon: ClipboardCheck, count: "1" },
  { page: "settings-catalogs" as Page, label: "Cadastros", icon: ListChecks, count: "4" }
];

function App() {
  const [page, setPage] = useState<Page>("projects");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const openProject = () => setPage("overview");
  const isSettings = page.startsWith("settings");

  return (
    <div className="app-shell">
      <TopNav activePage={page} onNavigate={setPage} onCreate={() => setShowProjectModal(true)} />
      <main className="app-main">
        {isSettings ? (
          <SettingsLayout activePage={page} onNavigate={setPage} />
        ) : page === "overview" ? (
          <ProjectOverview onBack={() => setPage("projects")} onReports={() => setPage("reports")} />
        ) : page === "reports" ? (
          <ReportsPage onAddReport={() => setShowReportModal(true)} />
        ) : page === "analysis" ? (
          <AnalysisPage />
        ) : page === "chat" ? (
          <ChatHubPage />
        ) : (
          <ProjectsPage onOpenProject={openProject} onAddProject={() => setShowProjectModal(true)} />
        )}
      </main>
      {showProjectModal && <AddProjectModal onClose={() => setShowProjectModal(false)} />}
      {showReportModal && <AddReportModal onClose={() => setShowReportModal(false)} />}
    </div>
  );
}

function TopNav({ activePage, onNavigate, onCreate }: { activePage: Page; onNavigate: (page: Page) => void; onCreate: () => void }) {
  return (
    <header className="top-nav">
      <div className="brand">TT HOME LTDA</div>
      <nav className="top-menu">
        {menuItems.map((item) => (
          <button className={activePage === item.page ? "nav-item active" : "nav-item"} key={item.page} onClick={() => onNavigate(item.page)}>
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
        <button className={activePage === "chat" ? "nav-item active" : "nav-item"} onClick={() => onNavigate("chat")}>
          <Bot size={16} />
          Chat RDO
        </button>
      </nav>
      <div className="top-actions">
        <button className="language">PT-BR</button>
        <button className="create-button" onClick={onCreate}>
          <Plus size={17} />
          Criar
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

function ProjectsPage({ onOpenProject, onAddProject }: { onOpenProject: () => void; onAddProject: () => void }) {
  return (
    <section className="page narrow">
      <div className="page-toolbar">
        <h1>Projetos (1)</h1>
        <div className="filters">
          <IconInput icon={Search} placeholder="Buscar" />
          <select>
            <option>Todos os projetos</option>
          </select>
          <select>
            <option>Todos os status</option>
          </select>
          <button className="primary-action" onClick={onAddProject}>
            <Plus size={18} />
            Adicionar
          </button>
        </div>
      </div>
      <div className="project-grid">
        <button className="project-card" onClick={onOpenProject}>
          <span className="badge blue">Em andamento</span>
          <div className="project-icon">
            <ClipboardCheck size={52} />
          </div>
          <div className="project-card-footer">
            <span>
              <CalendarDays size={15} /> 0
            </span>
            <strong>{project.name}</strong>
          </div>
        </button>
      </div>
    </section>
  );
}

function ProjectOverview({ onBack, onReports }: { onBack: () => void; onReports: () => void }) {
  const cards = [
    { label: "Relatorios", value: 0, icon: CalendarDays },
    { label: "Atividades", value: 0, icon: ListChecks },
    { label: "Ocorrencias", value: 0, icon: ShieldCheck },
    { label: "Comentarios", value: 0, icon: MessageSquare },
    { label: "Fotos", value: 0, icon: Camera },
    { label: "Videos", value: 0, icon: Video }
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
          Visao geral
        </button>
        <button className="side-link" onClick={onReports}>
          <ClipboardList size={16} />
          Relatorios <span>0</span>
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
          <EmptyPanel title="Relatorios recentes" icon={ClipboardList} text="Nenhum relatorio encontrado" />
          <EmptyPanel title="Fotos recentes" icon={Camera} text="Nenhuma foto encontrada" />
        </div>
        <section className="panel">
          <div className="panel-header">
            <h2>Informacoes do projeto</h2>
            <button className="link-button">Editar</button>
          </div>
          <div className="project-info-grid">
            <Info label="Status" value={project.status} badge />
            <Info label="Contrato" value={project.contract} />
            <Info label="Tempo decorrido" value={project.elapsedTime} progress />
            <Info label="Endereco" value={project.address} />
            <Info label="Prazo contratual" value={project.contractualDeadline} />
            <Info label="Tempo restante" value={project.timeLeft} />
            <Info label="Responsavel" value={project.responsible} />
            <Info label="Contratante" value={project.contractor} />
            <Info label="Inicio" value={project.startDate} />
            <Info label="Fim previsto" value={project.expectedEndDate} />
          </div>
        </section>
      </section>
    </div>
  );
}

function ReportsPage({ onAddReport }: { onAddReport: () => void }) {
  return (
    <section className="page wide">
      <div className="page-toolbar">
        <h1>Relatorios</h1>
        <div className="filters">
          <IconInput icon={Search} placeholder="Buscar relatorio" />
          <select>
            <option>{project.name}</option>
          </select>
          <select>
            <option>Todos os status</option>
          </select>
          <button className="primary-action" onClick={onAddReport}>
            <Plus size={18} />
            Adicionar RDO
          </button>
        </div>
      </div>
      <div className="report-workspace">
        <section className="panel">
          <div className="panel-header">
            <h2>Caixa de entrada de relatorios</h2>
            <span className="badge gray">Rascunho</span>
          </div>
          <div className="report-row">
            <FileText size={22} />
            <div>
              <strong>RDO - {project.startDate}</strong>
              <span>Gerado para revisao antes da aprovacao</span>
            </div>
            <button className="secondary-action">Revisar</button>
          </div>
        </section>
        <section className="panel approval-panel">
          <h2>Aprovacao e assinatura</h2>
          <p>Relatorios aprovados ficam bloqueados e geram PDF com usuario, assinatura virtual, data, hora e identificador.</p>
          <div className="approval-meta">
            <span>ID do usuario</span>
            <span>Assinatura virtual</span>
            <span>Hash do relatorio</span>
            <span>Versao do PDF</span>
          </div>
        </section>
      </div>
    </section>
  );
}

function AnalysisPage() {
  return (
    <section className="page wide">
      <h1>Analise de dados</h1>
      <div className="dashboard-grid">
        <Metric title="Relatorios aprovados" value="0" />
        <Metric title="Pendencias" value="0" />
        <Metric title="Ocorrencias abertas" value="0" />
        <Metric title="Fotos anexadas" value="0" />
      </div>
      <section className="panel">
        <h2>Insights do projeto</h2>
        <p>A primeira versao vai consolidar produtividade, ocorrencias, fotos, atrasos e pendencias a partir dos RDOs aprovados.</p>
      </section>
    </section>
  );
}

function ChatHubPage() {
  return (
    <section className="page wide">
      <div className="chat-layout">
        <aside className="chat-list">
          <h1>Chat RDO</h1>
          <button className="chat-thread active">
            <Bot size={20} />
            WhatsApp - {project.name}
          </button>
        </aside>
        <section className="chat-panel">
          <div className="panel-header">
            <h2>Concentrador de relatorios</h2>
            <span className="badge blue">PT-BR</span>
          </div>
          <div className="message-stack">
            <div className="message inbound">Bom dia, hoje trabalhamos na alvenaria do pavimento 2.</div>
            <div className="message system">Rascunho criado. Faltam mao de obra, equipamentos e ocorrencias.</div>
            <div className="message outbound">Quantos profissionais estavam na obra hoje?</div>
          </div>
          <div className="chat-composer">
            <button title="Gravar audio">
              <Mic size={18} />
            </button>
            <input placeholder="Escreva uma atualizacao da obra" />
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

function SettingsLayout({ activePage, onNavigate }: { activePage: Page; onNavigate: (page: Page) => void }) {
  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <span className="sidebar-title">Configuracoes</span>
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
          Predefinir mao de obra
        </button>
        <button className="side-link">
          <Wrench size={16} />
          Predefinir equipamentos
        </button>
      </aside>
      <section className="settings-content">
        {activePage === "settings-users" ? <UsersSettings /> : activePage === "settings-templates" ? <TemplatesSettings /> : activePage === "settings-catalogs" ? <CatalogSettings /> : <ProfileSettings />}
      </section>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="settings-grid">
      <section className="panel form-panel">
        <h2>Informacoes do usuario</h2>
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
        <h1>Usuarios (1)</h1>
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

function TemplatesSettings() {
  return (
    <section className="page-inner">
      <div className="page-toolbar compact">
        <h1>Modelos de relatorio (1)</h1>
        <button className="primary-action">
          <Plus size={18} />
          Adicionar
        </button>
      </div>
      <section className="panel">
        <div className="notice">Depois de adicionar modelos, habilite o modelo nos projetos em que sera usado.</div>
        <div className="template-row">
          <span>Relatorio Diario de Obra (RDO)</span>
          <span className="badge green">Ativo</span>
          <span className="badge gray">Padrao</span>
          <button>
            <Edit3 size={17} />
          </button>
        </div>
      </section>
      <section className="panel template-editor">
        <h2>Editar modelo de relatorio</h2>
        <label>Nome do relatorio *</label>
        <input defaultValue="Relatorio Diario de Obra (RDO)" />
        <div className="checkbox-grid">
          {["Condicoes climaticas", "Mao de obra", "Equipamento", "Atividade", "Ocorrencia", "Checklist", "Comentario", "Fotos", "Video", "Anexo", "Assinatura"].map((item) => (
            <label key={item}>
              <input type="checkbox" defaultChecked />
              {item}
            </label>
          ))}
        </div>
        <label>
          <input type="radio" name="signature" defaultChecked />
          Exibir assinatura somente na ultima pagina do PDF
        </label>
      </section>
    </section>
  );
}

function CatalogSettings() {
  return (
    <section className="catalog-grid">
      <CatalogPanel title="Mao de obra" icon={HardHat} items={labor} />
      <CatalogPanel title="Equipamentos" icon={Wrench} items={equipment} />
      <CatalogPanel title="Tipos de ocorrencia" icon={ShieldCheck} items={occurrences} />
      <section className="panel">
        <div className="panel-header">
          <h2>Checklist</h2>
          <button className="primary-action">
            <Plus size={17} />
            Adicionar
          </button>
        </div>
        <div className="checklist-builder">
          <label>Nome *</label>
          <input placeholder="Descricao" />
          <div className="checklist-card">
            <strong>1 Item</strong>
            <input placeholder="Item" />
            <input placeholder="Pergunta" />
            <select>
              <option>Checkbox</option>
            </select>
            <div className="answer-row">
              <span>Matches</span>
              <span>Does not match</span>
              <span>Not applicable</span>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

function AddProjectModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"complete" | "simple">("complete");

  return (
    <Modal title="Adicionar projeto" onClose={onClose}>
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
      <input placeholder="Ex: Shopping Central" />
      {mode === "complete" && (
        <div className="form-grid">
          <Field label="Responsavel" placeholder="Ex: Engenheiro Peter" />
          <Field label="Tipo de contrato" select options={["Contratante", "Contratada", "Terceirizada"]} />
          <Field label="Contratante" placeholder="Ex: Prefeitura" />
          <Field label="Data de inicio *" placeholder="dd/mm/aaaa" />
          <Field label="Fim previsto *" placeholder="dd/mm/aaaa" />
          <Field label="Grupo *" select options={["Todas as obras"]} />
          <Field label="Contrato" placeholder="Numero do contrato" />
          <Field label="Status *" select options={["Em andamento", "Nao iniciado", "Paralisado", "Concluido"]} />
        </div>
      )}
      {mode === "simple" && (
        <div className="form-grid simple">
          <Field label="Status *" select options={["Em andamento", "Nao iniciado", "Paralisado", "Concluido"]} />
          <Field label="Grupo *" select options={["Todas as obras"]} />
        </div>
      )}
      <label>Endereco</label>
      <input placeholder="Ex: Av. ABC, 100, Centro" />
      <label className="check-line">
        <input type="checkbox" />
        Lista de tarefas
      </label>
      <div className="modal-actions">
        <button className="secondary-action" onClick={onClose}>
          Fechar
        </button>
        <button className="save-button" onClick={onClose}>
          Salvar
        </button>
      </div>
    </Modal>
  );
}

function AddReportModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Adicionar relatorio" onClose={onClose}>
      <label>Selecione o projeto *</label>
      <select>
        <option>{project.name}</option>
      </select>
      <label>Data do relatorio *</label>
      <input placeholder="dd/mm/aaaa" />
      <div className="copy-options">
        <label>
          <input type="checkbox" defaultChecked />
          Copiar informacoes do ultimo relatorio
        </label>
        <label>
          <input type="checkbox" />
          Copiar de um relatorio especifico
        </label>
      </div>
      <div className="modal-actions">
        <button className="secondary-action" onClick={onClose}>
          Fechar
        </button>
        <button className="save-button" onClick={onClose}>
          Salvar
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
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

function Field({ label, placeholder, select, options = [] }: { label: string; placeholder?: string; select?: boolean; options?: string[] }) {
  return (
    <div>
      <label>{label}</label>
      {select ? (
        <select>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input placeholder={placeholder} />
      )}
    </div>
  );
}

function IconInput({ icon: Icon, placeholder }: { icon: typeof Search; placeholder: string }) {
  return (
    <div className="icon-input">
      <Icon size={16} />
      <input placeholder={placeholder} />
    </div>
  );
}

function EmptyPanel({ title, icon: Icon, text }: { title: string; icon: typeof ClipboardList; text: string }) {
  return (
    <section className="panel empty-panel">
      <h2>{title}</h2>
      <div>
        <Icon size={42} />
        <strong>{text}</strong>
        <span>Adicione dados ao relatorio para acompanhar a evolucao.</span>
      </div>
    </section>
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

function CatalogPanel({ title, icon: Icon, items }: { title: string; icon: typeof HardHat; items: string[] }) {
  return (
    <section className="panel catalog-panel">
      <div className="panel-header">
        <h2>{title}</h2>
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
          <div className="table-row" key={item}>
            <Icon size={16} />
            <span>{item}</span>
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

export default App;

