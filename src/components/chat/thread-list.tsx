"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Thread } from "@/lib/types";
import { ChannelBadge } from "@/components/channel-badge";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ThreadList({
  activeId,
  query,
  onQueryChange,
  basePath = "/app/inbox",
}: {
  activeId?: string;
  query: string;
  onQueryChange: (q: string) => void;
  basePath?: string;
}) {
  const lang = useLeadsStore((s) => s.settings.language);
  const threads = useLeadsStore((s) => s.threads);
  const leads = useLeadsStore((s) => s.leads);
  const i18n = t(lang);

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    return threads.filter((th) => {
      const lead = leads.find((l) => l.id === th.leadId);
      if (!qq) return true;
      return (
        th.subject.toLowerCase().includes(qq) ||
        lead?.name.toLowerCase().includes(qq) ||
        lead?.company.toLowerCase().includes(qq) ||
        false
      );
    });
  }, [threads, leads, query]);

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border/60">
      <div className="space-y-2 border-b border-border/60 p-3">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={i18n.inbox.search}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{i18n.inbox.empty}</p>
              <p className="mt-1">{i18n.inbox.emptyHint}</p>
            </div>
          ) : (
            filtered.map((th: Thread) => {
              const lead = leads.find((l) => l.id === th.leadId);
              const active = th.id === activeId;
              return (
                <Link
                  key={th.id}
                  href={`${basePath}/${th.id}`}
                  className={cn(
                    "flex gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    active
                      ? "bg-primary/15"
                      : "hover:bg-muted/70"
                  )}
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {lead ? initials(lead.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {lead?.name ?? "Unknown"}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(th.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {th.subject}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ChannelBadge channel={th.channel} />
                      {th.unread > 0 && (
                        <Badge className="h-5 px-1.5 text-[10px]">
                          {th.unread} {i18n.inbox.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
