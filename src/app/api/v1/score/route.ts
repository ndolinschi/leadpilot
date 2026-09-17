import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api-auth";
import { scoreLead, normalizeSeniority } from "@/lib/score";
import type { LeadFeatures } from "@/lib/types";

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

    const features: LeadFeatures = {
      industry: String(body.industry || "SaaS"),
      companySize: Number(body.companySize) || 10,
      source: String(body.source || "inbound"),
      country: String(body.country || "Moldova"),
      seniority: normalizeSeniority(body.seniority || "mid"),
      lastTouchDays: Number(body.lastTouchDays) || 0,
      emailsOpened: Number(body.emailsOpened) || 0,
      emailsSent: Number(body.emailsSent) || 0,
      siteVisits: Number(body.siteVisits) || 1,
      demoRequested: Boolean(body.demoRequested),
      budgetSignal: Number(body.budgetSignal) || 0.5,
      hasLinkedin: Boolean(body.hasLinkedin || body.linkedin),
      hasPhone: Boolean(body.hasPhone || body.phone),
    };

    const result = scoreLead(features);

    return NextResponse.json({
      ok: true,
      data: {
        score: result.score,
        probability: result.probability,
        recommendedChannel: result.channel,
        channelProbabilities: result.channelProbs,
        factors: result.factors,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to parse features JSON" }, { status: 400 });
  }
}
