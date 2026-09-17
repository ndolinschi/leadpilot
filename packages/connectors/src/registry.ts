import type { ConnectorManifest } from "./types";
import { csvManifest } from "./builtin/csv/manifest";
import { telegramManifest } from "./builtin/telegram/manifest";
import { viberManifest } from "./builtin/viber/manifest";
import { facebookManifest } from "./builtin/facebook/manifest";
import { emailManifest } from "./builtin/email/manifest";
import { runConnectorHook } from "./hooks";

export const BUILTIN_CONNECTORS: ConnectorManifest[] = [
  csvManifest,
  telegramManifest,
  viberManifest,
  facebookManifest,
  emailManifest,
];

const connectorRegistry: Map<string, ConnectorManifest> = new Map(
  BUILTIN_CONNECTORS.map((c) => [c.id, c])
);

export function listConnectors(): ConnectorManifest[] {
  return Array.from(connectorRegistry.values());
}

export function getConnector(id: string): ConnectorManifest | undefined {
  return connectorRegistry.get(id);
}

export function registerConnector(manifest: ConnectorManifest): void {
  connectorRegistry.set(manifest.id, manifest);
}

export async function activateConnector(
  workspaceId: string,
  connectorId: string,
  config?: Record<string, string | boolean>
): Promise<boolean> {
  const connector = getConnector(connectorId);
  if (!connector) return false;

  await runConnectorHook("before_activate", { workspaceId, connectorId, config });
  // Hook execution succeeded
  await runConnectorHook("after_activate", { workspaceId, connectorId, config });
  return true;
}

export async function deactivateConnector(
  workspaceId: string,
  connectorId: string
): Promise<boolean> {
  const connector = getConnector(connectorId);
  if (!connector) return false;

  await runConnectorHook("before_deactivate", { workspaceId, connectorId });
  await runConnectorHook("after_deactivate", { workspaceId, connectorId });
  return true;
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
    defaultStatus: "inactive",
  };

  return { valid: true, manifest };
}
