import type { ConnectorManifest } from "../../types";

export const csvManifest: ConnectorManifest = {
  id: "csv",
  name: "CSV Bulk Ingestion",
  brand: "LeadPilot CSV",
  version: "1.2.0",
  channel: "email",
  category: "import",
  description: "Bulk upload contacts from spreadsheet exports and score every lead instantly with JS ML model.",
  descriptionRu: "Пакетная загрузка контактов из таблиц со мгновенным ML-скорингом каждого лида при импорте.",
  capabilities: ["inbound_leads", "batch_import"],
  authType: "none",
  setupStepsEn: [
    "Export your prospect list from Excel or Google Sheets as .CSV",
    "Ensure headers include name, email, company, and seniority",
    "Drop the file into Channels Ingestion or POST to /api/v1/leads",
  ],
  setupStepsRu: [
    "Экспортируйте список контактов из Excel или Google Таблиц в формате .CSV",
    "Проверьте наличие колонок: name, email, company, seniority",
    "Загрузите файл на странице Каналы или отправьте POST на /api/v1/leads",
  ],
  defaultStatus: "active",
};
