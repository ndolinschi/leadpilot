import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api-auth";
import { CRM_SEED } from "@/lib/seed-crm";
import { applyScore, normalizeSeniority } from "@/lib/score";
import type { Channel, Lead } from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { SupabaseDeskRepository } from "@/lib/repo/supabase";

function workspaceClient() {
  const admin = createAdminSupabaseClient();
  if (admin) return admin;
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req: NextRequest) {
  const auth = await verifyApiRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") as Channel | null;
  const minScore = Number(searchParams.get("minScore") || 0);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

  if (auth.workspaceId && isSupabaseConfigured()) {
    const client = workspaceClient();
    if (client) {
      try {
        const repo = new SupabaseDeskRepository(client, auth.workspaceId);
        let leads = await repo.listLeads({
          includeDemoSamples: false,
          channel: channel || undefined,
          minScore: minScore || undefined,
          limit,
        });
        return NextResponse.json({
          ok: true,
          count: leads.length,
          workspaceId: auth.workspaceId,
          data: leads,
        });
      } catch (err) {
        console.error("[api/v1/leads] workspace list", err);
      }
    }
  }

  let leads = CRM_SEED.leads.map((l) => applyScore(l));
  if (channel) leads = leads.filter((l) => l.channel === channel);
  if (minScore > 0) leads = leads.filter((l) => (l.score ?? 0) >= minScore);
  leads = leads.slice(0, limit);

  return NextResponse.json({
    ok: true,
    count: leads.length,
    total: CRM_SEED.leads.length,
    demoSample: true,
    data: leads,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body.name || !body.company) {
      return NextResponse.json(
        { error: "Missing required fields: 'name' and 'company' are required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const rawLead: Lead = {
      id: body.id || `lead_api_${Date.now().toString(36)}`,
      name: String(body.name),
      company: String(body.company),
      title: body.title ? String(body.title) : "Contact",
      email: body.email ? String(body.email) : `api_${Date.now()}@inbound.io`,
      phone: body.phone ? String(body.phone) : undefined,
      linkedin: body.linkedin ? String(body.linkedin) : undefined,
      country: body.country ? String(body.country) : "Moldova",
      industry: body.industry ? String(body.industry) : "SaaS",
      companySize: Number(body.companySize) || 10,
      source: body.source ? String(body.source) : "inbound",
      channel: body.channel || "email",
      seniority: normalizeSeniority(body.seniority || "mid"),
      lastTouchDays: Number(body.lastTouchDays) || 0,
      emailsOpened: Number(body.emailsOpened) || 0,
      emailsSent: Number(body.emailsSent) || 0,
      siteVisits: Number(body.siteVisits) || 1,
      demoRequested: Boolean(body.demoRequested),
      budgetSignal: Number(body.budgetSignal) || 0.5,
      stage: body.stage || "new",
      hasLinkedin: Boolean(body.linkedin),
      hasPhone: Boolean(body.phone),
      createdAt: now,
      isDemoSample: false,
    };
    const scoredLead = applyScore(rawLead);

    if (auth.workspaceId && isSupabaseConfigured()) {
      const client = workspaceClient();
      if (client) {
        try {
          const repo = new SupabaseDeskRepository(client, auth.workspaceId);
          // Don't pass client-generated non-uuid id into upsert insert path
          const { id: _omit, ...rest } = scoredLead;
          const saved = await repo.upsertLead({ ...rest, name: scoredLead.name });
          return NextResponse.json(
            { ok: true, message: "Lead created and scored", data: saved, workspaceId: auth.workspaceId },
            { status: 201 }
          );
        } catch (err) {
          console.error("[api/v1/leads] workspace create", err);
          return NextResponse.json(
            { error: "Failed to persist lead to workspace", detail: err instanceof Error ? err.message : String(err) },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Lead scored (Demo sample — sign in + API key to persist)",
        data: scoredLead,
        demoSample: true,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to parse request JSON" }, { status: 400 });
  }
}
