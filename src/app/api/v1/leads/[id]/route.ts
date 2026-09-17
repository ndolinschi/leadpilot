import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api-auth";
import { CRM_SEED } from "@/lib/seed-crm";
import { applyScore } from "@/lib/score";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyApiRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const lead = CRM_SEED.leads.find((l) => l.id === id);

  if (!lead) {
    return NextResponse.json({ error: `Lead with id '${id}' not found` }, { status: 404 });
  }

  const scored = applyScore(lead);

  return NextResponse.json({
    ok: true,
    data: scored,
  });
}
