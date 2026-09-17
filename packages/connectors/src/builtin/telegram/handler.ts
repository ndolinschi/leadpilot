import type { ChatMessage, Lead } from "@leadpilot/core";
import { applyScore, normalizeSeniority } from "@leadpilot/scoring";
import type { WebhookResult } from "../../types";

export interface TelegramWebhookPayload {
  update_id?: number;
  isTest?: boolean;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot?: boolean;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      type?: string;
    };
    date?: number;
    text?: string;
  };
}

export async function handleTelegramWebhook(
  payload: TelegramWebhookPayload,
  headers: Headers | Record<string, string | undefined>
): Promise<WebhookResult> {
  const isTest =
    payload.isTest ||
    Boolean(
      typeof headers.get === "function"
        ? headers.get("x-leadpilot-test")
        : (headers as Record<string, string | undefined>)["x-leadpilot-test"]
    );

  const configuredToken = process.env.TELEGRAM_BOT_TOKEN;
  const secretHeader =
    typeof headers.get === "function"
      ? headers.get("x-telegram-bot-api-secret-token")
      : (headers as Record<string, string | undefined>)["x-telegram-bot-api-secret-token"];

  // If running in live mode (not a test invocation) and neither bot token nor secret header is configured
  if (!configuredToken && !secretHeader && !isTest) {
    return {
      ok: false,
      statusCode: 503,
      message: "Telegram connector not fully configured: TELEGRAM_BOT_TOKEN is missing.",
      setupInstructions: {
        step1: "Create a bot on Telegram via @BotFather and retrieve your API token.",
        step2: "Set TELEGRAM_BOT_TOKEN in your deployment environment variables.",
        step3: "Point your Telegram webhook to https://<your-domain>/api/v1/webhooks/telegram",
        step4: "For testing in the desk, use the 'Send Test Webhook' action in the Connector Marketplace.",
      },
    };
  }

  const rawMsg = payload.message;
  if (!rawMsg) {
    return {
      ok: false,
      statusCode: 400,
      message: "Invalid Telegram payload: missing 'message' object.",
    };
  }

  const sender = rawMsg.from || rawMsg.chat || { id: 99999, first_name: "Demo Sample", username: "demo_sample" };
  const senderName = isTest
    ? `Demo Sample: ${[sender.first_name, (sender as { last_name?: string }).last_name].filter(Boolean).join(" ") || "Telegram User"}`
    : [sender.first_name, (sender as { last_name?: string }).last_name].filter(Boolean).join(" ") || sender.username || `User ${sender.id}`;
  const text = rawMsg.text || "Hello, I would like to learn more about your services in Chișinău.";

  const leadId = `lead_tg_${sender.id}`;
  const threadId = `th_tg_${sender.id}`;
  const now = new Date().toISOString();

  // Create lead draft
  const uncalibratedLead: Lead = {
    id: leadId,
    name: senderName,
    company: sender.username ? `@${sender.username}` : (isTest ? "Demo Sample Account" : "Telegram Direct Inquiry"),
    title: isTest ? "Demo Sample Client" : "Client Contact",
    email: sender.username ? `${sender.username}@telegram.org` : `tg_${sender.id}@leadpilot.io`,
    phone: "+373 69 000000",
    country: "Moldova",
    industry: "Retail",
    companySize: 15,
    source: "inbound",
    channel: "messenger",
    seniority: normalizeSeniority("Director"),
    lastTouchDays: 0,
    emailsOpened: 1,
    emailsSent: 1,
    siteVisits: 3,
    demoRequested: true,
    budgetSignal: 0.85,
    stage: "new",
    hasLinkedin: false,
    hasPhone: true,
    createdAt: now,
    isDemoSample: isTest,
  };

  const scoredLead = applyScore(uncalibratedLead);

  const inboundMessage: ChatMessage = {
    id: `msg_tg_${rawMsg.message_id || Date.now()}`,
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
      ? "Demo Sample Telegram webhook verified and processed through connector handler"
      : "Telegram inbound message processed successfully",
    lead: scoredLead,
    chatMessage: inboundMessage,
    threadId,
    details: {
      telegramUpdateId: payload.update_id,
      chatId: sender.id,
      username: sender.username,
      mode: isTest ? "demo-sample" : "production-webhook",
    },
  };
}
