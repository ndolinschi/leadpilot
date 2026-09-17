import type { DeskRepository } from "@leadpilot/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getDataBackendPreference,
  isSupabaseConfigured,
  preferSupabaseRepo,
} from "@/lib/supabase/config";
import { LocalDeskRepository } from "./local";
import { SupabaseDeskRepository } from "./supabase";

export { LocalDeskRepository } from "./local";
export { SupabaseDeskRepository } from "./supabase";

export type CreateRepoOptions = {
  /** Explicit workspace for supabase backend */
  workspaceId?: string | null;
  /** Injected supabase client (browser or server) */
  client?: SupabaseClient | null;
  /** Optional local seed for Demo sample mode */
  localSeed?: ConstructorParameters<typeof LocalDeskRepository>[0];
};

/**
 * Dual-mode factory:
 * - local: always Demo sample store
 * - supabase: when configured + workspaceId + client
 * - auto: supabase if possible, else local
 */
export function createDeskRepository(opts: CreateRepoOptions = {}): DeskRepository {
  const pref = getDataBackendPreference();
  // Session + workspace ⇒ prefer Supabase (auto/supabase). Anonymous ⇒ Demo sample local.
  const canSupabase = preferSupabaseRepo({
    hasSession: Boolean(opts.client && opts.workspaceId) || pref === "supabase",
    workspaceId: opts.workspaceId,
    client: opts.client,
  });

  if (pref === "supabase" && !canSupabase) {
    return new LocalDeskRepository(opts.localSeed);
  }

  if (canSupabase) {
    return new SupabaseDeskRepository(opts.client!, opts.workspaceId!);
  }

  return new LocalDeskRepository(opts.localSeed);
}

export function resolveBackendLabel(repo: DeskRepository): "Demo sample" | "Workspace" {
  return repo.backend === "local" ? "Demo sample" : "Workspace";
}
