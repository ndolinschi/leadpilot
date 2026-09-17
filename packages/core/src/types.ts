export type Channel = "email" | "call" | "linkedin" | "messenger";
export type Outcome = "won" | "lost" | "no_reply" | null;
export type Seniority = "junior" | "mid" | "senior" | "exec";
export type Lang = "en" | "ru";
export type DealStage = "new" | "qualified" | "proposal" | "won" | "lost";
export type MessageDirection = "in" | "out" | "system";
export type ActivityType =
  | "note"
  | "message_sent"
  | "message_received"
  | "stage_change"
  | "task"
  | "score"
  | "import"
  | "call";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Membership {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
}

export type LeadFeatures = {
  industry: string;
  companySize: number;
  source: string;
  country: string;
  lastTouchDays: number;
  emailsOpened: number;
  emailsSent: number;
  siteVisits: number;
  demoRequested: boolean;
  budgetSignal: number;
  seniority: Seniority;
  hasLinkedin: boolean;
  hasPhone: boolean;
};

export type FactorContribution = {
  feature: string;
  label: string;
  contribution: number;
  direction: "up" | "down";
};

export type ScoreResult = {
  score: number;
  probability: number;
  channel: Channel;
  channelProbs: Record<Channel, number>;
  factors: FactorContribution[];
};

export type Company = {
  id: string;
  workspaceId?: string;
  name: string;
  industry: string;
  size: number;
  country: string;
  domain?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type Lead = LeadFeatures & {
  id: string;
  workspaceId?: string;
  name: string;
  title: string;
  company: string;
  companyId?: string;
  email: string;
  phone?: string;
  linkedin?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  message?: string;
  outcome?: Outcome;
  score?: number;
  probability?: number;
  channel?: Channel;
  channelProbs?: Record<Channel, number>;
  factors?: FactorContribution[];
  stage?: DealStage;
  isDemoSample?: boolean;
};

export type Thread = {
  id: string;
  workspaceId?: string;
  leadId: string;
  channel: Channel;
  subject: string;
  updatedAt: string;
  unread: number;
  createdAt?: string;
  deletedAt?: string | null;
};

export type ChatMessage = {
  id: string;
  workspaceId?: string;
  threadId: string;
  direction: MessageDirection;
  body: string;
  at: string;
  channel: Channel;
  attachment?: {
    name: string;
    size?: string;
    type?: string;
  };
};

export type Deal = {
  id: string;
  workspaceId?: string;
  leadId: string;
  title: string;
  value: number;
  stage: DealStage;
  updatedAt: string;
  createdAt?: string;
  deletedAt?: string | null;
};

export type Task = {
  id: string;
  workspaceId?: string;
  leadId?: string;
  title: string;
  due: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type Activity = {
  id: string;
  workspaceId?: string;
  leadId?: string;
  type: ActivityType;
  title: string;
  detail?: string;
  at: string;
  createdAt?: string;
};

export type PluginId =
  | "leads"
  | "inbox"
  | "deals"
  | "companies"
  | "tasks"
  | "metrics"
  | "ai-scoring"
  | "import"
  | "workflow"
  | "campaign";

export type PluginInstallStatus = "installed" | "active" | "inactive";

export interface PluginInstall {
  id: string;
  workspaceId: string;
  pluginId: PluginId | string;
  status: PluginInstallStatus;
  config?: Record<string, unknown>;
  activatedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiKeyRecord {
  id: string;
  workspaceId?: string;
  name: string;
  prefix: string;
  hashedKey: string;
  createdAt: string;
  lastUsedAt?: string;
  deletedAt?: string | null;
}

export type ConnectorState = {
  enabled: boolean;
  installed: boolean;
  config?: Record<string, string | boolean>;
};

export interface ConnectorInstall {
  id: string;
  workspaceId: string;
  connectorId: string;
  enabled: boolean;
  installed: boolean;
  config: Record<string, string | boolean>;
  createdAt: string;
  updatedAt: string;
}

export type CompanySettings = {
  companyName: string;
  voice: string;
  language: Lang;
  productPitch: string;
  plugins?: Record<PluginId, boolean>;
  apiKeys?: ApiKeyRecord[];
  connectors?: Record<string, ConnectorState>;
};

export type ScoredLead = Lead &
  Required<Pick<Lead, "score" | "probability" | "channel" | "channelProbs" | "factors">>;

export const DEAL_STAGES: DealStage[] = ["new", "qualified", "proposal", "won", "lost"];
