"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./config";

let browserClient: SupabaseClient | null = null;

/** Browser Supabase client (cookie-backed via @supabase/ssr). Null when env missing. */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
  return browserClient;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  return createBrowserSupabaseClient();
}

export { isSupabaseConfigured };
