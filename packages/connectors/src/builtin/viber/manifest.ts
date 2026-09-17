import type { ConnectorManifest } from "../../types";

export const viberManifest: ConnectorManifest = {
  id: "viber",
  name: "Viber Business Messages",
  brand: "Viber",
  version: "1.0.0",
  channel: "messenger",
  category: "channels",
  description: "Official Viber Bot & Public Account integration for the Moldova/Eastern Europe market. Ingests inquiries, triggers instant qualification, and routes chats directly to Desk operators.",
  descriptionRu: "Интеграция с Viber Bot & Public Account для рынка Молдовы и СНГ. Захват диалогов, мгновенная квалификация и передача оператору на Рабочий стол.",
  capabilities: ["inbound_leads", "inbound_messages", "outbound_messages", "webhooks"],
  authType: "webhook_secret",
  webhookPath: "/api/v1/webhooks/viber",
  defaultStatus: "active",
  configSchema: [
    {
      key: "authToken",
      label: "Viber Bot App Key",
      type: "password",
      placeholder: "4d98a...-xxxxxxxx-xxxxxxxx",
      description: "Found in Viber Partner Portal account settings",
      required: true,
    },
    {
      key: "senderName",
      label: "Public Sender Name",
      type: "text",
      placeholder: "LeadPilot Desk Chișinău",
      defaultValue: "LeadPilot Desk",
    },
  ],
  setupStepsEn: [
    "Create a bot or public account on the Viber Partner Portal (partners.viber.com).",
    "Obtain your application token and export it as VIBER_AUTH_TOKEN in your environment.",
    "Set your Viber webhook callback URL to: https://<YOUR_APP_DOMAIN>/api/v1/webhooks/viber",
    "Send a message from your Viber client or use 'Send Test Webhook' below to test end-to-end receipt.",
  ],
  setupStepsRu: [
    "Создайте бота или публичный аккаунт на партнёрском портале Viber (partners.viber.com).",
    "Скопируйте ключ приложения и сохраните в переменной VIBER_AUTH_TOKEN.",
    "Укажите адрес вебхука: https://<ВАШ_ДОМЕН>/api/v1/webhooks/viber",
    "Отправьте тестовое сообщение в Viber или нажмите 'Отправить тестовый вебхук' ниже для проверки.",
  ],
};
