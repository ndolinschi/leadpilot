import type { ConnectorManifest } from "../../types";

export const emailManifest: ConnectorManifest = {
  id: "email",
  name: "Email & SMTP Gateway",
  brand: "Email SMTP",
  version: "1.1.0",
  channel: "email",
  category: "channels",
  description: "Direct SMTP/IMAP and transactional email inbound sync. Automatically links emails to company accounts and tracks opens.",
  descriptionRu: "Прямая синхронизация по SMTP/IMAP. Автоматически привязывает входящие письма к компаниям и отслеживает открытия.",
  capabilities: ["inbound_leads", "inbound_messages", "outbound_messages"],
  authType: "api_key",
  defaultStatus: "active",
  configSchema: [
    {
      key: "smtpHost",
      label: "SMTP Host",
      type: "text",
      placeholder: "smtp.mailgun.org or smtp.resend.com",
    },
    {
      key: "smtpUser",
      label: "Username / API Key",
      type: "text",
    },
    {
      key: "smtpPass",
      label: "Password / Secret",
      type: "password",
    },
  ],
  setupStepsEn: [
    "Configure your outbound SMTP credentials (Resend, Mailgun, or SendGrid)",
    "Set forward routing for inbound emails to /api/v1/messages",
    "LeadPilot auto-scores reply rates and email opens",
  ],
  setupStepsRu: [
    "Укажите параметры SMTP (Resend, Mailgun или корпоративный сервер)",
    "Настройте пересылку входящих писем на /api/v1/messages",
    "LeadPilot автоматически фиксирует открытия и пересчитывает скоринг",
  ],
};
