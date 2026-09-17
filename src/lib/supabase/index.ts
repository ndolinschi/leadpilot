export {
  getSupabaseUrl,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  isSupabaseConfigured,
  getDataBackendPreference,
  type DataBackend,
} from "./config";
export { createBrowserSupabaseClient, getSupabaseBrowserClient } from "./client";
export { createServerSupabaseClient } from "./server";
export { createAdminSupabaseClient, isSupabaseAdminConfigured } from "./admin";
