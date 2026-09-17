/** Shared Supabase env helpers — safe when credentials are missing (Demo mode). */

export function getSupabaseUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";
  return url || null;
}

export function getSupabaseAnonKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  return key || null;
}

export function getSupabaseServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export type DataBackend = "auto" | "local" | "supabase";

export function getDataBackendPreference(): DataBackend {
  const raw = (process.env.NEXT_PUBLIC_DATA_BACKEND || "auto").toLowerCase();
  if (raw === "local" || raw === "supabase" || raw === "auto") return raw;
  return "auto";
}

/**
 * Session + workspace → prefer Supabase repo.
 * Anonymous visitors stay on labeled Demo sample (local).
 */
export function preferSupabaseRepo(opts: {
  hasSession: boolean;
  workspaceId?: string | null;
  client?: unknown | null;
}): boolean {
  const pref = getDataBackendPreference();
  if (pref === "local") return false;
  if (!isSupabaseConfigured()) return false;
  if (!opts.hasSession || !opts.workspaceId || !opts.client) return false;
  return pref === "supabase" || pref === "auto";
}
