"use client";

import { usePluginEnabled } from "@/components/plugin-gate";

import { use, useMemo, useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  MessageSquare,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { factorDetailFromLabel, factorLabel } from "@/lib/factor-labels";
import type { Channel, DealStage, Outcome } from "@/lib/types";
import { DEAL_STAGES } from "@/lib/types";
import { ChannelBadge } from "@/components/channel-badge";
import { ScoreBar } from "@/components/score-bar";
import { ChatView } from "@/components/chat/chat-view";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const aiOn = usePluginEnabled("ai-scoring");
  const { id } = use(params);
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const allLeads = useLeadsStore((s) => s.leads);
  const lead = useMemo(() => allLeads.find((l) => l.id === id), [allLeads, id]);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const updateLeadMessage = useLeadsStore((s) => s.updateLeadMessage);
  const updateOutcome = useLeadsStore((s) => s.updateOutcome);
  const regenerateMessage = useLeadsStore((s) => s.regenerateMessage);
  const openOrCreateThread = useLeadsStore((s) => s.openOrCreateThread);
  const allThreads = useLeadsStore((s) => s.threads);
  const allActivities = useLeadsStore((s) => s.activities);
  const threads = useMemo(
    () =>
      allThreads
        .filter((th) => th.leadId === id)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [allThreads, id]
  );
  const activities = useMemo(
    () => allActivities.filter((a) => a.leadId === id).slice(0, 20),
    [allActivities, id]
  );
  const allDeals = useLeadsStore((s) => s.deals);
  const deal = useMemo(() => allDeals.find((d) => d.leadId === id), [allDeals, id]);
  const updateDealStage = useLeadsStore((s) => s.updateDealStage);
  const i18n = t(lang);
  const [busy, setBusy] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const factors = useMemo(() => {
    const f = (lead?.factors ?? []).map((x) => ({
      ...x,
      displayLabel: factorLabel(
        x.feature,
        x.label,
        lang,
        factorDetailFromLabel(x.label)
      ),
    }));
    const up = f.filter((x) => x.direction === "up");
    const down = f.filter((x) => x.direction === "down");
    return { up, down, max: Math.max(1, ...f.map((x) => Math.abs(x.contribution))) };
  }, [lead, lang]);

  const activeThread = threadId || threads[0]?.id || null;

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-xl bg-muted/60" />
          <div className="h-80 animate-pulse rounded-xl bg-muted/60 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
<ButtonLink href="/app/leads" variant="ghost" size="sm" className="inline-flex items-center gap-1.5"><ArrowLeft className="size-4" />{i18n.nav.leads}</ButtonLink>
        <p className="text-muted-foreground">{i18n.detail.notFound}</p>
      </div>
    );
  }

  const current = lead;

  async function onRegenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: current,
          channel: current.channel,
          settings,
        }),
      });
      const data = await res.json();
      if (data.message) {
        updateLeadMessage(current.id, data.message);
        toast.success(
          data.provider === "template"
            ? i18n.detail.refreshedTemplate
            : `${i18n.detail.refreshedProvider} (${data.provider})`
        );
      } else {
        regenerateMessage(current.id);
        toast.message(i18n.detail.refreshedTemplate);
      }
    } catch {
      regenerateMessage(current.id);
      toast.message(i18n.detail.refreshedTemplate);
    } finally {
      setBusy(false);
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(current.message || "");
      toast.success(i18n.detail.copied);
    } catch {
      toast.error(i18n.detail.copyFailed);
    }
  }

  function mark(outcome: Outcome) {
    updateOutcome(current.id, outcome);
    toast.success(`${i18n.detail.outcomeMarked}: ${outcome?.replace("_", " ") ?? ""}`);
  }

  function startChat() {
    const tid = openOrCreateThread(current.id, current.channel);
    setThreadId(tid);
    toast.success(i18n.detail.startChat);
  }

  const channelEntries = Object.entries(lead.channelProbs || {}) as [
    Channel,
    number,
  ][];
  const engagement = i18n.detail.opensVisits.replace(
    "{visits}",
    String(lead.siteVisits)
  );

  return (
    <div className="space-y-6">
      {/* Prominent Top Verdict & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink
            href="/app/leads"
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-1.5 text-zinc-600"
          >
            <ArrowLeft className="size-4" />
            {i18n.nav.leads}
          </ButtonLink>
          <div className="hidden sm:block h-4 w-px bg-zinc-300" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {i18n.detail.verdictTitle}:
            </span>
            {lead.outcome ? (
              <Badge
                className={
                  lead.outcome === "won"
                    ? "bg-emerald-600 text-white capitalize hover:bg-emerald-600"
                    : lead.outcome === "lost"
                    ? "bg-rose-600 text-white capitalize hover:bg-rose-600"
                    : "bg-amber-600 text-white capitalize hover:bg-amber-600"
                }
              >
                {lead.outcome.replace("_", " ")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {lang === "ru" ? "Ожидает вердикта" : "Pending verdict"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Won / Lost / No Reply Button Group */}
          <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 shadow-2xs">
            <Button
              variant={lead.outcome === "won" ? "default" : "ghost"}
              size="sm"
              className={
                lead.outcome === "won"
                  ? "h-8 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
                  : "h-8 text-xs font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700"
              }
              onClick={() => mark("won")}
            >
              <CheckCircle2 className="mr-1.5 size-3.5" />
              {i18n.detail.won}
            </Button>
            <Button
              variant={lead.outcome === "lost" ? "default" : "ghost"}
              size="sm"
              className={
                lead.outcome === "lost"
                  ? "h-8 bg-rose-600 text-xs font-medium text-white hover:bg-rose-700"
                  : "h-8 text-xs font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-700"
              }
              onClick={() => mark("lost")}
            >
              <XCircle className="mr-1.5 size-3.5" />
              {i18n.detail.lost}
            </Button>
            <Button
              variant={lead.outcome === "no_reply" ? "default" : "ghost"}
              size="sm"
              className={
                lead.outcome === "no_reply"
                  ? "h-8 bg-amber-600 text-xs font-medium text-white hover:bg-amber-700"
                  : "h-8 text-xs font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-700"
              }
              onClick={() => mark("no_reply")}
            >
              <MinusCircle className="mr-1.5 size-3.5" />
              {i18n.detail.noReply}
            </Button>
          </div>

          {activeThread ? (
            <ButtonLink
              href={`/app/inbox/${activeThread}`}
              size="sm"
              className="inline-flex h-9 items-center gap-1.5"
            >
              <MessageSquare className="size-3.5" />
              {i18n.detail.openChat}
            </ButtonLink>
          ) : (
            <Button size="sm" onClick={startChat} className="inline-flex h-9 items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              {i18n.detail.startChat}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/70 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{i18n.detail.profile}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xl font-semibold">{lead.name}</div>
              <div className="text-muted-foreground">
                {lead.title} · {lead.company}
              </div>
            </div>
            <Separator />
            <Row label={i18n.detail.email} value={lead.email} />
            <Row label={i18n.detail.industry} value={lead.industry} />
            <Row label={i18n.detail.size} value={String(lead.companySize)} />
            <Row label={i18n.app.source} value={lead.source} />
            <Row label={i18n.detail.country} value={lead.country} />
            <Row label={i18n.detail.seniority} value={lead.seniority} />
            <Row label={i18n.detail.lastTouch} value={`${lead.lastTouchDays}d`} />
            <Row
              label={i18n.detail.engagement}
              value={`${lead.emailsOpened}/${lead.emailsSent} ${engagement}`}
            />
            <Row
              label={i18n.detail.demo}
              value={lead.demoRequested ? i18n.detail.demoYes : i18n.detail.demoNo}
            />
            <Row
              label={i18n.detail.budget}
              value={`${Math.round(lead.budgetSignal * 100)}%`}
            />
            {lead.phone && <Row label={i18n.detail.phone} value={lead.phone} />}
            {lead.linkedin && (
              <Row
                label={i18n.detail.linkedin}
                value={lead.linkedin.replace("https://", "")}
              />
            )}

            {deal && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {i18n.detail.dealStage}
                  </div>
                  <p className="font-medium">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ${deal.value.toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {DEAL_STAGES.map((s: DealStage) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={deal.stage === s ? "default" : "outline"}
                        className="h-7 px-2 text-[10px]"
                        onClick={() => updateDealStage(deal.id, s)}
                      >
                        {i18n.dealsPage.stages[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {aiOn && (
            <Card className="border-[#266df0]/20 bg-[#266df0]/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {i18n.detail.priority}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-semibold tabular-nums text-[#266df0]">
                  {(lead.score ?? 0).toFixed(1)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {i18n.detail.probability}:{" "}
                  {((lead.probability ?? 0) * 100).toFixed(1)}%
                </p>
                <ScoreBar score={lead.score ?? 0} className="mt-4" />
              </CardContent>
            </Card>
            )}

            {aiOn && (
            <Card className="border-border/60 bg-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {i18n.detail.recommended}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.channel && (
                  <ChannelBadge
                    channel={lead.channel}
                    label={i18n.channels[lead.channel]}
                  />
                )}
                <div className="space-y-2 pt-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {i18n.detail.channelMix}
                  </div>
                  {channelEntries
                    .sort((a, b) => b[1] - a[1])
                    .map(([ch, p]) => (
                      <div key={ch} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{i18n.channels[ch]}</span>
                          <span className="tabular-nums">
                            {(p * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={p * 100} className="h-1.5" />
                      </div>
                    ))}
                </div>
                {!activeThread && (
                  <Button className="mt-2 w-full" size="sm" onClick={startChat}>
                    <MessageSquare className="size-3.5" />
                    {i18n.detail.startChat}
                  </Button>
                )}
              </CardContent>
            </Card>
            )}
          </div>

          <Tabs defaultValue="chat">
            <TabsList>
              <TabsTrigger value="chat">{i18n.detail.chat}</TabsTrigger>
              <TabsTrigger value="message">{i18n.detail.message}</TabsTrigger>
              <TabsTrigger value="explain">{i18n.detail.explain}</TabsTrigger>
              <TabsTrigger value="activity">{i18n.detail.timeline}</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              <Card className="overflow-hidden border-border/60 p-0">
                {activeThread ? (
                  <ChatView threadId={activeThread} compact />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <p className="text-muted-foreground">{i18n.inbox.empty}</p>
                    <Button onClick={startChat}>{i18n.detail.startChat}</Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="message" className="mt-4">
              <Card className="border-border/60 bg-card/70">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-base">{i18n.detail.message}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onRegenerate}
                      disabled={busy}
                    >
                      <RefreshCw
                        className={`size-3.5 ${busy ? "animate-spin" : ""}`}
                      />
                      {i18n.detail.regenerate}
                    </Button>
                    <Button size="sm" onClick={onCopy}>
                      <Copy className="size-3.5" />
                      {i18n.detail.copy}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={lead.message || ""}
                    onChange={(e) => updateLeadMessage(lead.id, e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="explain" className="mt-4">
              <Card className="border-border/60 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">{i18n.detail.explain}</CardTitle>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {i18n.detail.explainHint}
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FactorGroup
                    title={i18n.detail.raise}
                    items={factors.up}
                    max={factors.max}
                    tone="up"
                  />
                  <FactorGroup
                    title={i18n.detail.lower}
                    items={factors.down}
                    max={factors.max}
                    tone="down"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card className="border-border/60 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">{i18n.detail.timeline}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    activities.map((a) => (
                      <div
                        key={a.id}
                        className="flex gap-3 border-b border-border/40 pb-3 last:border-0"
                      >
                        <Badge variant="outline" className="h-fit shrink-0 capitalize">
                          {a.type.replace("_", " ")}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{a.title}</p>
                          {a.detail && (
                            <p className="text-xs text-muted-foreground">
                              {a.detail}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(a.at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">{i18n.detail.outcome}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant={lead.outcome === "won" ? "default" : "outline"}
                size="sm"
                onClick={() => mark("won")}
              >
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                {i18n.detail.won}
              </Button>
              <Button
                variant={lead.outcome === "lost" ? "default" : "outline"}
                size="sm"
                onClick={() => mark("lost")}
              >
                <XCircle className="size-3.5 text-rose-400" />
                {i18n.detail.lost}
              </Button>
              <Button
                variant={lead.outcome === "no_reply" ? "default" : "outline"}
                size="sm"
                onClick={() => mark("no_reply")}
              >
                <MinusCircle className="size-3.5 text-amber-400" />
                {i18n.detail.noReply}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className="max-w-[60%] truncate text-right font-medium capitalize"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function FactorGroup({
  title,
  items,
  max,
  tone,
}: {
  title: string;
  items: { displayLabel: string; contribution: number }[];
  max: number;
  tone: "up" | "down";
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2">
        {items.map((f) => {
          const pct = (Math.abs(f.contribution) / max) * 100;
          return (
            <div key={f.displayLabel} className="space-y-1">
              <div className="flex justify-between gap-3 text-sm">
                <span>{f.displayLabel}</span>
                <span
                  className={
                    tone === "up"
                      ? "tabular-nums text-emerald-600"
                      : "tabular-nums text-rose-600"
                  }
                >
                  {f.contribution > 0 ? "+" : ""}
                  {f.contribution.toFixed(1)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    tone === "up"
                      ? "h-full rounded-full bg-emerald-400/80 transition-all"
                      : "h-full rounded-full bg-rose-400/80 transition-all"
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
