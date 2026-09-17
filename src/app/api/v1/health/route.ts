import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "leadpilot-api",
    version: "v1",
    runtime: "edge/node-serverless",
    deployment: "Hobby Vercel",
    connectors: ["csv", "telegram", "viber", "email", "facebook"],
    auth: {
      header: "Authorization: Bearer lp_...",
      alternativeHeader: "x-api-key: lp_...",
    },
  });
}
