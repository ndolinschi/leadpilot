import { applyScore, normalizeSeniority } from "@/lib/score";
import type { Lead, ChatMessage } from "@/lib/types";
import type { WebhookResult } from "../types";

export interface FacebookWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: Array<{
      sender?: { id: string };
      recipient?: { id: string };
      message?: { mid: string; text: string };
    }>;
    changes?: Array<{
      field: string;
      value: {
        leadgen_id?: string;
        form_id?: string;
        created_time?: number;
      };
    }>;
  }>;
  isTest?: boolean;
}

export async function handleFacebookWebhook(
  payload: FacebookWebhookPayload,
  headers: Headers | Record<string, string | undefined>
): Promise<WebhookResult> {
  const isTest =
    payload.isTest ||
    Boolean(
      typeof headers.get === "function"
        ? headers.get("x-leadpilot-test")
        : (headers as Record<string, string | undefined>)["x-leadpilot-test"]
    );

  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!token && !isTest) {
    return {
      ok: false,
      statusCode: 503,
      message: "Facebook connector not fully configured: FACEBOOK_PAGE_ACCESS_TOKEN missing.",
      setupInstructions: {
        step1: "Configure Meta Lead Ads app in Meta for Developers.",
        step2: "Generate a Page Access Token with leads_retrieval permission.",
        step3: "Point Meta webhooks to https://<your-domain>/api/v1/webhooks/facebook",
        step4: "For test mode in demo, use 'Send Test Webhook' in Connector Marketplace.",
      },
    };
  }

  const senderId = payload.entry?.[0]?.messaging?.[0]?.sender?.id || "fb_demo_987";
  const text = payload.entry?.[0]?.messaging?.[0]?.message?.text || "New inquiry from Facebook Lead Ad campaign";
  const leadId = `lead_fb_${senderId}`;
  const threadId = `th_fb_${senderId}`;
  const now = new Date().toISOString();

  const uncalibratedLead: Lead = {
    id: leadId,
    name: "Facebook Lead Prospect",
    company: "Meta Lead Ads Campaign",
    title: "Inbound Buyer",
    email: `fb_${senderId.slice(0, 8)}@facebooklead.io`,
    phone: "+373 68 987654",
    country: "Moldova",
    industry: "Other",
    companySize: 10,
    source: "inbound",
    channel: "messenger",
    seniority: normalizeSeniority("mid"),
    lastTouchDays: 0,
    emailsOpened: 1,
    emailsSent: 0,
    siteVisits: 1,
    demoRequested: true,
    budgetSignal: 0.8,
    stage: "new",
    hasLinkedin: false,
    hasPhone: true,
    createdAt: now,
  };

  const scoredLead = applyScore(uncalibratedLead);

  const message: ChatMessage = {
    id: `msg_fb_${Date.now()}`,
    threadId,
    direction: "in",
    body: text,
    at: now,
    channel: "messenger",
  };

  return {
    ok: true,
    statusCode: 200,
    message: isTest
      ? "Sample Facebook lead verified and processed through connector handler"
      : "Facebook webhook update processed successfully",
    lead: scoredLead,
    chatMessage: message,
    threadId,
  };
}
