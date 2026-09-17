"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Upload,
  Zap,
  Kanban,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { ChannelBadge } from "@/components/channel-badge";
import { ScoreBar } from "@/components/score-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const leads = useLeadsStore((s) => s.leads);
  const threads = useLeadsStore((s) => s.threads);
  const deals = useLeadsStore((s) => s.deals);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const isRu = lang === "ru";

  const unread = useMemo(
    () => threads.reduce((n, th) => n + (th.unread || 0), 0),
    [threads]
  );
  const pipeline = useMemo(
    () =>
      deals
        .filter((d) => d.stage !== "lost")
        .reduce((s, d) => s + d.value, 0),
    [deals]
  );
  const wonDealsCount = useMemo(
    () => deals.filter((d) => d.stage === "won").length,
    [deals]
  );
  const highPriorityCount = useMemo(
    () => leads.filter((l) => (l.score ?? 0) >= 70).length,
    [leads]
  );
  const topLeads = useMemo(
    () =>
      [...leads]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 6),
    [leads]
  );
  const recent = useMemo(
    () =>
      [...threads]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 6),
    [threads]
  );

  const firstThread = useMemo(() => {
    if (!threads || threads.length === 0) return null;
    return [...threads].sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
    )[0];
  }, [threads]);

  const firstThreadLead = useMemo(() => {
    if (!firstThread) return leads[0] ?? null;
    return leads.find((l) => l.id === firstThread.leadId) || leads[0] || null;
  }, [firstThread, leads]);

  const firstThreadId = firstThread?.id ?? "th_001";

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted/60" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {i18n.overviewStory.heroTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{i18n.overviewStory.heroSub}</p>
        </div>
        <ButtonLink href={`/app/inbox/${firstThreadId}`} variant="outline">
          {i18n.app.openInbox}
        </ButtonLink>
      </div>

      {/* Huge Open First Chat CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 p-6 shadow-xs">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#266df0] text-white hover:bg-[#266df0]">
                {i18n.overviewStory.heroBadge}
              </Badge>
              <span className="text-xs font-medium text-blue-700">
                {isRu ? "Быстрый старт за 60 секунд" : "60-Second Value Demo"}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
              {i18n.overviewStory.openChatCta}
            </h2>
            <p className="text-sm text-zinc-600">
              {firstThreadLead ? (
                <>
                  <span className="font-semibold text-zinc-900">{firstThreadLead.name}</span>
                  {" · "}
                  <span>{firstThreadLead.title} @ {firstThreadLead.company}</span>
                  {" · "}
                  <span className="font-medium text-blue-700">
                    {isRu ? "Приоритет" : "Score"}: {(firstThreadLead.score ?? 94.2).toFixed(1)}/100
                  </span>
                </>
              ) : (
                i18n.overviewStory.openChatDesc
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
            <ButtonLink
              href={`/app/inbox/${firstThreadId}`}
              size="lg"
              className="inline-flex items-center justify-center gap-2 text-base font-semibold shadow-md shadow-blue-500/10"
            >
              <MessageSquare className="size-5" />
              <span>{isRu ? "Открыть чат лида #1 →" : "Open First Chat →"}</span>
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* 4 Pipeline Story Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Collect */}
        <Card className="flex flex-col justify-between border-zinc-200 bg-white transition-colors hover:border-blue-400/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {i18n.overviewStory.step1Title}
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                <Upload className="size-3.5" />
              </div>
            </div>
            <CardTitle className="pt-2 text-2xl font-bold tracking-tight">
              {leads.length} <span className="text-sm font-normal text-muted-foreground">{isRu ? "лидов" : "contacts"}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {i18n.overviewStory.step1Plugin} · CSV & forms
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href="/app/import" variant="outline" size="sm" className="w-full text-xs">
              {i18n.overviewStory.step1Action}
            </ButtonLink>
          </CardContent>
        </Card>

        {/* Card 2: Classify */}
        <Card className="flex flex-col justify-between border-zinc-200 bg-white transition-colors hover:border-blue-400/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {i18n.overviewStory.step2Title}
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <Zap className="size-3.5" />
              </div>
            </div>
            <CardTitle className="pt-2 text-2xl font-bold tracking-tight">
              {highPriorityCount} <span className="text-sm font-normal text-muted-foreground">{isRu ? "приоритет" : "hot leads"}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {i18n.overviewStory.step2Plugin} · intent 0–100
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href="/app/leads" variant="outline" size="sm" className="w-full text-xs">
              {i18n.overviewStory.step2Action}
            </ButtonLink>
          </CardContent>
        </Card>

        {/* Card 3: Work (Chat) */}
        <Card className="flex flex-col justify-between border-blue-200 bg-blue-50/20 transition-colors hover:border-blue-400">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                {i18n.overviewStory.step3Title}
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white">
                <MessageSquare className="size-3.5" />
              </div>
            </div>
            <CardTitle className="pt-2 text-2xl font-bold tracking-tight">
              {threads.length} <span className="text-sm font-normal text-muted-foreground">{isRu ? "чатов" : "chats"}</span>
              {unread > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white text-[10px] h-5 px-1.5">
                  {unread} {isRu ? "новых" : "unread"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {i18n.overviewStory.step3Plugin} · AI assist
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href={`/app/inbox/${firstThreadId}`} size="sm" className="w-full text-xs">
              {i18n.overviewStory.step3Action}
            </ButtonLink>
          </CardContent>
        </Card>

        {/* Card 4: Verdict */}
        <Card className="flex flex-col justify-between border-zinc-200 bg-white transition-colors hover:border-blue-400/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {i18n.overviewStory.step4Title}
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                <Kanban className="size-3.5" />
              </div>
            </div>
            <CardTitle className="pt-2 text-2xl font-bold tracking-tight">
              ${Math.round(pipeline / 1000)}k <span className="text-sm font-normal text-muted-foreground">· {wonDealsCount} {isRu ? "выиграно" : "won"}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {i18n.overviewStory.step4Plugin} · outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href="/app/deals" variant="outline" size="sm" className="w-full text-xs">
              {i18n.overviewStory.step4Action}
            </ButtonLink>
          </CardContent>
        </Card>
      </div>

      {/* Top leads & Recent chats */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{i18n.app.topLeads}</CardTitle>
            <ButtonLink href="/app/leads" variant="ghost" size="sm">{i18n.app.viewAll}</ButtonLink>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/app/leads/${lead.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.company} · {lead.title}
                  </p>
                </div>
                {lead.channel && <ChannelBadge channel={lead.channel} />}
                <div className="w-24 shrink-0">
                  <ScoreBar score={lead.score ?? 0} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{i18n.app.recentChats}</CardTitle>
            <ButtonLink href={`/app/inbox/${firstThreadId}`} variant="ghost" size="sm">
              {i18n.app.viewAll}
            </ButtonLink>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((th) => {
              const lead = leads.find((l) => l.id === th.leadId);
              return (
                <Link
                  key={th.id}
                  href={`/app/inbox/${th.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{th.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead?.name} ·{" "}
                      {formatDistanceToNow(new Date(th.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <ChannelBadge channel={th.channel} />
                  {th.unread > 0 && (
                    <Badge className="h-5 px-1.5 text-[10px] bg-blue-600 text-white">
                      {th.unread}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
