import type { ConnectorManifest } from "./types";
import { csvManifest } from "./csv/manifest";
import { telegramManifest } from "./telegram/manifest";
import { viberManifest } from "./viber/manifest";
import { emailManifest } from "./email/manifest";
import { facebookManifest } from "./facebook/manifest";

export const BUILTIN_CONNECTORS: ConnectorManifest[] = [
  csvManifest,
  telegramManifest,
  viberManifest,
  facebookManifest,
  emailManifest,
];

export function getConnector(id: string): ConnectorManifest | undefined {
  return BUILTIN_CONNECTORS.find((c) => c.id === id);
}

export function validateCustomManifest(data: unknown): {
  valid: boolean;
  manifest?: ConnectorManifest;
  error?: string;
} {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Manifest must be a JSON object" };
  }

  const obj = data as Partial<ConnectorManifest>;

  if (!obj.id || typeof obj.id !== "string") {
    return { valid: false, error: "Missing or invalid 'id' string" };
  }
  if (!obj.name || typeof obj.name !== "string") {
    return { valid: false, error: "Missing or invalid 'name' string" };
  }
  if (!obj.brand || typeof obj.brand !== "string") {
    return { valid: false, error: "Missing or invalid 'brand' string" };
  }
  if (!obj.version || typeof obj.version !== "string") {
    return { valid: false, error: "Missing or invalid 'version' string" };
  }
  if (!obj.capabilities || !Array.isArray(obj.capabilities)) {
    return { valid: false, error: "Missing or invalid 'capabilities' array" };
  }

  const manifest: ConnectorManifest = {
    id: obj.id.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
    name: obj.name,
    brand: obj.brand,
    version: obj.version,
    channel: obj.channel || "messenger",
    category: obj.category || "channels",
    description: obj.description || "Custom imported connector",
    descriptionRu: obj.descriptionRu || obj.description || "Пользовательский коннектор",
    capabilities: obj.capabilities,
    authType: obj.authType || "none",
    webhookPath: obj.webhookPath,
    configSchema: obj.configSchema || [],
    setupStepsEn: obj.setupStepsEn || ["Imported via custom manifest."],
    setupStepsRu: obj.setupStepsRu || ["Импортирован через пользовательский манифест."],
  };

  return { valid: true, manifest };
}
