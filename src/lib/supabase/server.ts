import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./config";

/**
 * Cookie-aware server client for Route Handlers / Server Components.
 * Returns null when Supabase env is missing (Demo mode).
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — middleware refreshes the session.
        }
      },
    },
  });
}

/** Stateless anon client (no cookies) for public server paths. */
export function createAnonSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { isSupabaseConfigured };
