import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureWorkspaceForUser } from "@/lib/auth/bootstrap";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") || "/app";
  const next = nextRaw.startsWith("/") ? nextRaw : "/app";
  const origin = url.origin;

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=not_configured`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        await ensureWorkspaceForUser(supabase);
      } catch (err) {
        console.error("[auth/callback] bootstrap", err);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] exchange", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
