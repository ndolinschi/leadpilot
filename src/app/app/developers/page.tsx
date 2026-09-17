"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Code2,
  Copy,
  Download,
  Key,
  ShieldCheck,
  Server,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/button-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApiKeyRecord } from "@/lib/types";

const EMPTY_API_KEYS: ApiKeyRecord[] = [];

interface ApiEndpointDoc {
  method: "GET" | "POST";
  path: string;
  title: string;
  desc: string;
  curl: string;
  response: string;
}

export default function DevelopersPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const apiKeys = useLeadsStore((s) => s.settings.apiKeys) ?? EMPTY_API_KEYS;
  const i18n = t(lang);
  const D = i18n.developersPage;
  const isRu = lang === "ru";

  const activeKeyPrefix = apiKeys[0]?.prefix || "lp_live_demo_key";

  const endpoints: ApiEndpointDoc[] = [
    {
      method: "GET",
      path: "/api/v1/health",
      title: isRu ? "Проверка статуса сервиса" : "Service Health Check",
      desc: isRu ? "Возвращает текущий статус API, среду развёртывания и активные коннекторы." : "Returns runtime health, deployment tier, and active connectors.",
      curl: `curl -X GET https://leadpilot.io/api/v1/health`,
      response: `{\n  "status": "healthy",\n  "timestamp": "2026-09-17T07:30:00.000Z",\n  "service": "leadpilot-api",\n  "version": "v1",\n  "deployment": "Hobby Vercel",\n  "connectors": ["csv", "telegram", "viber", "email", "facebook"]\n}`,
    },
    {
      method: "GET",
      path: "/api/v1/leads",
      title: isRu ? "Список лидов в очереди" : "List Scored Leads in Queue",
      desc: isRu ? "Возвращает ранжированную очередь лидов с ML-оценками и рекомендуемыми каналами." : "Returns prioritized lead records with ML conversion probability and channel routing.",
      curl: `curl -X GET "https://leadpilot.io/api/v1/leads?minScore=70&limit=10" \\\n  -H "Authorization: Bearer ${activeKeyPrefix}"`,
      response: `{\n  "ok": true,\n  "count": 10,\n  "total": 72,\n  "data": [\n    {\n      "id": "lead_001",\n      "name": "Elena Cebotari",\n      "company": "Clinica Sanatate",\n      "score": 94.2,\n      "probability": 0.942,\n      "channel": "messenger",\n      "country": "Moldova"\n    }\n  ]\n}`,
    },
    {
      method: "POST",
      path: "/api/v1/leads",
      title: isRu ? "Создать и оценить лид" : "Ingest & Score New Lead",
      desc: isRu ? "Принимает данные контакта, моментально вычисляет вероятность конверсии и подбирает канал." : "Accepts prospect attributes, calculates calibrated P(convert), and assigns channel mix.",
      curl: `curl -X POST https://leadpilot.io/api/v1/leads \\\n  -H "Authorization: Bearer ${activeKeyPrefix}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "Alexandru Morari",\n    "company": "Digital Solutions SRL",\n    "email": "alex@solutions.md",\n    "industry": "SaaS",\n    "companySize": 25,\n    "demoRequested": true,\n    "budgetSignal": 0.9\n  }'`,
      response: `{\n  "ok": true,\n  "message": "Lead created and scored successfully",\n  "data": {\n    "id": "lead_api_xyz123",\n    "name": "Alexandru Morari",\n    "company": "Digital Solutions SRL",\n    "score": 91.8,\n    "probability": 0.918,\n    "channel": "messenger"\n  }\n}`,
    },
    {
      method: "POST",
      path: "/api/v1/score",
      title: isRu ? "Stateless ML-скоринг" : "Stateless Intent Scoring",
      desc: isRu ? "Вычисляет ML-скоринг и SHAP-факторы объяснимости без сохранения в базу." : "Pure stateless inference: returns conversion probability, channel softmax, and factor breakdown.",
      curl: `curl -X POST https://leadpilot.io/api/v1/score \\\n  -H "Authorization: Bearer ${activeKeyPrefix}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "industry": "Healthcare",\n    "companySize": 50,\n    "country": "Moldova",\n    "seniority": "exec",\n    "demoRequested": true,\n    "budgetSignal": 0.85\n  }'`,
      response: `{\n  "ok": true,\n  "data": {\n    "score": 89.4,\n    "probability": 0.894,\n    "recommendedChannel": "call",\n    "channelProbabilities": {\n      "call": 0.54,\n      "messenger": 0.28,\n      "email": 0.12,\n      "linkedin": 0.06\n    },\n    "factors": [\n      { "feature": "demoRequested", "label": "Demo requested", "contribution": 1.42, "direction": "up" }\n    ]\n  }\n}`,
    },
    {
      method: "POST",
      path: "/api/v1/messages",
      title: isRu ? "Отправка и генерация сообщений" : "Send or Generate Message",
      desc: isRu ? "Логирует сообщение или авто-генерирует первое обращение на базе параметров лида." : "Logs an omnichannel communication or auto-generates first-touch copy tailored to the contact.",
      curl: `curl -X POST https://leadpilot.io/api/v1/messages \\\n  -H "Authorization: Bearer ${activeKeyPrefix}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "leadId": "lead_001",\n    "channel": "messenger",\n    "autoGenerate": true\n  }'`,
      response: `{\n  "ok": true,\n  "message": "Message processed successfully",\n  "data": {\n    "id": "msg_api_4982",\n    "leadId": "lead_001",\n    "channel": "messenger",\n    "body": "Elena, saw your clinic is scaling appointments across Chisinau...",\n    "at": "2026-09-17T07:30:00.000Z"\n  }\n}`,
    },
    {
      method: "POST",
      path: "/api/v1/webhooks/telegram",
      title: isRu ? "Telegram Webhook" : "Telegram Inbound Webhook",
      desc: isRu ? "Принимает обновления от Telegram Bot API, создаёт лида в очереди и открывает переписку." : "Processes raw Telegram updates, verifies auth tokens, and attaches inbound messages to conversation threads.",
      curl: `curl -X POST https://leadpilot.io/api/v1/webhooks/telegram \\\n  -H "Content-Type: application/json" \\\n  -H "x-leadpilot-test: true" \\\n  -d '{\n    "update_id": 9991,\n    "isTest": true,\n    "message": {\n      "message_id": 102,\n      "from": { "id": 10293, "first_name": "Dumitru", "username": "dumitru_md" },\n      "text": "Hello, need pricing for our clinic support desk."\n    }\n  }'`,
      response: `{\n  "ok": true,\n  "statusCode": 200,\n  "message": "Sample Telegram update verified and processed through connector handler",\n  "threadId": "th_tg_10293"\n}`,
    },
    {
      method: "POST",
      path: "/api/v1/webhooks/viber",
      title: isRu ? "Viber Webhook" : "Viber Inbound Webhook",
      desc: isRu ? "Принимает вебхуки от Viber Partners API, связывает диалоги с очередью оператора." : "Receives Viber bot messages, verifies signatures, and pushes inquiries to unified Conversations.",
      curl: `curl -X POST https://leadpilot.io/api/v1/webhooks/viber \\\n  -H "Content-Type: application/json" \\\n  -H "x-leadpilot-test: true" \\\n  -d '{\n    "event": "message",\n    "isTest": true,\n    "sender": { "id": "viber_123", "name": "Maria Rusu" },\n    "message": { "type": "text", "text": "Buna ziua, avem o intrebare legata de integrare." }\n  }'`,
      response: `{\n  "ok": true,\n  "statusCode": 200,\n  "message": "Sample Viber update verified and processed through connector handler",\n  "threadId": "th_vb_viber_123"\n}`,
    },
    {
      method: "POST",
      path: "/api/v1/webhooks/facebook",
      title: isRu ? "Facebook Webhook" : "Facebook Lead Ads Webhook",
      desc: isRu
        ? "Принимает события Meta Lead Ads и Messenger, создаёт лида в очереди."
        : "Processes Meta Lead Ads and Messenger updates into the operator queue.",
      curl: `curl -X POST https://leadpilot.io/api/v1/webhooks/facebook \\\n  -H "Content-Type: application/json" \\\n  -H "x-leadpilot-test: true" \\\n  -d '{\n    "object": "page",\n    "isTest": true,\n    "entry": [{ "messaging": [{ "sender": { "id": "fb_123" }, "message": { "mid": "m1", "text": "Need a clinic demo." } }] }]\n  }'`,
      response: `{\n  "ok": true,\n  "statusCode": 200,\n  "message": "Sample Facebook lead verified and processed through connector handler",\n  "threadId": "th_fb_fb_123"\n}`,
    },
  ];

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    toast.success(isRu ? "Скопировано в буфер" : "Copied to clipboard");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{D.title}</h1>
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
              v1 REST API
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{D.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink
            href="/api/v1/openapi.json"
            target="_blank"
            variant="outline"
            className="inline-flex items-center gap-1.5 shadow-2xs text-xs"
          >
            <Download className="size-3.5" />
            <span>{D.openapiSpec}</span>
          </ButtonLink>
          <ButtonLink href="/app/settings" variant="outline" className="inline-flex items-center gap-1.5 text-xs">
            <Key className="size-3.5" />
            <span>{isRu ? "Управление API-ключами" : "Manage API Keys"}</span>
          </ButtonLink>
        </div>
      </div>

      {/* Authentication Card */}
      <Card className="border-zinc-200 bg-white shadow-2xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <CardTitle className="text-base">{D.authSection}</CardTitle>
          </div>
          <CardDescription>{D.authDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100 font-mono">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-zinc-400"># Standard Bearer Header</p>
              <p className="truncate text-emerald-400">Authorization: Bearer {activeKeyPrefix}</p>
              <p className="text-zinc-400 pt-1"># Or alternative custom header</p>
              <p className="truncate text-sky-400">x-api-key: {activeKeyPrefix}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={() => copyText(`Authorization: Bearer ${activeKeyPrefix}`)}
            >
              <Copy className="mr-1.5 size-3" />
              <span>{isRu ? "Копировать" : "Copy Header"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hobby Serverless Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
        <Server className="mt-0.5 size-4 shrink-0 text-blue-600" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">{D.hobbyTitle}</p>
          <p className="text-blue-800 leading-relaxed">{D.hobbyDesc}</p>
        </div>
      </div>

      {/* Endpoints Reference */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{D.endpointsTitle}</h2>

        <div className="space-y-4">
          {endpoints.map((ep) => (
            <Card key={`${ep.method}-${ep.path}`} className="border-zinc-200 bg-white shadow-2xs">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      className={
                        ep.method === "GET"
                          ? "bg-blue-600 text-white font-mono text-[11px]"
                          : "bg-emerald-600 text-white font-mono text-[11px]"
                      }
                    >
                      {ep.method}
                    </Badge>
                    <code className="text-sm font-semibold text-zinc-900 font-mono">
                      {ep.path}
                    </code>
                  </div>
                  <span className="text-xs font-medium text-zinc-500">{ep.title}</span>
                </div>
                <CardDescription className="pt-1 text-xs text-zinc-600">
                  {ep.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                <Tabs defaultValue="curl" className="w-full">
                  <div className="flex items-center justify-between">
                    <TabsList className="h-8">
                      <TabsTrigger value="curl" className="text-xs px-2.5 h-6">cURL</TabsTrigger>
                      <TabsTrigger value="response" className="text-xs px-2.5 h-6">{D.responseExample}</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="curl" className="mt-2">
                    <div className="relative rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100 font-mono overflow-x-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 px-2 text-[10px] text-zinc-400 hover:text-white"
                        onClick={() => copyText(ep.curl)}
                      >
                        <Copy className="size-3" />
                      </Button>
                      <pre className="whitespace-pre">{ep.curl}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="response" className="mt-2">
                    <div className="relative rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100 font-mono overflow-x-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 px-2 text-[10px] text-zinc-400 hover:text-white"
                        onClick={() => copyText(ep.response)}
                      >
                        <Copy className="size-3" />
                      </Button>
                      <pre className="whitespace-pre text-emerald-300">{ep.response}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
