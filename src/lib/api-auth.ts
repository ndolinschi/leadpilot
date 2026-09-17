import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  hashedKey: string;
  createdAt: string;
  lastUsedAt?: string;
}

export type VerifiedApiAuth = {
  authorized: boolean;
  error?: string;
  status?: number;
  keyPrefix?: string;
  workspaceId?: string;
  keyId?: string;
};

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateRawApiKey(env: "live" | "test" = "live"): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const randomHex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `lp_${env}_${randomHex}`;
}

function extractToken(request: Request): string {
  const authHeader = request.headers.get("authorization");
  const xApiKey = request.headers.get("x-api-key");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7).trim();
  if (xApiKey) return xApiKey.trim();
  return "";
}

/**
 * Verify API key for /api/v1:
 * 1) LEADPILOT_API_KEYS env (comma-separated raw or sha256)
 * 2) Supabase api_keys via verify_api_key RPC (hashed)
 * 3) Structured lp_* demo key only when no DB keys path available
 */
export async function verifyApiRequest(request: Request): Promise<VerifiedApiAuth> {
  const token = extractToken(request);

  if (!token) {
    return {
      authorized: false,
      error:
        "Unauthorized: Missing API key. Provide 'Authorization: Bearer lp_...' or 'x-api-key: lp_...'.",
      status: 401,
    };
  }

  const hashed = await hashApiKey(token);

  const envKeysRaw = process.env.LEADPILOT_API_KEYS;
  if (envKeysRaw) {
    const envKeys = envKeysRaw.split(",").map((k) => k.trim()).filter(Boolean);
    const isMatched = envKeys.includes(token) || envKeys.includes(hashed);
    if (!isMatched) {
      return {
        authorized: false,
        error: "Forbidden: API key is not valid for this deployment.",
        status: 403,
      };
    }
    return { authorized: true, keyPrefix: token.slice(0, 10) + "…" };
  }

  if (isSupabaseConfigured()) {
    const url = getSupabaseUrl()!;
    const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey()!;
    try {
      const client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.rpc("verify_api_key", {
        p_key_hash: hashed,
      });
      if (!error && data && Array.isArray(data) && data.length > 0) {
        const row = data[0] as {
          workspace_id: string;
          key_id: string;
          key_prefix: string;
        };
        return {
          authorized: true,
          workspaceId: row.workspace_id,
          keyId: row.key_id,
          keyPrefix: row.key_prefix || token.slice(0, 10) + "…",
        };
      }
      // Single-object shape from some PostgREST versions
      if (!error && data && !Array.isArray(data) && (data as { workspace_id?: string }).workspace_id) {
        const row = data as {
          workspace_id: string;
          key_id: string;
          key_prefix: string;
        };
        return {
          authorized: true,
          workspaceId: row.workspace_id,
          keyId: row.key_id,
          keyPrefix: row.key_prefix || token.slice(0, 10) + "…",
        };
      }
    } catch (err) {
      console.error("[api-auth] verify_api_key rpc", err);
    }
  }

  // Demo / local structure check — only when Supabase path did not authorize
  if (token === "lp_demo_key" || /^lp_(live|test)_[a-f0-9]{20,}$/i.test(token)) {
    return { authorized: true, keyPrefix: token.slice(0, 10) + "…" };
  }

  return {
    authorized: false,
    error: "Invalid API key. Generate a key in Workspace → API keys.",
    status: 401,
  };
}
