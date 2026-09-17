import type {
  Activity,
  ChatMessage,
  Company,
  CompanySettings,
  Deal,
  DealStage,
  DeskRepository,
  Lead,
  ListLeadsParams,
  ListThreadsParams,
  PluginId,
  PluginInstall,
  PluginInstallStatus,
  Task,
  Thread,
} from "@leadpilot/core";
import {
  DEFAULT_PLUGINS,
  listPlugins,
  mergePlugins,
  runPluginHooks,
} from "@leadpilot/core";

function id(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

/**
 * In-memory / caller-injected Demo sample repository.
 * All seed data must be treated as Demo sample — never as live production.
 */
export class LocalDeskRepository implements DeskRepository {
  readonly backend = "local" as const;

  private leads: Lead[] = [];
  private companies: Company[] = [];
  private threads: Thread[] = [];
  private messages: ChatMessage[] = [];
  private deals: Deal[] = [];
  private tasks: Task[] = [];
  private activities: Activity[] = [];
  private settings: CompanySettings = {
    companyName: "Demo Workspace",
    voice: "professional",
    language: "en",
    productPitch: "LeadPilot Client Operations Desk",
    plugins: { ...DEFAULT_PLUGINS },
    apiKeys: [],
    connectors: {},
  };
  private pluginInstalls: Map<string, PluginInstall> = new Map();

  constructor(seed?: {
    leads?: Lead[];
    companies?: Company[];
    threads?: Thread[];
    messages?: ChatMessage[];
    deals?: Deal[];
    tasks?: Task[];
    activities?: Activity[];
    settings?: Partial<CompanySettings>;
  }) {
    if (seed?.leads) {
      this.leads = seed.leads.map((l) => ({ ...l, isDemoSample: true }));
    }
    if (seed?.companies) this.companies = seed.companies;
    if (seed?.threads) this.threads = seed.threads;
    if (seed?.messages) this.messages = seed.messages;
    if (seed?.deals) this.deals = seed.deals;
    if (seed?.tasks) this.tasks = seed.tasks;
    if (seed?.activities) this.activities = seed.activities;
    if (seed?.settings) this.settings = { ...this.settings, ...seed.settings };

    const plugins = mergePlugins(this.settings.plugins);
    for (const manifest of listPlugins()) {
      const enabled = plugins[manifest.id as PluginId] !== false;
      this.pluginInstalls.set(manifest.id, {
        id: `local-${manifest.id}`,
        workspaceId: "local-demo",
        pluginId: manifest.id,
        status: enabled ? "active" : "inactive",
        config: {},
        activatedAt: enabled ? now() : null,
        createdAt: now(),
      });
    }
  }

  async listLeads(params?: ListLeadsParams): Promise<Lead[]> {
    let rows = [...this.leads];
    if (params?.includeDemoSamples === false) {
      rows = rows.filter((l) => !l.isDemoSample);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
      );
    }
    if (params?.channel) rows = rows.filter((l) => l.channel === params.channel);
    if (params?.minScore != null) {
      rows = rows.filter((l) => (l.score ?? 0) >= params.minScore!);
    }
    if (params?.offset) rows = rows.slice(params.offset);
    if (params?.limit) rows = rows.slice(0, params.limit);
    return rows;
  }

  async getLead(leadId: string): Promise<Lead | null> {
    return this.leads.find((l) => l.id === leadId) ?? null;
  }

  async upsertLead(lead: Partial<Lead> & { name: string }): Promise<Lead> {
    const existing = lead.id ? this.leads.find((l) => l.id === lead.id) : undefined;
    if (existing) {
      Object.assign(existing, lead, { updatedAt: now() });
      return existing;
    }
    const created: Lead = {
      industry: "Other",
      companySize: 10,
      source: "inbound",
      country: "MD",
      lastTouchDays: 0,
      emailsOpened: 0,
      emailsSent: 0,
      siteVisits: 0,
      demoRequested: false,
      budgetSignal: 0,
      seniority: "mid",
      hasLinkedin: false,
      hasPhone: Boolean(lead.phone),
      title: "",
      company: "",
      email: "",
      createdAt: now(),
      isDemoSample: lead.isDemoSample ?? false,
      ...lead,
      id: lead.id || id(),
    };
    this.leads.unshift(created);
    return created;
  }

  async deleteLead(leadId: string): Promise<boolean> {
    const before = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== leadId);
    return this.leads.length < before;
  }

  async listCompanies(): Promise<Company[]> {
    return [...this.companies];
  }

  async getCompany(companyId: string): Promise<Company | null> {
    return this.companies.find((c) => c.id === companyId) ?? null;
  }

  async upsertCompany(company: Partial<Company> & { name: string }): Promise<Company> {
    const existing = company.id
      ? this.companies.find((c) => c.id === company.id)
      : undefined;
    if (existing) {
      Object.assign(existing, company);
      return existing;
    }
    const created: Company = {
      industry: "Other",
      size: 10,
      country: "MD",
      ...company,
      id: company.id || id(),
    };
    this.companies.push(created);
    return created;
  }

  async listThreads(params?: ListThreadsParams): Promise<Thread[]> {
    let rows = [...this.threads];
    if (params?.channel) rows = rows.filter((t) => t.channel === params.channel);
    if (params?.unreadOnly) rows = rows.filter((t) => t.unread > 0);
    if (params?.limit) rows = rows.slice(0, params.limit);
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getThread(threadId: string): Promise<Thread | null> {
    return this.threads.find((t) => t.id === threadId) ?? null;
  }

  async listMessages(threadId: string): Promise<ChatMessage[]> {
    return this.messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.at.localeCompare(b.at));
  }

  async sendMessage(
    msg: Omit<ChatMessage, "id" | "at"> & { at?: string }
  ): Promise<ChatMessage> {
    const created: ChatMessage = {
      ...msg,
      id: id(),
      at: msg.at || now(),
    };
    this.messages.push(created);
    const thread = this.threads.find((t) => t.id === msg.threadId);
    if (thread) thread.updatedAt = created.at;
    return created;
  }

  async listDeals(): Promise<Deal[]> {
    return [...this.deals];
  }

  async updateDealStage(dealId: string, stage: DealStage): Promise<Deal> {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) throw new Error(`Deal ${dealId} not found`);
    deal.stage = stage;
    deal.updatedAt = now();
    return deal;
  }

  async createDeal(deal: Omit<Deal, "id" | "updatedAt">): Promise<Deal> {
    const created: Deal = { ...deal, id: id(), updatedAt: now() };
    this.deals.push(created);
    return created;
  }

  async listTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async toggleTask(taskId: string, done: boolean): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    task.done = done;
    return task;
  }

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    const created: Task = { ...task, id: id() };
    this.tasks.push(created);
    return created;
  }

  async listActivities(leadId?: string): Promise<Activity[]> {
    return this.activities.filter((a) => !leadId || a.leadId === leadId);
  }

  async logActivity(
    act: Omit<Activity, "id" | "at"> & { at?: string }
  ): Promise<Activity> {
    const created: Activity = { ...act, id: id(), at: act.at || now() };
    this.activities.unshift(created);
    return created;
  }

  async getWorkspaceSettings(): Promise<CompanySettings> {
    return { ...this.settings, plugins: { ...mergePlugins(this.settings.plugins) } };
  }

  async saveWorkspaceSettings(
    settings: Partial<CompanySettings>
  ): Promise<CompanySettings> {
    this.settings = {
      ...this.settings,
      ...settings,
      plugins: mergePlugins({ ...this.settings.plugins, ...settings.plugins }),
    };
    return this.getWorkspaceSettings();
  }

  async listPluginInstalls(): Promise<PluginInstall[]> {
    return Array.from(this.pluginInstalls.values());
  }

  async getPluginInstall(pluginId: PluginId | string): Promise<PluginInstall | null> {
    return this.pluginInstalls.get(String(pluginId)) ?? null;
  }

  async setPluginStatus(
    pluginId: PluginId | string,
    status: PluginInstallStatus,
    config?: Record<string, unknown>
  ): Promise<PluginInstall> {
    const key = String(pluginId);
    const existing = this.pluginInstalls.get(key);
    const event =
      status === "active"
        ? ("activate" as const)
        : status === "inactive"
          ? ("deactivate" as const)
          : ("install" as const);

    await runPluginHooks(event, {
      workspaceId: "local-demo",
      pluginId: key,
      config,
    });

    const next: PluginInstall = {
      id: existing?.id || `local-${key}`,
      workspaceId: "local-demo",
      pluginId: key,
      status,
      config: { ...(existing?.config || {}), ...(config || {}) },
      activatedAt: status === "active" ? now() : null,
      createdAt: existing?.createdAt || now(),
      updatedAt: now(),
    };
    this.pluginInstalls.set(key, next);

    const plugins = { ...mergePlugins(this.settings.plugins) };
    if (key in DEFAULT_PLUGINS) {
      plugins[key as PluginId] = status === "active";
      this.settings.plugins = plugins;
    }
    return next;
  }
}
