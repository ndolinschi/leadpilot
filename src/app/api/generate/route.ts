import { NextRequest, NextResponse } from "next/server";
import { generateMessage, buildPrompt } from "@/lib/messages";
import type { Channel, CompanySettings, Lead } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead = body.lead as Lead;
    const channel = (body.channel || lead?.channel || "email") as Channel;
    const settings = (body.settings || {
      companyName: "LeadPilot",
      voice: "Consultative, concise, value-first.",
      language: "en",
      productPitch: "AI lead prioritization.",
    }) as CompanySettings;

    if (!lead?.name) {
      return NextResponse.json({ error: "lead required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const prompt = buildPrompt(lead, channel, settings);

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "You write short B2B sales first-touch messages. No markdown fences." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 280,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const message = data.choices?.[0]?.message?.content?.trim();
        if (message) return NextResponse.json({ message, provider: "openai" });
      }
    }

    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
          max_tokens: 280,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const message = data.content?.[0]?.text?.trim();
        if (message) return NextResponse.json({ message, provider: "anthropic" });
      }
    }

    const message = generateMessage(lead, channel, settings);
    return NextResponse.json({ message, provider: "template" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
