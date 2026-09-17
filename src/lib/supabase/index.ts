export {
  getSupabaseUrl,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  isSupabaseConfigured,
  getDataBackendPreference,
  preferSupabaseRepo,
  type DataBackend,
} from "./config";
export { createBrowserSupabaseClient, getSupabaseBrowserClient } from "./client";
