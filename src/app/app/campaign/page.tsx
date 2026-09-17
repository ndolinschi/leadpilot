"use client";

import { Megaphone, Mail, MessageSquare, Send, Layers } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PluginGate } from "@/components/plugin-gate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";

export default function CampaignPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  const isRu = lang === "ru";

  return (
    <PluginGate id="campaign">
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRu ? "Аутбаунд-кампании" : "Outbound Campaigns"}
            </h1>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {isRu ? "Сценарии активны" : "Active Cadence"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRu
              ? "Многошаговые последовательности касаний: Email, LinkedIn и мессенджеры с учетом скоринга и AI-персонализации."
              : "Multi-touch outbound sequences: Email, LinkedIn, and Messenger cadences tuned by ML priority score."}
          </p>
        </div>
        <ButtonLink href="/app/settings" variant="outline" size="sm">
          {i18n.nav.settings}
        </ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers className="size-4" />
            </div>
            <CardTitle className="text-base">
              {isRu ? "Омниканальные цепочки" : "Omnichannel Cadences"}
            </CardTitle>
            <CardDescription>
              {isRu
                ? "Шаг 1: Персональное письмо → Шаг 2: LinkedIn Connect → Шаг 3: Viber/Telegram фоллоу-ап."
                : "Step 1: Personalized Email → Step 2: LinkedIn Connect → Step 3: Messenger nudge."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isRu ? "3 шага · интервал 2 дня · умная пауза при ответе" : "3 touches · 2-day cadence · auto-stop on reply"}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Mail className="size-4" />
            </div>
            <CardTitle className="text-base">
              {isRu ? "AI-генерация вариантов" : "AI Copy Variations"}
            </CardTitle>
            <CardDescription>
              {isRu
                ? "Генерация уникального первого касания под отрасль, должность и сигналы бюджета клиента."
                : "Generate custom hooks matching the recipient's seniority, industry, and budget signals."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isRu ? "A/B тест тем и хуков на базе ML" : "A/B subject line testing with ML analytics"}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare className="size-4" />
            </div>
            <CardTitle className="text-base">
              {isRu ? "Авто-перевод в Inbox" : "Auto-Handover to Inbox"}
            </CardTitle>
            <CardDescription>
              {isRu
                ? "Как только клиент отвечает, кампания останавливается, и тред появляется в живом Inbox."
                : "The second a prospect replies, the sequence halts and lands directly in the active rep Inbox."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isRu ? "Мгновенное уведомление оператора" : "Zero latency handoff to live operator"}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">
            {isRu ? "Пример последовательности касаний" : "Sample Outreach Sequence"}
          </CardTitle>
          <CardDescription>
            {isRu
              ? "Автоматические шаги с контролем ответов и переходом к вердикту."
              : "Automated multi-channel sequence stopping as soon as an outcome is reached."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">Day 0</Badge>
              <Mail className="size-4 text-blue-600" />
              <span className="font-medium">
                {isRu ? "Первое персонализированное письмо по лучшему каналу" : "Personalized cold intro via recommended channel"}
              </span>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {isRu ? "AI черновик" : "AI Drafted"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">Day 2</Badge>
              <Send className="size-4 text-blue-600" />
              <span className="font-medium">
                {isRu ? "LinkedIn / Мессенджер фоллоу-ап с кейсом" : "LinkedIn / Messenger touch with ROI one-pager"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isRu ? "Если нет ответа на Day 0" : "Triggered if no reply on Day 0"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">Day 5</Badge>
              <Megaphone className="size-4 text-blue-600" />
              <span className="font-medium">
                {isRu ? "Финальный короткий чек-ин и предложение слота" : "Short breakup touch & calendar booking link"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isRu ? "Если нет ответа → Исход: No reply" : "No reply → Auto-outcome: No reply"}
            </span>
          </div>

          <div className="mt-4 flex justify-end">
            <ButtonLink href="/app/inbox" size="sm">
              {isRu ? "Открыть диалоги" : "Open Conversations"}
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
    </PluginGate>
  );
}
