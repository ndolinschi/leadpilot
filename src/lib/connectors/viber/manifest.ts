import type { ConnectorManifest } from "../types";

export const viberManifest: ConnectorManifest = {
  id: "viber",
  name: "Viber Business Bot",
  brand: "Viber",
  version: "1.0.0",
  channel: "messenger",
  category: "channels",
  description: "Primary customer messaging channel for Moldova and Eastern Europe. Ingests clinic appointments, banking requests, and e-commerce inquiries into a single prioritized queue.",
  descriptionRu: "Главный канал клиентской связи в Молдове. Автоматический захват обращений в клиники, банки и интернет-магазины в единую приоритизированную очередь.",
  capabilities: ["inbound_leads", "inbound_messages", "outbound_messages", "webhooks"],
  authType: "webhook_secret",
  webhookPath: "/api/v1/webhooks/viber",
  configSchema: [
    {
      key: "authToken",
      label: "Viber Bot Authentication Token",
      type: "password",
      placeholder: "4d76a...-1234abcd...",
      description: "Available from the Viber Partners / Admin Portal",
      required: true,
    },
    {
      key: "senderName",
      label: "Bot Display Name",
      type: "text",
      placeholder: "LeadPilot Support Desk",
      defaultValue: "LeadPilot Desk",
    },
    {
      key: "webhookUrl",
      label: "Webhook Destination",
      type: "text",
      placeholder: "https://<your-domain>/api/v1/webhooks/viber",
      description: "Callback endpoint registered with Viber",
    }
  ],
  setupStepsEn: [
    "Create a Viber Bot at partners.viber.com and get your 24-character Application Key.",
    "Save the key in your environment as VIBER_AUTH_TOKEN.",
    "Register your webhook with Viber API: curl -X POST https://chatapi.viber.com/pa/set_webhook -H 'X-Viber-Auth-Token: <TOKEN>' -d '{\"url\":\"https://<YOUR_DOMAIN>/api/v1/webhooks/viber\"}'",
    "Test by messaging your Viber bot or pressing 'Send Test Webhook' below."
  ],
  setupStepsRu: [
    "Создайте бота на partners.viber.com и получите 24-значный ключ авторизации.",
    "Укажите ключ в переменной окружения VIBER_AUTH_TOKEN.",
    "Зарегистрируйте вебхук через Viber API: curl -X POST https://chatapi.viber.com/pa/set_webhook -H 'X-Viber-Auth-Token: <TOKEN>' -d '{\"url\":\"https://<ВАШ_ДОМЕН>/api/v1/webhooks/viber\"}'",
    "Отправьте сообщение боту или нажмите 'Отправить тестовый вебхук' ниже."
  ]
};
