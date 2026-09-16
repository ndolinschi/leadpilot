"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { factorDetailFromLabel, factorLabel } from "@/lib/factor-labels";
import type { Channel, Outcome } from "@/lib/types";
import { ChannelBadge } from "@/components/channel-badge";
import { ScoreBar } from "@/components/score-bar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const lead = useLeadsStore((s) => s.leads.find((l) => l.id === id));
  const hydrated = useLeadsStore((s) => s.hydrated);
  const updateLeadMessage = useLeadsStore((s) => s.updateLeadMessage);
  const updateOutcome = useLeadsStore((s) => s.updateOutcome);
  const regenerateMessage = useLeadsStore((s) => s.regenerateMessage);
  const i18n = t(lang);
  const [busy, setBusy] = useState(false);

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

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-xl bg-muted/60" />
          <div className="h-80 animate-pulse rounded-xl bg-muted/60 lg:col-span-2" />
        </div>
        <p className="text-sm text-muted-foreground">{i18n.app.loading}</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" render={<Link href="/app" />}>
          <ArrowLeft className="size-4" />
          {i18n.nav.dashboard}
        </Button>
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
    const label = outcome?.replace("_", " ") ?? "";
    toast.success(`${i18n.detail.outcomeMarked}: ${label}`);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/app" />}>
          <ArrowLeft className="size-4" />
          {i18n.nav.dashboard}
        </Button>
        {lead.outcome && (
          <Badge variant="secondary" className="capitalize">
            {lead.outcome.replace("_", " ")}
          </Badge>
        )}
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
              <Row label={i18n.detail.linkedin} value={lead.linkedin.replace("https://", "")} />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-indigo-400/20 bg-indigo-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {i18n.detail.priority}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-semibold tabular-nums text-indigo-200">
                  {(lead.score ?? 0).toFixed(1)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {i18n.detail.probability}:{" "}
                  {((lead.probability ?? 0) * 100).toFixed(1)}%
                </p>
                <ScoreBar score={lead.score ?? 0} className="mt-4" />
              </CardContent>
            </Card>

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
              </CardContent>
            </Card>
          </div>

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
                  <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
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

          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">{i18n.detail.explain}</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
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
      <span className="max-w-[60%] truncate text-right font-medium capitalize" title={value}>
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
                      ? "tabular-nums text-emerald-300"
                      : "tabular-nums text-rose-300"
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
