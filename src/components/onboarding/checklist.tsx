"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Upload,
  Flame,
  MessageSquare,
  Award,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLeadsStore } from "@/store/leads-store";
import { useAuthOptional } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  titleEn: string;
  titleRu: string;
  descEn: string;
  descRu: string;
  href: string;
  done: boolean;
  icon: typeof Upload;
};

/**
 * Beautiful light onboarding for new / empty workspaces.
 * EN+RU. Hidden once all steps complete or user dismisses.
 */
export function OnboardingChecklist() {
  const auth = useAuthOptional();
  const lang = useLeadsStore((s) => s.settings.language);
  const leads = useLeadsStore((s) => s.leads);
  const threads = useLeadsStore((s) => s.threads);
  const dataBackend = useLeadsStore((s) => s.dataBackend);
  const isRu = lang === "ru";
  const [dismissed, setDismissed] = useState(false);

  const realLeads = useMemo(
    () => leads.filter((l) => !l.isDemoSample),
    [leads]
  );
  const hasImport = realLeads.length > 0;
  const hasScored = realLeads.some((l) => (l.score ?? 0) > 0);
  const hasConversation = threads.length > 0;
  const hasVerdict = realLeads.some((l) => Boolean(l.outcome));

  // Show for signed-in workspace that hasn't finished the funnel,
  // or empty demo just starting. Hide when dismissed / complete.
  const steps: Step[] = useMemo(
    () => [
      {
        id: "import",
        titleEn: "Import CSV",
        titleRu: "Импорт CSV",
        descEn: "Upload your Moldova lead list — agencies, clinics, e-commerce.",
        descRu: "Загрузите список лидов — агентства, клиники, e-commerce.",
        href: "/app/import",
        done: hasImport,
        icon: Upload,
      },
      {
        id: "score",
        titleEn: "Score the queue",
        titleRu: "Оценить очередь",
        descEn: "ML priority ranks hot buyers first — work by intent, not FIFO.",
        descRu: "ML-приоритет ставит горячих первыми — работайте по intent, не FIFO.",
        href: "/app/leads",
        done: hasScored,
        icon: Flame,
      },
      {
        id: "talk",
        titleEn: "Open a conversation",
        titleRu: "Открыть диалог",
        descEn: "Start a thread on the recommended channel from a ranked lead.",
        descRu: "Откройте тред в рекомендованном канале из ранжированной очереди.",
        href: "/app/inbox",
        done: hasConversation,
        icon: MessageSquare,
      },
      {
        id: "verdict",
        titleEn: "Mark a verdict",
        titleRu: "Поставить вердикт",
        descEn: "Won / Lost / No reply — close the loop so metrics stay honest.",
        descRu: "Won / Lost / No reply — закройте цикл, чтобы метрики были честными.",
        href: hasImport && realLeads[0] ? `/app/leads/${realLeads[0].id}` : "/app/leads",
        done: hasVerdict,
        icon: Award,
      },
    ],
    [hasImport, hasScored, hasConversation, hasVerdict, realLeads]
  );

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const showForWorkspace = dataBackend === "supabase" || Boolean(auth?.usingSupabase);
  const showForEmptyDemo = dataBackend === "local" && realLeads.length === 0;

  if (dismissed || allDone) return null;
  if (!showForWorkspace && !showForEmptyDemo) return null;
  // Don't nag workspace that already has data past onboarding
  if (showForWorkspace && doneCount >= 3 && hasVerdict) return null;

  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <Card className="relative overflow-hidden border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-white shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-blue-100/40 blur-2xl" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg tracking-tight">
              {isRu ? "Первый запуск рабочего пространства" : "Get your workspace live"}
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              {isRu
                ? "Импорт → скоринг → диалог → вердикт. Четыре шага до честной очереди."
                : "Import → score → talk → verdict. Four steps to an honest queue."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 size-8 p-0 text-zinc-400 hover:text-zinc-700"
            onClick={() => setDismissed(true)}
            aria-label={isRu ? "Скрыть" : "Dismiss"}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              {isRu ? `Готово ${doneCount} из ${steps.length}` : `${doneCount} of ${steps.length} done`}
            </span>
            <span className="font-medium text-blue-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "group flex items-start gap-3 rounded-xl border bg-white/80 p-3 transition-all hover:border-blue-300 hover:shadow-sm",
                step.done ? "border-emerald-200" : "border-zinc-200"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  step.done ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#266df0]"
                )}
              >
                {step.done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">0{i + 1}</span>
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {isRu ? step.titleRu : step.titleEn}
                  </p>
                  {!step.done && <Circle className="size-3 text-zinc-300" />}
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
                  {isRu ? step.descRu : step.descEn}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
