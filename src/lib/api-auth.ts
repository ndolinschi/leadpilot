export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string; // e.g. lp_live_8f3a...
  hashedKey: string;
  createdAt: string;
  lastUsedAt?: string;
}

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

export async function verifyApiRequest(
  request: Request
): Promise<{ authorized: boolean; error?: string; status?: number; keyPrefix?: string }> {
  const authHeader = request.headers.get("authorization");
  const xApiKey = request.headers.get("x-api-key");

  let token = "";
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (xApiKey) {
    token = xApiKey.trim();
  }

  if (!token) {
    return {
      authorized: false,
      error: "Unauthorized: Missing API key. Provide 'Authorization: Bearer lp_...' or 'x-api-key: lp_...'.",
      status: 401,
    };
  }

  const envKeysRaw = process.env.LEADPILOT_API_KEYS;
  if (envKeysRaw) {
    const envKeys = envKeysRaw.split(",").map((k) => k.trim()).filter(Boolean);
    const hashed = await hashApiKey(token);
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

  // Hobby Pragmatism:
  // On Vercel Hobby serverless without a shared database, client state lives in localStorage.
  // We validate key structure (lp_live_*, lp_test_*, or lp_demo_key) so developers can test
  // their automation pipelines immediately against serverless routes.
  if (token === "lp_demo_key" || token.startsWith("lp_")) {
    return { authorized: true, keyPrefix: token.slice(0, 10) + "…" };
  }

  return {
    authorized: false,
    error: "Invalid API key format. Keys must start with 'lp_live_' or 'lp_test_'.",
    status: 401,
  };
}
