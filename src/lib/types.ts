export type Channel = "email" | "call" | "linkedin" | "messenger";
export type Outcome = "won" | "lost" | "no_reply" | null;
export type Seniority = "junior" | "mid" | "senior" | "exec";
export type Lang = "en" | "ru";

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

export type Lead = LeadFeatures & {
  id: string;
  name: string;
  title: string;
  company: string;
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
};

export type CompanySettings = {
  companyName: string;
  voice: string;
  language: Lang;
  productPitch: string;
};

export type ScoredLead = Lead &
  Required<Pick<Lead, "score" | "probability" | "channel" | "channelProbs" | "factors">>;
