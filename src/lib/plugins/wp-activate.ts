import type { DeskRepository, PluginId, PluginInstall, PluginInstallStatus } from "@leadpilot/core";
import { getPlugin, runPluginHooks } from "@leadpilot/core";

/**
 * WordPress-style activate / deactivate for desk plugins.
 * Persists via DeskRepository (local Demo sample or wp_plugins table).
 * Gates routes through existing PluginGate + settings.plugins map.
 */
export async function activatePlugin(
  repo: DeskRepository,
  pluginId: PluginId | string,
  config?: Record<string, unknown>
): Promise<PluginInstall> {
  const manifest = getPlugin(pluginId);
  if (!manifest) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  return repo.setPluginStatus(pluginId, "active", config);
}

export async function deactivatePlugin(
  repo: DeskRepository,
  pluginId: PluginId | string
): Promise<PluginInstall> {
  const manifest = getPlugin(pluginId);
  if (!manifest) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  if (manifest.locked) {
    throw new Error(`Plugin "${pluginId}" is required and cannot be deactivated`);
  }
  return repo.setPluginStatus(pluginId, "inactive");
}

export async function installPlugin(
  repo: DeskRepository,
  pluginId: PluginId | string,
  config?: Record<string, unknown>
): Promise<PluginInstall> {
  const manifest = getPlugin(pluginId);
  if (!manifest) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  const existing = await repo.getPluginInstall(pluginId);
  if (existing) return existing;
  await runPluginHooks("install", {
    workspaceId: "pending",
    pluginId: String(pluginId),
    config,
  });
  return repo.setPluginStatus(pluginId, "installed", config);
}

export function isPluginActive(
  installs: PluginInstall[],
  pluginId: PluginId | string
): boolean {
  const row = installs.find((i) => i.pluginId === pluginId);
  return row?.status === "active";
}

export function statusToEnabled(status: PluginInstallStatus): boolean {
  return status === "active";
}
