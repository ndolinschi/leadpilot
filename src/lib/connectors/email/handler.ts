import { applyScore, normalizeSeniority } from "@/lib/score";
import type { Lead, ChatMessage } from "@/lib/types";
import type { WebhookResult } from "../types";

export interface EmailInboundPayload {
  fromEmail: string;
  fromName?: string;
  subject: string;
  body: string;
  company?: string;
}

export async function handleEmailInbound(
  payload: EmailInboundPayload
): Promise<WebhookResult> {
  const leadId = `lead_em_${payload.fromEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const threadId = `th_em_${payload.fromEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const now = new Date().toISOString();

  const uncalibratedLead: Lead = {
    id: leadId,
    name: payload.fromName || payload.fromEmail.split("@")[0],
    company: payload.company || payload.fromEmail.split("@")[1] || "Email Inbound",
    title: "Prospect",
    email: payload.fromEmail,
    country: "Moldova",
    industry: "SaaS",
    companySize: 20,
    source: "inbound",
    channel: "email",
    seniority: normalizeSeniority("Manager"),
    lastTouchDays: 0,
    emailsOpened: 1,
    emailsSent: 1,
    siteVisits: 2,
    demoRequested: false,
    budgetSignal: 0.65,
    stage: "new",
    hasLinkedin: false,
    hasPhone: false,
    createdAt: now,
  };

  const scoredLead = applyScore(uncalibratedLead);

  const message: ChatMessage = {
    id: `msg_em_${Date.now()}`,
    threadId,
    direction: "in",
    body: payload.body,
    at: now,
    channel: "email",
  };

  return {
    ok: true,
    statusCode: 200,
    message: "Inbound email processed and lead scored",
    lead: scoredLead,
    chatMessage: message,
    threadId,
  };
}
