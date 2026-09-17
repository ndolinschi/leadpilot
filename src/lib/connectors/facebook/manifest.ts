import type { ConnectorManifest } from "../types";

export const facebookManifest: ConnectorManifest = {
  id: "facebook",
  name: "Facebook Lead Ads & Messenger",
  brand: "Meta / Facebook",
  version: "1.1.0",
  channel: "messenger",
  category: "social",
  description: "Direct ingestion of Meta Lead Ads forms and Facebook Page Messenger inquiries. Crucial for Moldovan digital agencies and e-commerce stores.",
  descriptionRu: "Прямой захват лид-форм Meta Lead Ads и сообщений Facebook Messenger. Ключевой источник для агентств и e-commerce в Молдове.",
  capabilities: ["inbound_leads", "inbound_messages", "webhooks"],
  authType: "webhook_secret",
  webhookPath: "/api/v1/webhooks/facebook",
  configSchema: [
    {
      key: "pageId",
      label: "Facebook Page ID",
      type: "text",
      placeholder: "1092837465",
      required: true,
    },
    {
      key: "verifyToken",
      label: "Webhook Verify Token",
      type: "password",
      placeholder: "Custom secret token verified with Meta Graph API",
    },
    {
      key: "pageAccessToken",
      label: "Page Access Token",
      type: "password",
      description: "Long-lived system user token with leads_retrieval permission",
    }
  ],
  setupStepsEn: [
    "Navigate to Meta for Developers > Your App > Webhooks > Page / Leadgen.",
    "Set callback URL: https://<YOUR_DOMAIN>/api/v1/webhooks/facebook and enter your Verify Token.",
    "Subscribe to 'leadgen' and 'messages' topics.",
    "Test by submitting a test lead in Meta Lead Ads Testing Tool."
  ],
  setupStepsRu: [
    "Перейдите в Meta for Developers > Приложение > Webhooks > Leadgen.",
    "Укажите URL: https://<ВАШ_ДОМЕН>/api/v1/webhooks/facebook и ваш Verify Token.",
    "Подпишитесь на события 'leadgen' и 'messages'.",
    "Проверьте передачу через инструмент Meta Lead Ads Testing Tool."
  ]
};
