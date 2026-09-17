import type { ConnectorHookContext, ConnectorHookHandler, ConnectorHookName } from "./types";

const hooksMap: Map<ConnectorHookName, Set<ConnectorHookHandler>> = new Map();

/**
 * Register an action hook for connectors
 */
export function addConnectorHook(
  event: ConnectorHookName,
  handler: ConnectorHookHandler
): () => void {
  if (!hooksMap.has(event)) {
    hooksMap.set(event, new Set());
  }
  hooksMap.get(event)!.add(handler);
  return () => {
    hooksMap.get(event)?.delete(handler);
  };
}

/**
 * Remove a registered connector hook
 */
export function removeConnectorHook(
  event: ConnectorHookName,
  handler: ConnectorHookHandler
): void {
  hooksMap.get(event)?.delete(handler);
}

/**
 * Dispatch an action hook through all registered handlers
 */
export async function runConnectorHook(
  event: ConnectorHookName,
  context: ConnectorHookContext
): Promise<void> {
  const handlers = hooksMap.get(event);
  if (!handlers || handlers.size === 0) return;
  for (const handler of handlers) {
    try {
      await handler(context);
    } catch (err) {
      console.error(`Error executing connector hook '${event}' for ${context.connectorId}:`, err);
    }
  }
}
