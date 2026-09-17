import { NextRequest, NextResponse } from "next/server";
import { handleTelegramWebhook } from "@/lib/connectors/telegram/handler";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const result = await handleTelegramWebhook(payload, req.headers);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        statusCode: 500,
        message: "Internal error processing Telegram webhook",
        error: String(err),
      },
      { status: 500 }
    );
  }
}
