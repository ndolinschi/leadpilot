/**
 * LeadPilot scoring (client-side)
 * Coefficients from offline XGBoost → logistic calibration on synthetic B2B CRM.
 * Encoded as JS so Vercel has zero Python runtime.
 */
import type {
  Channel,
  FactorContribution,
  LeadFeatures,
  ScoreResult,
  Seniority,
} from "./types";

const INTERCEPT = -1.85;

const WEIGHTS = {
  demoRequested: 1.42,
  budgetSignal: 1.18,
  emailsOpened: 0.22,
  siteVisits: 0.11,
  openRate: 0.95,
  recency: -0.035,
  companySizeLog: 0.28,
  seniority: { junior: -0.35, mid: 0.05, senior: 0.55, exec: 0.95 } as Record<Seniority, number>,
  source: {
    inbound: 0.72, webinar: 0.48, referral: 0.85, linkedin: 0.25, outbound: -0.15, cold: -0.55,
  } as Record<string, number>,
  industry: {
    SaaS: 0.35, FinTech: 0.28, Healthcare: 0.12, Logistics: 0.05, Retail: -0.08, Manufacturing: -0.12, EdTech: 0.15, Cybersecurity: 0.32, Other: 0,
  } as Record<string, number>,
  countryTier: 0.18,
} as const;

const TIER1 = new Set(["US", "UK", "DE", "NL", "SE", "CA", "AU", "FR", "CH", "SG"]);

function sigmoid(z: number): number {
  if (z > 20) return 1;
  if (z < -20) return 0;
  return 1 / (1 + Math.exp(-z));
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

type Term = { key: string; label: string; value: number };

function buildTerms(f: LeadFeatures): Term[] {
  const opens = clamp(f.emailsOpened, 0, 12);
  const visits = clamp(f.siteVisits, 0, 30);
  const openRate = f.emailsSent > 0 ? clamp(f.emailsOpened / f.emailsSent, 0, 1) : 0;
  const sizeLog = Math.log10(Math.max(f.companySize, 1));
  const sourceW = WEIGHTS.source[f.source] ?? 0;
  const industryW = WEIGHTS.industry[f.industry] ?? 0;
  const seniorW = WEIGHTS.seniority[f.seniority] ?? 0;
  const tier = TIER1.has(f.country) ? 1 : 0;
  return [
    { key: "demoRequested", label: "Demo requested", value: f.demoRequested ? WEIGHTS.demoRequested : 0 },
    { key: "budgetSignal", label: "Budget signal", value: WEIGHTS.budgetSignal * clamp(f.budgetSignal, 0, 1) },
    { key: "emailsOpened", label: "Emails opened", value: WEIGHTS.emailsOpened * opens },
    { key: "siteVisits", label: "Site visits", value: WEIGHTS.siteVisits * visits },
    { key: "openRate", label: "Email open rate", value: WEIGHTS.openRate * openRate },
    { key: "recency", label: "Days since last touch", value: WEIGHTS.recency * clamp(f.lastTouchDays, 0, 90) },
    { key: "companySize", label: "Company size", value: WEIGHTS.companySizeLog * sizeLog },
    { key: "seniority", label: `Seniority (${f.seniority})`, value: seniorW },
    { key: "source", label: `Source (${f.source})`, value: sourceW },
    { key: "industry", label: `Industry (${f.industry})`, value: industryW },
    { key: "country", label: `Market (${f.country})`, value: WEIGHTS.countryTier * tier },
  ];
}

function channelUtilities(f: LeadFeatures): Record<Channel, number> {
  const openRate = f.emailsSent > 0 ? f.emailsOpened / Math.max(f.emailsSent, 1) : 0;
  return {
    email: 0.9 + openRate * 1.4 + (f.emailsOpened > 0 ? 0.5 : -0.2) + (f.source === "inbound" || f.source === "webinar" ? 0.35 : 0),
    call: 0.4 + (f.seniority === "exec" || f.seniority === "senior" ? 0.9 : 0) + (f.demoRequested ? 0.7 : 0) + (f.hasPhone ? 0.45 : -0.8) + (f.budgetSignal > 0.6 ? 0.4 : 0),
    linkedin: 0.55 + (f.hasLinkedin ? 0.7 : -0.9) + (f.source === "linkedin" || f.source === "outbound" ? 0.55 : 0) + (f.seniority === "mid" || f.seniority === "senior" ? 0.25 : 0) + (f.emailsOpened === 0 && f.emailsSent > 0 ? 0.35 : 0),
    messenger: 0.25 + (["MD", "RO", "UA", "PL", "RU"].includes(f.country) ? 0.85 : -0.2) + (f.companySize < 50 ? 0.35 : -0.15) + (f.seniority === "junior" || f.seniority === "mid" ? 0.2 : 0),
  };
}

function softmax(logits: Record<Channel, number>): Record<Channel, number> {
  const keys = Object.keys(logits) as Channel[];
  const max = Math.max(...keys.map((k) => logits[k]));
  const exps = Object.fromEntries(keys.map((k) => [k, Math.exp(logits[k] - max)])) as Record<Channel, number>;
  const sum = keys.reduce((s, k) => s + exps[k], 0);
  return Object.fromEntries(keys.map((k) => [k, exps[k] / sum])) as Record<Channel, number>;
}

export function scoreLead(features: LeadFeatures): ScoreResult {
  const terms = buildTerms(features);
  const logit = INTERCEPT + terms.reduce((s, t) => s + t.value, 0);
  const probability = sigmoid(logit);
  const score = Math.round(probability * 1000) / 10;
  const factors: FactorContribution[] = terms
    .map((t) => ({
      feature: t.key,
      label: t.label,
      contribution: Math.round(t.value * 1000) / 10,
      direction: (t.value >= 0 ? "up" : "down") as "up" | "down",
    }))
    .filter((f) => Math.abs(f.contribution) > 0.5)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const channelProbs = softmax(channelUtilities(features));
  const channel = (Object.entries(channelProbs).sort((a, b) => b[1] - a[1])[0][0] ?? "email") as Channel;
  return { score, probability, channel, channelProbs, factors };
}

export function applyScore<T extends LeadFeatures & { id: string }>(lead: T): T & ScoreResult {
  return { ...lead, ...scoreLead(lead) };
}
