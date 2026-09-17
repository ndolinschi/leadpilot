import type { DeskRepository, CompanySettings, PluginId } from "@leadpilot/core";
import { DEFAULT_PLUGINS, mergePlugins } from "@leadpilot/core";
import { useLeadsStore } from "@/store/leads-store";

/**
 * Load signed-in workspace desk into Zustand (replaces Demo sample).
 * Demo sample stays only when backend === local / anonymous.
 */
export async function hydrateStoreFromRepository(
  repo: DeskRepository,
  opts?: { workspaceName?: string; preserveLanguage?: "en" | "ru" }
): Promise<void> {
  const lang =
    opts?.preserveLanguage ||
    useLeadsStore.getState().settings.language ||
    "en";

  if (repo.backend === "local") {
    return;
  }

  const [
    leads,
    companies,
    threads,
    deals,
    tasks,
    activities,
    settings,
  ] = await Promise.all([
    repo.listLeads({ includeDemoSamples: false }),
    repo.listCompanies(),
    repo.listThreads(),
    repo.listDeals(),
    repo.listTasks(),
    repo.listActivities(),
    repo.getWorkspaceSettings(),
  ]);

  // Load all messages for listed threads (desk scale is small for MVP)
  const messageBatches = await Promise.all(
    threads.map((t) => repo.listMessages(t.id))
  );
  const messages = messageBatches.flat();

  const plugins = mergePlugins({
    ...DEFAULT_PLUGINS,
    ...(settings.plugins || {}),
  }) as Record<PluginId, boolean>;

  const nextSettings: CompanySettings = {
    ...settings,
    companyName: opts?.workspaceName || settings.companyName || "Workspace",
    language: lang,
    plugins,
    apiKeys: settings.apiKeys || [],
    connectors: settings.connectors || {},
  };

  useLeadsStore.setState({
    companies,
    leads,
    threads,
    messages,
    deals,
    tasks,
    activities,
    settings: nextSettings,
    customConnectors: useLeadsStore.getState().customConnectors,
    hydrated: true,
    dataBackend: "supabase",
  });
}

export function resetStoreToDemoSample() {
  useLeadsStore.getState().resetDemo();
  useLeadsStore.setState({ dataBackend: "local", hydrated: true });
}
