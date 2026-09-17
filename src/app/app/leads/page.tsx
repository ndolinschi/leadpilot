"use client";

import { PluginGate } from "@/components/plugin-gate";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FilterX, Inbox } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Channel, Lead } from "@/lib/types";
import { ChannelBadge } from "@/components/channel-badge";
import { ScoreBar } from "@/components/score-bar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/components/ui/data-table-features";

const CHANNELS: Channel[] = ["email", "call", "linkedin", "messenger"];

export default function DashboardPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const leads = useLeadsStore((s) => s.leads);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const searchRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [source, setSource] = useState("all");
  const [minScore, setMinScore] = useState(0);

  const industries = useMemo(() => Array.from(new Set(leads.map((l) => l.industry))).sort(), [leads]);
  const sources = useMemo(() => Array.from(new Set(leads.map((l) => l.source))).sort(), [leads]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return [...leads]
      .filter((l) => (channel === "all" ? true : l.channel === channel))
      .filter((l) => (industry === "all" ? true : l.industry === industry))
      .filter((l) => (source === "all" ? true : l.source === source))
      .filter((l) => (l.score ?? 0) >= minScore)
      .filter((l) => {
        if (!qq) return true;
        return (
          l.name.toLowerCase().includes(qq) ||
          l.company.toLowerCase().includes(qq) ||
          l.email.toLowerCase().includes(qq)
        );
      });
  }, [leads, q, channel, industry, source, minScore]);

  const avg = leads.length === 0 ? 0 : leads.reduce((s, l) => s + (l.score ?? 0), 0) / leads.length;
  const hasFilters = q !== "" || channel !== "all" || industry !== "all" || source !== "all" || minScore > 0;

  function clearFilters() {
    setQ("");
    setChannel("all");
    setIndustry("all");
    setSource("all");
    setMinScore(0);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const editable =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "/" && !editable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (document.activeElement === searchRef.current && q) {
          setQ("");
        } else if (hasFilters && !editable) {
          clearFilters();
        } else {
          searchRef.current?.blur();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, hasFilters]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<DataTableFeatures, Lead>();
    return [
      columnHelper.accessor((row) => row.score ?? 0, {
        id: "score",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={i18n.app.score} />
        ),
        cell: ({ row }) => (
          <Link href={`/app/leads/${row.original.id}`} className="block">
            <ScoreBar score={row.original.score ?? 0} />
          </Link>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={i18n.app.name} />
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div>
              <Link
                href={`/app/leads/${lead.id}`}
                className="font-medium hover:underline"
              >
                {lead.name}
              </Link>
              <div className="text-xs text-muted-foreground">
                {lead.country} · {lead.industry}
              </div>
            </div>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("company", {
        header: i18n.app.company,
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor("title", {
        header: i18n.app.title,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("channel", {
        header: i18n.app.channel,
        cell: ({ row }) => {
          const ch = row.original.channel;
          return ch ? (
            <ChannelBadge channel={ch} label={i18n.channels[ch]} />
          ) : null;
        },
      }),
      columnHelper.accessor("source", {
        header: i18n.app.source,
        cell: ({ getValue }) => (
          <span className="capitalize text-muted-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("outcome", {
        header: i18n.app.outcome,
        cell: ({ row }) => {
          const outcome = row.original.outcome;
          return outcome ? (
            <Badge variant="secondary" className="capitalize">
              {outcome.replace("_", " ")}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      }),
    ];
  }, [i18n]);

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-muted/60" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-muted/50" />
        <p className="text-sm text-muted-foreground">{i18n.app.loading}</p>
      </div>
    );
  }

  return (
    <PluginGate id="leads">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{i18n.app.leads}</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} / {leads.length} · {i18n.app.avgScore} {avg.toFixed(1)}
            </p>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">{i18n.app.searchHint}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            ref={searchRef}
            placeholder={i18n.app.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="lg:col-span-2"
            aria-label={i18n.app.search}
          />
          <Select value={channel} onValueChange={(v) => setChannel(v ?? "all")}>
            <SelectTrigger className="w-full" aria-label={i18n.app.filterChannel}>
              <SelectValue placeholder={i18n.app.filterChannel}>
                {channel === "all" ? i18n.app.all : i18n.channels[channel as Channel]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.app.all}</SelectItem>
              {CHANNELS.map((c) => (
                <SelectItem key={c} value={c}>
                  {i18n.channels[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={industry} onValueChange={(v) => setIndustry(v ?? "all")}>
            <SelectTrigger className="w-full" aria-label={i18n.app.filterIndustry}>
              <SelectValue placeholder={i18n.app.filterIndustry}>
                {industry === "all" ? i18n.app.all : industry}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.app.all}</SelectItem>
              {industries.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={(v) => setSource(v ?? "all")}>
            <SelectTrigger className="w-full" aria-label={i18n.app.filterSource}>
              <SelectValue placeholder={i18n.app.filterSource}>
                {source === "all" ? i18n.app.all : source}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.app.all}</SelectItem>
              {sources.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{i18n.app.minScore}</span>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-40 accent-[#266df0]"
              aria-valuemin={0}
              aria-valuemax={90}
              aria-valuenow={minScore}
            />
            <Badge variant="outline">{minScore}+</Badge>
          </label>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <FilterX className="size-3.5" />
              {i18n.app.clearFilters}
            </Button>
          )}
        </div>

        <Card className="overflow-hidden border-border/60 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{i18n.app.leads}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filtered}
              pageSize={10}
              initialSorting={[{ id: "score", desc: true }]}
              previousLabel={i18n.table.previous}
              nextLabel={i18n.table.next}
              showingLabel={i18n.table.showing}
              ofLabel={i18n.table.of}
              pageLabel={i18n.table.page}
              itemsZeroLabel={i18n.table.itemsZero}
              emptyState={
                <Empty className="border-none py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Inbox className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>{i18n.app.empty}</EmptyTitle>
                    <EmptyDescription>{i18n.app.emptyHint}</EmptyDescription>
                  </EmptyHeader>
                  {hasFilters && (
                    <EmptyContent>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <FilterX className="size-3.5" />
                        {i18n.app.clearFilters}
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              }
            />
          </CardContent>
        </Card>
      </div>
    </PluginGate>
  );
}
