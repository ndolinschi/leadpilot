"use client";

import { GitBranch, Sparkles, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";

export default function WorkflowPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  const isRu = lang === "ru";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRu ? "Автоматизация и роутинг" : "Workflow Automation"}
            </h1>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {isRu ? "Правила активны" : "Active Routing"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRu
              ? "Автоматическое распределение лидов, смена стадий по триггерам и контроль SLA для операторов."
              : "Intelligent lead routing, trigger-based stage automation, and SLA response monitoring."}
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
              <GitBranch className="size-4" />
            </div>
            <CardTitle className="text-base">
              {isRu ? "Умный роутинг по скорингу" : "Score-Based Routing"}
            </CardTitle>
            <CardDescription>
              {isRu
                ? "Лиды со скором > 80 сразу направляются старшим операторам в нужный канал."
                : "Route leads with intent > 80 directly to senior reps via the optimal channel."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isRu ? "Правило: score >= 80 → assignment: Exec SDR" : "Rule: score >= 80 → assign: Exec SDR"}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Clock className="size-4" />
            </div>
            <CardTitle className="text-base">
              {isRu ? "Контроль SLA (15 минут)" : "15-Minute Response SLA"}
            </CardTitle>
            <CardDescription>
              {isRu
                ? "Эскалация и авто-напоминание, если горячий лид не получил ответ в течение 15 минут."
                : "Escalation notifications if high-intent inbound contacts wait longer than 15 minutes."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isRu ? "Триггер: без ответа > 15m → alert + reassign" : "Trigger: no reply > 15m → alert + reassign"}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="size-4" />
            </div>
            <CardTitle className="text-base">
              {isRu ? "Авто-вердикт по исходу" : "Automated Verdicts"}
            </CardTitle>
            <CardDescription>
              {isRu
                ? "Автоматический перенос в Won или Lost на основе статуса оплаты или 3 попыток контакта."
                : "Auto-advance deal stages when client books demo or moves to outcome upon 3 touches."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isRu ? "Триггер: 3 попытки без ответа → Verdict: No reply" : "Trigger: 3 touches no reply → Verdict: No reply"}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">
            {isRu ? "Схема пайплайна автоматизации" : "Automated Pipeline Flow"}
          </CardTitle>
          <CardDescription>
            {isRu
              ? "Как модуль Workflow связывает сбор лидов, классификацию, чат и вердикт в единый конвейер."
              : "How the Workflow engine bridges Collect, Classify, Chat, and Verdict into an automated machine."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-blue-600" />
              <span>1. {isRu ? "Каналы / CSV" : "Channels / Ingest"}</span>
            </div>
            <ArrowRight className="hidden sm:block size-4 text-muted-foreground" />
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-blue-600" />
              <span>2. {isRu ? "AI-скоринг" : "ML Scoring"}</span>
            </div>
            <ArrowRight className="hidden sm:block size-4 text-muted-foreground" />
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-blue-600" />
              <span>3. {isRu ? "Роутинг в Inbox" : "Dispatch to Inbox"}</span>
            </div>
            <ArrowRight className="hidden sm:block size-4 text-muted-foreground" />
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-blue-600" />
              <span>4. {isRu ? "Вердикт" : "Outcome Verdict"}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <ButtonLink href="/app/inbox" size="sm">
              {isRu ? "Перейти в демо Inbox" : "Try Active Inbox Demo"}
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
