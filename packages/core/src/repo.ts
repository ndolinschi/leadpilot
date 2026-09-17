import type {
  Activity,
  Channel,
  ChatMessage,
  Company,
  CompanySettings,
  Deal,
  DealStage,
  Lead,
  PluginId,
  PluginInstall,
  PluginInstallStatus,
  Task,
  Thread,
} from "./types";

export interface ListLeadsParams {
  limit?: number;
  offset?: number;
  search?: string;
  stage?: DealStage;
  channel?: Channel;
  minScore?: number;
  /** When false, exclude Demo sample rows */
  includeDemoSamples?: boolean;
}

export interface ListThreadsParams {
  channel?: Channel;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * DeskRepository: storage backend contract.
 * Local = labeled Demo sample; Supabase = signed-in workspace.
 */
export interface DeskRepository {
  readonly backend: "local" | "supabase";

  listLeads(params?: ListLeadsParams): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  upsertLead(lead: Partial<Lead> & { name: string }): Promise<Lead>;
  deleteLead(id: string): Promise<boolean>;

  listCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | null>;
  upsertCompany(company: Partial<Company> & { name: string }): Promise<Company>;

  listThreads(params?: ListThreadsParams): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | null>;
  listMessages(threadId: string): Promise<ChatMessage[]>;
  sendMessage(msg: Omit<ChatMessage, "id" | "at"> & { at?: string }): Promise<ChatMessage>;

  listDeals(): Promise<Deal[]>;
  updateDealStage(id: string, stage: DealStage): Promise<Deal>;
  createDeal(deal: Omit<Deal, "id" | "updatedAt">): Promise<Deal>;

  listTasks(): Promise<Task[]>;
  toggleTask(id: string, done: boolean): Promise<Task>;
  createTask(task: Omit<Task, "id">): Promise<Task>;

  listActivities(leadId?: string): Promise<Activity[]>;
  logActivity(act: Omit<Activity, "id" | "at"> & { at?: string }): Promise<Activity>;

  getWorkspaceSettings(): Promise<CompanySettings>;
  saveWorkspaceSettings(settings: Partial<CompanySettings>): Promise<CompanySettings>;

  /** WordPress-style plugin installs */
  listPluginInstalls(): Promise<PluginInstall[]>;
  getPluginInstall(pluginId: PluginId | string): Promise<PluginInstall | null>;
  setPluginStatus(
    pluginId: PluginId | string,
    status: PluginInstallStatus,
    config?: Record<string, unknown>
  ): Promise<PluginInstall>;
}
