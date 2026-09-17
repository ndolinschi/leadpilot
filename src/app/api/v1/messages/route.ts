import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api-auth";
import { CRM_SEED } from "@/lib/seed-crm";
import { generateMessage } from "@/lib/messages";
import { applyScore, normalizeSeniority } from "@/lib/score";
import type { Channel, Lead } from "@/lib/types";

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

    let targetLead: Lead | undefined;
    if (body.leadId) {
      targetLead = CRM_SEED.leads.find((l) => l.id === body.leadId);
    }

    if (!targetLead && body.lead) {
      const now = new Date().toISOString();
      const rawLead: Lead = {
        id: body.lead.id || `lead_${Date.now()}`,
        name: body.lead.name || "Unknown Lead",
        company: body.lead.company || "Unknown Company",
        title: body.lead.title || "Contact",
        email: body.lead.email || "inbound@leadpilot.io",
        country: body.lead.country || "Moldova",
        industry: body.lead.industry || "SaaS",
        companySize: Number(body.lead.companySize) || 10,
        source: body.lead.source || "inbound",
        channel: body.lead.channel || "email",
        seniority: normalizeSeniority(body.lead.seniority || "mid"),
        lastTouchDays: Number(body.lead.lastTouchDays) || 0,
        emailsOpened: Number(body.lead.emailsOpened) || 0,
        emailsSent: Number(body.lead.emailsSent) || 0,
        siteVisits: Number(body.lead.siteVisits) || 1,
        demoRequested: Boolean(body.lead.demoRequested),
        budgetSignal: Number(body.lead.budgetSignal) || 0.5,
        hasLinkedin: Boolean(body.lead.linkedin),
        hasPhone: Boolean(body.lead.phone),
        createdAt: now,
      };
      targetLead = applyScore(rawLead);
    }

    const channel: Channel = body.channel || targetLead?.channel || "email";
    let messageText = body.body;

    if (!messageText && body.autoGenerate) {
      if (!targetLead) {
        return NextResponse.json(
          { error: "Cannot auto-generate message without a lead or leadId." },
          { status: 400 }
        );
      }
      messageText = generateMessage(targetLead, channel, {
        companyName: "LeadPilot",
        voice: "Consultative, concise, value-first. Mention one concrete outcome.",
        language: "en",
        productPitch: "Stop FIFO queues: ML priority, best channel, and instant verdicts.",
      });
    }

    if (!messageText) {
      return NextResponse.json(
        { error: "Message 'body' is required, or specify 'autoGenerate': true with lead context." },
        { status: 400 }
      );
    }

    const messageId = `msg_api_${Date.now().toString(36)}`;
    const at = new Date().toISOString();

    return NextResponse.json({
      ok: true,
      message: "Message processed successfully",
      data: {
        id: messageId,
        leadId: targetLead?.id || body.leadId || "unassigned",
        channel,
        body: messageText,
        at,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to parse request JSON" }, { status: 400 });
  }
}
