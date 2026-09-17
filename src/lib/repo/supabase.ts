import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Activity,
  Channel,
  ChatMessage,
  Company,
  CompanySettings,
  Deal,
  DealStage,
  DeskRepository,
  Lead,
  LeadFeatures,
  ListLeadsParams,
  ListThreadsParams,
  PluginId,
  PluginInstall,
  PluginInstallStatus,
  Task,
  Thread,
} from "@leadpilot/core";
import { DEFAULT_PLUGINS, mergePlugins, runPluginHooks } from "@leadpilot/core";

type LeadRow = {
  id: string;
  workspace_id: string;
  company_id: string | null;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  score: number | null;
  channel: string | null;
  outcome: string | null;
  message: string | null;
  channel_probs: Record<string, number> | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function featuresFromPayload(payload: Record<string, unknown> | null): LeadFeatures {
  const p = payload || {};
  return {
    industry: String(p.industry ?? "Other"),
    companySize: Number(p.companySize ?? 10),
    source: String(p.source ?? "inbound"),
    country: String(p.country ?? "MD"),
    lastTouchDays: Number(p.lastTouchDays ?? 0),
    emailsOpened: Number(p.emailsOpened ?? 0),
    emailsSent: Number(p.emailsSent ?? 0),
    siteVisits: Number(p.siteVisits ?? 0),
    demoRequested: Boolean(p.demoRequested),
    budgetSignal: Number(p.budgetSignal ?? 0),
    seniority: (p.seniority as LeadFeatures["seniority"]) || "mid",
    hasLinkedin: Boolean(p.hasLinkedin),
    hasPhone: Boolean(p.hasPhone),
  };
}

function leadFromRow(row: LeadRow, companyName?: string): Lead {
  const payload = row.payload || {};
  const features = featuresFromPayload(payload);
  return {
    ...features,
    id: row.id,
    workspaceId: row.workspace_id,
    companyId: row.company_id ?? undefined,
    name: row.name,
    title: row.title || "",
    company: companyName || String(payload.company ?? ""),
    email: row.email || "",
    phone: row.phone ?? undefined,
    linkedin: (payload.linkedin as string) || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    message: row.message ?? undefined,
    outcome: (row.outcome as Lead["outcome"]) ?? null,
    score: row.score ?? undefined,
    probability: typeof payload.probability === "number" ? payload.probability : undefined,
    channel: (row.channel as Channel) || undefined,
    channelProbs: (row.channel_probs as Lead["channelProbs"]) || undefined,
    factors: Array.isArray(payload.factors) ? (payload.factors as Lead["factors"]) : undefined,
    stage: (payload.stage as DealStage) || undefined,
    isDemoSample: Boolean(payload.isDemoSample),
    source: row.source || features.source,
  };
}

function payloadFromLead(lead: Partial<Lead>): Record<string, unknown> {
  return {
    industry: lead.industry,
    companySize: lead.companySize,
    country: lead.country,
    lastTouchDays: lead.lastTouchDays,
    emailsOpened: lead.emailsOpened,
    emailsSent: lead.emailsSent,
    siteVisits: lead.siteVisits,
    demoRequested: lead.demoRequested,
    budgetSignal: lead.budgetSignal,
    seniority: lead.seniority,
    hasLinkedin: lead.hasLinkedin,
    hasPhone: lead.hasPhone,
    linkedin: lead.linkedin,
    company: lead.company,
    probability: lead.probability,
    factors: lead.factors,
    stage: lead.stage,
    isDemoSample: lead.isDemoSample ?? false,
  };
}

/**
 * Supabase-backed desk repository for a signed-in workspace.
 * Uses live tables — no mock rows. Demo sample only if payload.isDemoSample.
 */
export class SupabaseDeskRepository implements DeskRepository {
  readonly backend = "supabase" as const;

  constructor(
    private readonly client: SupabaseClient,
    private readonly workspaceId: string
  ) {}

  async listLeads(params?: ListLeadsParams): Promise<Lead[]> {
    let q = this.client
      .from("leads")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .order("score", { ascending: false, nullsFirst: false });

    if (params?.limit) q = q.limit(params.limit);
    if (params?.offset) q = q.range(params.offset, params.offset + (params.limit ?? 50) - 1);

    const { data, error } = await q;
    if (error) throw error;
    let leads = (data as LeadRow[]).map((r) => leadFromRow(r));
    if (params?.includeDemoSamples === false) {
      leads = leads.filter((l) => !l.isDemoSample);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          l.email.toLowerCase().includes(s) ||
          l.company.toLowerCase().includes(s)
      );
    }
    if (params?.channel) leads = leads.filter((l) => l.channel === params.channel);
    if (params?.minScore != null) {
      leads = leads.filter((l) => (l.score ?? 0) >= params.minScore!);
    }
    return leads;
  }

  async getLead(leadId: string): Promise<Lead | null> {
    const { data, error } = await this.client
      .from("leads")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .eq("id", leadId)
      .maybeSingle();
    if (error) throw error;
    return data ? leadFromRow(data as LeadRow) : null;
  }

  async upsertLead(lead: Partial<Lead> & { name: string }): Promise<Lead> {
    const row = {
      workspace_id: this.workspaceId,
      company_id: lead.companyId ?? null,
      name: lead.name,
      title: lead.title ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      source: lead.source ?? null,
      score: lead.score ?? null,
      channel: lead.channel ?? null,
      outcome: lead.outcome ?? null,
      message: lead.message ?? null,
      channel_probs: lead.channelProbs ?? null,
      payload: payloadFromLead(lead),
      updated_at: new Date().toISOString(),
    };

    if (lead.id) {
      const { data, error } = await this.client
        .from("leads")
        .update(row)
        .eq("id", lead.id)
        .eq("workspace_id", this.workspaceId)
        .select("*")
        .single();
      if (error) throw error;
      return leadFromRow(data as LeadRow);
    }

    const { data, error } = await this.client
      .from("leads")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return leadFromRow(data as LeadRow);
  }

  async deleteLead(leadId: string): Promise<boolean> {
    const { error, count } = await this.client
      .from("leads")
      .delete({ count: "exact" })
      .eq("id", leadId)
      .eq("workspace_id", this.workspaceId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async listCompanies(): Promise<Company[]> {
    const { data, error } = await this.client
      .from("companies")
      .select("*")
      .eq("workspace_id", this.workspaceId);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      name: r.name,
      industry: r.industry || "Other",
      size: 10,
      country: "MD",
      domain: r.domain ?? undefined,
      createdAt: r.created_at,
    }));
  }

  async getCompany(companyId: string): Promise<Company | null> {
    const rows = await this.listCompanies();
    return rows.find((c) => c.id === companyId) ?? null;
  }

  async upsertCompany(company: Partial<Company> & { name: string }): Promise<Company> {
    const row = {
      workspace_id: this.workspaceId,
      name: company.name,
      industry: company.industry ?? null,
      domain: company.domain ?? null,
    };
    if (company.id) {
      const { data, error } = await this.client
        .from("companies")
        .update(row)
        .eq("id", company.id)
        .eq("workspace_id", this.workspaceId)
        .select("*")
        .single();
      if (error) throw error;
      return {
        id: data.id,
        workspaceId: data.workspace_id,
        name: data.name,
        industry: data.industry || "Other",
        size: company.size ?? 10,
        country: company.country ?? "MD",
        domain: data.domain ?? undefined,
        createdAt: data.created_at,
      };
    }
    const { data, error } = await this.client.from("companies").insert(row).select("*").single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      name: data.name,
      industry: data.industry || "Other",
      size: company.size ?? 10,
      country: company.country ?? "MD",
      domain: data.domain ?? undefined,
      createdAt: data.created_at,
    };
  }

  async listThreads(params?: ListThreadsParams): Promise<Thread[]> {
    let q = this.client
      .from("threads")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .order("updated_at", { ascending: false });
    if (params?.channel) q = q.eq("channel", params.channel);
    if (params?.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    if (error) throw error;
    let rows = (data || []).map(
      (r): Thread => ({
        id: r.id,
        workspaceId: r.workspace_id,
        leadId: r.lead_id,
        channel: r.channel as Channel,
        subject: r.subject,
        updatedAt: r.updated_at,
        unread: r.unread ?? 0,
        createdAt: r.created_at,
      })
    );
    if (params?.unreadOnly) rows = rows.filter((t) => t.unread > 0);
    return rows;
  }

  async getThread(threadId: string): Promise<Thread | null> {
    const { data, error } = await this.client
      .from("threads")
      .select("*")
      .eq("id", threadId)
      .eq("workspace_id", this.workspaceId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      leadId: data.lead_id,
      channel: data.channel as Channel,
      subject: data.subject,
      updatedAt: data.updated_at,
      unread: data.unread ?? 0,
      createdAt: data.created_at,
    };
  }

  async listMessages(threadId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .eq("thread_id", threadId)
      .order("at", { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => {
      const meta = (r.meta || {}) as Record<string, unknown>;
      return {
        id: r.id,
        workspaceId: r.workspace_id,
        threadId: r.thread_id,
        direction: r.direction,
        body: r.body,
        at: r.at,
        channel: (meta.channel as Channel) || "email",
        attachment: meta.attachment as ChatMessage["attachment"],
      };
    });
  }

  async sendMessage(
    msg: Omit<ChatMessage, "id" | "at"> & { at?: string }
  ): Promise<ChatMessage> {
    const at = msg.at || new Date().toISOString();
    const { data, error } = await this.client
      .from("messages")
      .insert({
        workspace_id: this.workspaceId,
        thread_id: msg.threadId,
        direction: msg.direction,
        body: msg.body,
        at,
        meta: { channel: msg.channel, attachment: msg.attachment },
      })
      .select("*")
      .single();
    if (error) throw error;
    await this.client
      .from("threads")
      .update({ updated_at: at })
      .eq("id", msg.threadId)
      .eq("workspace_id", this.workspaceId);
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      threadId: data.thread_id,
      direction: data.direction,
      body: data.body,
      at: data.at,
      channel: msg.channel,
      attachment: msg.attachment,
    };
  }

  async listDeals(): Promise<Deal[]> {
    const { data, error } = await this.client
      .from("deals")
      .select("*")
      .eq("workspace_id", this.workspaceId);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      leadId: r.lead_id,
      title: r.title,
      value: Number(r.amount ?? 0),
      stage: r.stage as DealStage,
      updatedAt: r.created_at,
      createdAt: r.created_at,
    }));
  }

  async updateDealStage(dealId: string, stage: DealStage): Promise<Deal> {
    const { data, error } = await this.client
      .from("deals")
      .update({ stage })
      .eq("id", dealId)
      .eq("workspace_id", this.workspaceId)
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      leadId: data.lead_id,
      title: data.title,
      value: Number(data.amount ?? 0),
      stage: data.stage as DealStage,
      updatedAt: new Date().toISOString(),
      createdAt: data.created_at,
    };
  }

  async createDeal(deal: Omit<Deal, "id" | "updatedAt">): Promise<Deal> {
    const { data, error } = await this.client
      .from("deals")
      .insert({
        workspace_id: this.workspaceId,
        lead_id: deal.leadId,
        title: deal.title,
        amount: deal.value,
        stage: deal.stage,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      leadId: data.lead_id,
      title: data.title,
      value: Number(data.amount ?? 0),
      stage: data.stage as DealStage,
      updatedAt: data.created_at,
      createdAt: data.created_at,
    };
  }

  async listTasks(): Promise<Task[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("workspace_id", this.workspaceId);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      leadId: r.lead_id ?? undefined,
      title: r.title,
      due: r.due_at || "",
      done: Boolean(r.done),
      createdAt: r.created_at,
    }));
  }

  async toggleTask(taskId: string, done: boolean): Promise<Task> {
    const { data, error } = await this.client
      .from("tasks")
      .update({ done })
      .eq("id", taskId)
      .eq("workspace_id", this.workspaceId)
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      leadId: data.lead_id ?? undefined,
      title: data.title,
      due: data.due_at || "",
      done: Boolean(data.done),
      createdAt: data.created_at,
    };
  }

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    const { data, error } = await this.client
      .from("tasks")
      .insert({
        workspace_id: this.workspaceId,
        lead_id: task.leadId ?? null,
        title: task.title,
        due_at: task.due || null,
        done: task.done,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      leadId: data.lead_id ?? undefined,
      title: data.title,
      due: data.due_at || "",
      done: Boolean(data.done),
      createdAt: data.created_at,
    };
  }

  async listActivities(leadId?: string): Promise<Activity[]> {
    let q = this.client
      .from("activities")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .order("at", { ascending: false });
    if (leadId) q = q.eq("lead_id", leadId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      leadId: r.lead_id ?? undefined,
      type: r.type,
      title: r.title,
      detail: r.detail ?? undefined,
      at: r.at,
    }));
  }

  async logActivity(
    act: Omit<Activity, "id" | "at"> & { at?: string }
  ): Promise<Activity> {
    const { data, error } = await this.client
      .from("activities")
      .insert({
        workspace_id: this.workspaceId,
        lead_id: act.leadId ?? null,
        type: act.type,
        title: act.title,
        detail: act.detail ?? null,
        at: act.at || new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      leadId: data.lead_id ?? undefined,
      type: data.type,
      title: data.title,
      detail: data.detail ?? undefined,
      at: data.at,
    };
  }

  async getWorkspaceSettings(): Promise<CompanySettings> {
    const installs = await this.listPluginInstalls();
    const plugins = { ...DEFAULT_PLUGINS };
    for (const inst of installs) {
      if (inst.pluginId in plugins) {
        plugins[inst.pluginId as PluginId] = inst.status === "active";
      }
    }
    return {
      companyName: "Workspace",
      voice: "professional",
      language: "en",
      productPitch: "",
      plugins: mergePlugins(plugins),
      apiKeys: [],
      connectors: {},
    };
  }

  async saveWorkspaceSettings(
    settings: Partial<CompanySettings>
  ): Promise<CompanySettings> {
    if (settings.plugins) {
      for (const [pluginId, enabled] of Object.entries(settings.plugins)) {
        await this.setPluginStatus(pluginId, enabled ? "active" : "inactive");
      }
    }
    return this.getWorkspaceSettings();
  }

  async listPluginInstalls(): Promise<PluginInstall[]> {
    const { data, error } = await this.client
      .from("wp_plugins")
      .select("*")
      .eq("workspace_id", this.workspaceId);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      pluginId: r.plugin_slug,
      status: r.status as PluginInstallStatus,
      config: (r.config || {}) as Record<string, unknown>,
      activatedAt: r.activated_at,
      createdAt: r.created_at,
    }));
  }

  async getPluginInstall(pluginId: PluginId | string): Promise<PluginInstall | null> {
    const { data, error } = await this.client
      .from("wp_plugins")
      .select("*")
      .eq("workspace_id", this.workspaceId)
      .eq("plugin_slug", String(pluginId))
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      pluginId: data.plugin_slug,
      status: data.status as PluginInstallStatus,
      config: (data.config || {}) as Record<string, unknown>,
      activatedAt: data.activated_at,
      createdAt: data.created_at,
    };
  }

  async setPluginStatus(
    pluginId: PluginId | string,
    status: PluginInstallStatus,
    config?: Record<string, unknown>
  ): Promise<PluginInstall> {
    const slug = String(pluginId);
    const event =
      status === "active" ? "activate" : status === "inactive" ? "deactivate" : "install";
    await runPluginHooks(event, {
      workspaceId: this.workspaceId,
      pluginId: slug,
      config,
    });

    const existing = await this.getPluginInstall(slug);
    const row = {
      workspace_id: this.workspaceId,
      plugin_slug: slug,
      status,
      config: { ...(existing?.config || {}), ...(config || {}) },
      activated_at: status === "active" ? new Date().toISOString() : null,
    };

    const { data, error } = await this.client
      .from("wp_plugins")
      .upsert(row, { onConflict: "workspace_id,plugin_slug" })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      pluginId: data.plugin_slug,
      status: data.status as PluginInstallStatus,
      config: (data.config || {}) as Record<string, unknown>,
      activatedAt: data.activated_at,
      createdAt: data.created_at,
    };
  }
}
