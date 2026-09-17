import type { ChatMessage, Lead } from "@leadpilot/core";
import { applyScore, normalizeSeniority } from "@leadpilot/scoring";
import type { WebhookResult } from "../../types";

export interface EmailInboundPayload {
  fromEmail: string;
  fromName?: string;
  subject: string;
  body: string;
  company?: string;
  isTest?: boolean;
}

export async function handleEmailInbound(
  payload: EmailInboundPayload
): Promise<WebhookResult> {
  const isTest = Boolean(payload.isTest);
  const leadId = `lead_em_${payload.fromEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const threadId = `th_em_${payload.fromEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const now = new Date().toISOString();

  const uncalibratedLead: Lead = {
    id: leadId,
    name: isTest
      ? `Demo Sample: ${payload.fromName || payload.fromEmail.split("@")[0]}`
      : payload.fromName || payload.fromEmail.split("@")[0],
    company: isTest
      ? "Demo Sample Client"
      : payload.company || payload.fromEmail.split("@")[1] || "Email Inbound",
    title: isTest ? "Demo Prospect" : "Prospect",
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
    isDemoSample: isTest,
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
    message: isTest
      ? "Demo Sample inbound email processed and lead scored"
      : "Inbound email processed and lead scored",
    lead: scoredLead,
    chatMessage: message,
    threadId,
  };
}
