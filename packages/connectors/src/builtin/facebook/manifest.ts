import type { ConnectorManifest } from "../../types";

export const facebookManifest: ConnectorManifest = {
  id: "facebook",
  name: "Facebook Lead Ads & Messenger",
  brand: "Meta",
  version: "1.0.0",
  channel: "messenger",
  category: "channels",
  description: "Capture instant inquiries from Facebook Instant Forms and Lead Ads campaigns across Moldova and Romania. Automatically ingests lead forms and opens an Inbox chat thread.",
  descriptionRu: "Захват мгновенных форм Facebook Lead Ads и сообщений страницы Meta. Лид-формы сразу поступают в очередь оператора с открытием диалога в Inbox.",
  capabilities: ["inbound_leads", "inbound_messages", "webhooks"],
  authType: "oauth2",
  webhookPath: "/api/v1/webhooks/facebook",
  defaultStatus: "active",
  configSchema: [
    {
      key: "pageAccessToken",
      label: "Meta Page Access Token",
      type: "password",
      description: "Page token with leads_retrieval and pages_messaging permissions",
      required: true,
    },
    {
      key: "verifyToken",
      label: "Webhook Verification Token",
      type: "text",
      placeholder: "Random string set in Meta App Dashboard",
      required: true,
      defaultValue: "leadpilot_fb_verify_token",
    },
    {
      key: "pageId",
      label: "Facebook Page ID",
      type: "text",
      placeholder: "102938475610293",
      required: false,
    },
  ],
  setupStepsEn: [
    "Navigate to Meta for Developers and open your App Dashboard.",
    "Add Webhooks product and subscribe to 'leadgen' and 'messages' for Page object.",
    "Set Callback URL to https://<YOUR_APP_DOMAIN>/api/v1/webhooks/facebook and enter your Verify Token.",
    "Click 'Send Test Webhook' below to verify that Meta lead ads stream into LeadPilot.",
  ],
  setupStepsRu: [
    "Перейдите в Meta for Developers в панель вашего приложения.",
    "Включите продукт Webhooks и подпишитесь на 'leadgen' и 'messages' для объекта Page.",
    "Укажите URL: https://<ВАШ_ДОМЕН>/api/v1/webhooks/facebook и ваш Verify Token.",
    "Нажмите 'Отправить тестовый вебхук' ниже для проверки интеграции лид-форм.",
  ],
};
