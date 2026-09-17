"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Send, Sparkles, ExternalLink } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { ChannelBadge } from "@/components/channel-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { cn } from "@/lib/utils";
import { usePluginEnabled } from "@/components/plugin-gate";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ChatView({
  threadId,
  compact,
}: {
  threadId: string;
  compact?: boolean;
}) {
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const thread = useLeadsStore((s) => s.threads.find((th) => th.id === threadId));
  const lead = useLeadsStore((s) =>
    thread ? s.leads.find((l) => l.id === thread.leadId) : undefined
  );
  const messages = useLeadsStore((s) => s.getThreadMessages(threadId));
  const sendMessage = useLeadsStore((s) => s.sendMessage);
  const markThreadRead = useLeadsStore((s) => s.markThreadRead);
  const i18n = t(lang);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const aiOn = usePluginEnabled("ai-scoring");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadId) markThreadRead(threadId);
  }, [threadId, markThreadRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, threadId]);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => +new Date(a.at) - +new Date(b.at)),
    [messages]
  );

  if (!thread || !lead) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground">{i18n.inbox.noThread}</p>
        <p className="text-sm">{i18n.inbox.noThreadHint}</p>
      </div>
    );
  }

  function onSend() {
    if (!draft.trim()) return;
    sendMessage(threadId, draft);
    setDraft("");
    toast.success(i18n.inbox.sent);
  }

  async function onGenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          channel: thread!.channel,
          settings,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setDraft(data.message);
        toast.success(i18n.inbox.generated);
      }
    } catch {
      toast.error("Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", compact ? "min-h-[420px]" : "min-h-[560px]")}>
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold">{thread.subject}</p>
            <ChannelBadge channel={thread.channel} />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {lead.name} · {lead.title} @ {lead.company}
          </p>
        </div>
        <ButtonLink href={`/app/leads/${lead.id}`} variant="outline" size="sm" className="inline-flex items-center gap-1.5">
          <ExternalLink className="size-3.5" />
          Lead
        </ButtonLink>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {sorted.map((m) => {
            if (m.direction === "system") {
              return (
                <div key={m.id} className="flex justify-center">
                  <Badge variant="secondary" className="font-normal text-muted-foreground">
                    {m.body}
                  </Badge>
                </div>
              );
            }
            const outbound = m.direction === "out";
            return (
              <Message key={m.id} align={outbound ? "end" : "start"}>
                <MessageAvatar>
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {outbound ? "You" : initials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble
                    align={outbound ? "end" : "start"}
                    variant={outbound ? "tinted" : "muted"}
                    className={outbound ? "*:data-[slot=bubble-content]:bg-blue-50 *:data-[slot=bubble-content]:text-zinc-900 *:data-[slot=bubble-content]:border-blue-100" : "*:data-[slot=bubble-content]:bg-zinc-100 *:data-[slot=bubble-content]:text-zinc-800"}
                  >
                    <BubbleContent className="whitespace-pre-wrap border">
                      {m.body}
                    </BubbleContent>
                  </Bubble>
                  <MessageFooter>
                    {formatDistanceToNow(new Date(m.at), { addSuffix: true })}
                  </MessageFooter>
                </MessageContent>
              </Message>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border/60 p-3">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={i18n.inbox.composer}
            rows={compact ? 2 : 3}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {aiOn ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={onGenerate}
              >
                <Sparkles className="size-3.5" />
                {i18n.inbox.generateAi}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Enable AI Scoring plugin for channel-aware messages
              </span>
            )}
            <Button size="sm" disabled={!draft.trim()} onClick={onSend}>
              <Send className="size-3.5" />
              {i18n.inbox.send}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
