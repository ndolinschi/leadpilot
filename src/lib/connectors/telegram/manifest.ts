import type { ConnectorManifest } from "../types";

export const telegramManifest: ConnectorManifest = {
  id: "telegram",
  name: "Telegram Messenger Connector",
  brand: "Telegram",
  version: "1.0.0",
  channel: "messenger",
  category: "channels",
  description: "2-way client communication via Telegram Bot API. Ingests new chat prospects into operator Queue, scores intent, and streams conversations to unified Inbox.",
  descriptionRu: "Двусторонняя переписка с клиентами через Telegram Bot API. Захват диалогов в Очередь оператора, ML-скоринг интереса и синхронизация в Диалоги.",
  capabilities: ["inbound_leads", "inbound_messages", "outbound_messages", "webhooks"],
  authType: "webhook_secret",
  webhookPath: "/api/v1/webhooks/telegram",
  configSchema: [
    {
      key: "botToken",
      label: "Telegram Bot Token",
      type: "password",
      placeholder: "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ",
      description: "Obtained from @BotFather on Telegram",
      required: true,
    },
    {
      key: "secretToken",
      label: "Webhook Secret Token",
      type: "password",
      placeholder: "Optional security header token (X-Telegram-Bot-Api-Secret-Token)",
      required: false,
    },
    {
      key: "autoReply",
      label: "Send Instant Auto-Reply",
      type: "boolean",
      description: "Automatically acknowledge incoming client messages",
      defaultValue: true,
    }
  ],
  setupStepsEn: [
    "Open Telegram and message @BotFather to create a new bot (/newbot).",
    "Copy the HTTP API token provided by @BotFather and save it in your workspace environment as TELEGRAM_BOT_TOKEN.",
    "Configure your webhook by calling: https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<YOUR_APP_DOMAIN>/api/v1/webhooks/telegram",
    "Send a message to your bot or click 'Send Test Webhook' below to verify that leads and messages land in LeadPilot."
  ],
  setupStepsRu: [
    "Откройте Telegram и напишите @BotFather команду создания бота (/newbot).",
    "Скопируйте полученный токен HTTP API и сохраните его в переменной TELEGRAM_BOT_TOKEN.",
    "Зарегистрируйте вебхук: https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook?url=https://<ВАШ_ДОМЕН>/api/v1/webhooks/telegram",
    "Напишите боту любое сообщение или нажмите 'Отправить тестовый вебхук' ниже для проверки."
  ]
};
