import { NextRequest, NextResponse } from "next/server";
import { handleFacebookWebhook } from "@/lib/connectors/facebook/handler";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const result = await handleFacebookWebhook(payload, req.headers);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        statusCode: 500,
        message: "Internal error processing Facebook webhook",
        error: String(err),
      },
      { status: 500 }
    );
  }
}
