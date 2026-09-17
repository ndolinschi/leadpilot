import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./config";

/**
 * Service-role client for trusted server paths only.
 * Returns null when service role is absent — callers must fall back safely.
 * NEVER import this from client components.
 */
export function createAdminSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key || !isSupabaseConfigured()) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}
