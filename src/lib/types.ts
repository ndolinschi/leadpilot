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
  name: string;
  industry: string;
  size: number;
  country: string;
  domain?: string;
  website?: string;
};

export type Lead = LeadFeatures & {
  id: string;
  name: string;
  title: string;
  company: string;
  companyId?: string;
  email: string;
  phone?: string;
  linkedin?: string;
  createdAt: string;
  message?: string;
  outcome?: Outcome;
  score?: number;
  probability?: number;
  channel?: Channel;
  channelProbs?: Record<Channel, number>;
  factors?: FactorContribution[];
  stage?: DealStage;
};

export type Thread = {
  id: string;
  leadId: string;
  channel: Channel;
  subject: string;
  updatedAt: string;
  unread: number;
};

export type ChatMessage = {
  id: string;
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
  leadId: string;
  title: string;
  value: number;
  stage: DealStage;
  updatedAt: string;
};

export type Task = {
  id: string;
  leadId?: string;
  title: string;
  due: string;
  done: boolean;
};

export type Activity = {
  id: string;
  leadId?: string;
  type: ActivityType;
  title: string;
  detail?: string;
  at: string;
};

export type PluginId =
  | "leads"
  | "inbox"
  | "deals"
  | "companies"
  | "tasks"
  | "metrics"
  | "ai-scoring"
  | "import";

export type CompanySettings = {
  companyName: string;
  voice: string;
  language: Lang;
  productPitch: string;
  plugins?: Record<PluginId, boolean>;
};

export type ScoredLead = Lead &
  Required<Pick<Lead, "score" | "probability" | "channel" | "channelProbs" | "factors">>;

export const DEAL_STAGES: DealStage[] = ["new", "qualified", "proposal", "won", "lost"];
