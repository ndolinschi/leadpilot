"use client";

import { useMemo } from "react";

import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { formatDistanceToNow } from "date-fns";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { ChannelBadge } from "@/components/channel-badge";
import { ScoreBar } from "@/components/score-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mergePlugins, isPluginEnabled } from "@/lib/plugins";

export default function OverviewPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const leads = useLeadsStore((s) => s.leads);
  const threads = useLeadsStore((s) => s.threads);
  const deals = useLeadsStore((s) => s.deals);
  const tasks = useLeadsStore((s) => s.tasks);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const pluginsRaw = useLeadsStore((s) => s.settings.plugins);
  const plugins = useMemo(() => mergePlugins(pluginsRaw), [pluginsRaw]);

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
  const openTasks = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks]
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

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    isPluginEnabled(plugins, "leads") && { label: i18n.app.kpiLeads, value: String(leads.length), href: "/app/leads" },
    isPluginEnabled(plugins, "inbox") && { label: i18n.app.kpiUnread, value: String(unread), href: "/app/inbox" },
    isPluginEnabled(plugins, "deals") && {
      label: i18n.app.kpiPipeline,
      value: `$${Math.round(pipeline / 1000)}k`,
      href: "/app/deals",
    },
    isPluginEnabled(plugins, "tasks") && { label: i18n.app.kpiTasks, value: String(openTasks), href: "/app/tasks" },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {i18n.app.overview}
          </h1>
          <p className="text-sm text-muted-foreground">{i18n.tagline}</p>
        </div>
<ButtonLink href="/app/inbox">{i18n.app.openInbox}</ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{k.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{i18n.app.recentChats}</CardTitle>
<ButtonLink href="/app/inbox" variant="ghost" size="sm">{i18n.app.viewAll}</ButtonLink>
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
                    <Badge className="h-5 px-1.5 text-[10px]">{th.unread}</Badge>
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
