"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./config";

let browserClient: SupabaseClient | null = null;

/** Browser Supabase client, or null when env is missing (Demo mode). */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  const url = getSupabaseUrl()!;
  const key = getSupabaseAnonKey()!;
  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  return createBrowserSupabaseClient();
}

export { isSupabaseConfigured };
