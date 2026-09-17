import type { Channel, Lead, ChatMessage } from "@leadpilot/core";

export type ConnectorCapability =
  | "inbound_leads"
  | "inbound_messages"
  | "outbound_messages"
  | "webhooks"
  | "batch_import";

export type ConnectorAuthType = "none" | "api_key" | "webhook_secret" | "oauth2";

export interface ConnectorConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "textarea" | "boolean";
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | boolean;
}

export type ConnectorInstallStatus = "installed" | "active" | "inactive";

export interface ConnectorManifest {
  id: string;
  name: string;
  brand: string;
  version: string;
  channel: Channel;
  description: string;
  descriptionRu: string;
  category: "channels" | "messaging" | "import" | "social";
  capabilities: ConnectorCapability[];
  authType: ConnectorAuthType;
  webhookPath?: string;
  configSchema?: ConnectorConfigField[];
  setupStepsEn?: string[];
  setupStepsRu?: string[];
  defaultStatus?: ConnectorInstallStatus;
}

export interface WebhookResult {
  ok: boolean;
  statusCode: number;
  message: string;
  lead?: Partial<Lead>;
  chatMessage?: Partial<ChatMessage>;
  threadId?: string;
  setupInstructions?: Record<string, string>;
  details?: Record<string, unknown>;
}

/** Connector hook lifecycle events */
export type ConnectorHookName =
  | "before_install"
  | "after_install"
  | "before_activate"
  | "after_activate"
  | "before_deactivate"
  | "after_deactivate"
  | "webhook_received"
  | "lead_ingested"
  | "message_sent";

export interface ConnectorHookContext {
  workspaceId: string;
  connectorId: string;
  config?: Record<string, string | boolean | unknown>;
  payload?: unknown;
  result?: WebhookResult;
}

export type ConnectorHookHandler = (
  context: ConnectorHookContext
) => Promise<void> | void;
