import type { SupabaseClient } from "@supabase/supabase-js";
import { PLUGIN_REGISTRY } from "@leadpilot/core";
import { BUILTIN_CONNECTORS } from "@leadpilot/connectors";

export type WorkspaceInfo = {
  id: string;
  name: string;
  slug: string | null;
  role: string;
  created: boolean;
};

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "workspace"}-${suffix}`;
}

/**
 * On first successful login: create workspace + owner membership if none,
 * seed modules (core modules active; optional inactive),
 * seed connector_installs as installed but enabled=false until activated.
 */
export async function ensureWorkspaceForUser(
  client: SupabaseClient,
  opts?: { displayName?: string | null; email?: string | null }
): Promise<WorkspaceInfo> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data: memberships, error: memErr } = await client
    .from("memberships")
    .select("role, workspace_id, workspaces(id, name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (memErr) throw memErr;

  if (memberships && memberships.length > 0) {
    const m = memberships[0] as {
      role: string;
      workspace_id: string;
      workspaces:
        | { id: string; name: string; slug: string | null }
        | { id: string; name: string; slug: string | null }[]
        | null;
    };
    const ws = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces;
    if (ws) {
      await seedDefaults(client, ws.id);
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        role: m.role,
        created: false,
      };
    }
  }

  const email = opts?.email || user.email || "";
  const local = email.split("@")[0] || "team";
  const name =
    opts?.displayName?.trim() ||
    (local ? `${local}'s workspace` : "My workspace");
  const slug = slugify(local || "workspace");

  const { data: workspace, error: wsErr } = await client
    .from("workspaces")
    .insert({ name, slug })
    .select("id, name, slug")
    .single();
  if (wsErr) throw wsErr;

  const { error: joinErr } = await client.from("memberships").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });
  if (joinErr) throw joinErr;

  await seedDefaults(client, workspace.id);

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    role: "owner",
    created: true,
  };
}

async function seedDefaults(client: SupabaseClient, workspaceId: string) {
  const pluginRows = PLUGIN_REGISTRY.map((p) => {
    const status = p.defaultStatus ?? "inactive";
    return {
      workspace_id: workspaceId,
      module_slug: String(p.id),
      status,
      config: {},
      activated_at: status === "active" ? new Date().toISOString() : null,
    };
  });

  const { error: plugErr } = await client
    .from("modules")
    .upsert(pluginRows, { onConflict: "workspace_id,module_slug" });
  if (plugErr) throw plugErr;

  const connectorRows = BUILTIN_CONNECTORS.map((c) => ({
    workspace_id: workspaceId,
    connector_id: c.id,
    enabled: false,
    secrets: {},
  }));

  const { error: connErr } = await client
    .from("connector_installs")
    .upsert(connectorRows, { onConflict: "workspace_id,connector_id" });
  if (connErr) throw connErr;
}
