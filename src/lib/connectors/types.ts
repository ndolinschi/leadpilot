import type { Channel, Lead, ChatMessage } from "@/lib/types";

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
