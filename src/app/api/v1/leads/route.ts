import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api-auth";
import { CRM_SEED } from "@/lib/seed-crm";
import { applyScore, normalizeSeniority } from "@/lib/score";
import type { Channel, Lead } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await verifyApiRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") as Channel | null;
  const minScore = Number(searchParams.get("minScore") || 0);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

  let leads = CRM_SEED.leads.map((l) => applyScore(l));

  if (channel) {
    leads = leads.filter((l) => l.channel === channel);
  }
  if (minScore > 0) {
    leads = leads.filter((l) => (l.score ?? 0) >= minScore);
  }

  leads = leads.slice(0, limit);

  return NextResponse.json({
    ok: true,
    count: leads.length,
    total: CRM_SEED.leads.length,
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

    const leadId = body.id || `lead_api_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const rawLead: Lead = {
      id: leadId,
      name: String(body.name),
      company: String(body.company),
      title: body.title ? String(body.title) : "Contact",
      email: body.email ? String(body.email) : `${leadId}@inbound.io`,
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
    };

    const scoredLead = applyScore(rawLead);

    return NextResponse.json(
      {
        ok: true,
        message: "Lead created and scored successfully",
        data: scoredLead,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to parse request JSON" }, { status: 400 });
  }
}
