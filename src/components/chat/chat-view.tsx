"use client";

import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { toast } from "sonner";
import { Send, Sparkles, ExternalLink, FileText } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { ChatMessage } from "@/lib/types";
import { ChannelBadge } from "@/components/channel-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
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

type ChatFeedItem =
  | { type: "date"; id: string; date: string }
  | { type: "system"; id: string; message: ChatMessage }
  | { type: "group"; id: string; direction: "in" | "out"; messages: ChatMessage[] };

function buildChatFeed(messages: ChatMessage[]): ChatFeedItem[] {
  const items: ChatFeedItem[] = [];
  let lastDateKey = "";
  let currentGroup: { type: "group"; id: string; direction: "in" | "out"; messages: ChatMessage[] } | null = null;

  for (const m of messages) {
    const dateObj = new Date(m.at);
    const dateKey = isValid(dateObj) ? format(dateObj, "yyyy-MM-dd") : "";

    if (dateKey && dateKey !== lastDateKey) {
      if (currentGroup) {
        items.push(currentGroup);
        currentGroup = null;
      }
      lastDateKey = dateKey;
      items.push({
        type: "date",
        id: `date-${dateKey}-${m.id}`,
        date: m.at,
      });
    }

    if (m.direction === "system") {
      if (currentGroup) {
        items.push(currentGroup);
        currentGroup = null;
      }
      items.push({
        type: "system",
        id: m.id,
        message: m,
      });
    } else {
      const dir = m.direction as "in" | "out";
      if (currentGroup && currentGroup.direction === dir) {
        currentGroup.messages.push(m);
      } else {
        if (currentGroup) {
          items.push(currentGroup);
        }
        currentGroup = {
          type: "group",
          id: `group-${m.id}`,
          direction: dir,
          messages: [m],
        };
      }
    }
  }

  if (currentGroup) {
    items.push(currentGroup);
  }

  return items;
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
  const threads = useLeadsStore((s) => s.threads);
  const leads = useLeadsStore((s) => s.leads);
  const allMessages = useLeadsStore((s) => s.messages);

  const thread = useMemo(
    () => threads.find((th) => th.id === threadId),
    [threads, threadId]
  );
  const lead = useMemo(
    () => (thread ? leads.find((l) => l.id === thread.leadId) : undefined),
    [leads, thread]
  );
  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => +new Date(a.at) - +new Date(b.at)),
    [allMessages, threadId]
  );

  const sendMessage = useLeadsStore((s) => s.sendMessage);
  const markThreadRead = useLeadsStore((s) => s.markThreadRead);
  const i18n = t(lang);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const aiOn = usePluginEnabled("ai-scoring");

  useEffect(() => {
    if (threadId) markThreadRead(threadId);
  }, [threadId, markThreadRead]);

  const feedItems = useMemo(() => buildChatFeed(messages), [messages]);
  const dateLocale = lang === "ru" ? ru : enUS;

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
      toast.error(i18n.inbox.generateFailed);
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
          {i18n.inbox.lead}
        </ButtonLink>
      </div>

      <MessageScrollerProvider>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="px-4 py-4">
            <MessageScrollerContent className="mx-auto max-w-3xl gap-4">
              {feedItems.length === 0 && (
                <MessageScrollerItem className="py-8">
                  <p className="text-center text-sm text-muted-foreground">
                    {i18n.inbox.emptyHint}
                  </p>
                </MessageScrollerItem>
              )}
              {feedItems.map((item, index) => {
                const isLast = index === feedItems.length - 1;

                if (item.type === "date") {
                  return (
                    <MessageScrollerItem key={item.id} scrollAnchor={isLast} className="py-1">
                      <Marker variant="separator">
                        <MarkerContent className="px-2 text-xs font-medium text-muted-foreground">
                          {isValid(new Date(item.date))
                            ? format(new Date(item.date), "MMMM d, yyyy", { locale: dateLocale })
                            : item.date}
                        </MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  );
                }

                if (item.type === "system") {
                  return (
                    <MessageScrollerItem
                      key={item.id}
                      scrollAnchor={isLast}
                      className="py-1"
                    >
                      <div className="flex justify-center">
                        <Marker className="inline-flex w-auto items-center justify-center rounded-full border border-zinc-200/70 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 shadow-xs">
                          <MarkerIcon className="mr-1 size-3 text-blue-600">
                            <Sparkles className="size-3 text-blue-600" />
                          </MarkerIcon>
                          <MarkerContent className="text-xs text-zinc-600">
                            {item.message.body}
                          </MarkerContent>
                        </Marker>
                      </div>
                    </MessageScrollerItem>
                  );
                }

                const outbound = item.direction === "out";

                return (
                  <MessageScrollerItem
                    key={item.id}
                    scrollAnchor={isLast}
                    className="py-1"
                  >
                    <MessageGroup className="gap-2">
                      {item.messages.map((m) => (
                        <Message
                          key={m.id}
                          align={outbound ? "end" : "start"}
                        >
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
                              className={
                                outbound
                                  ? "*:data-[slot=bubble-content]:bg-blue-50 *:data-[slot=bubble-content]:text-zinc-900 *:data-[slot=bubble-content]:border-blue-100"
                                  : "*:data-[slot=bubble-content]:bg-zinc-100 *:data-[slot=bubble-content]:text-zinc-800"
                              }
                            >
                              <BubbleContent className="whitespace-pre-wrap border">
                                {m.body}
                              </BubbleContent>
                            </Bubble>
                            {m.attachment && (
                              <Attachment
                                size="sm"
                                className={cn("mt-1", outbound ? "self-end" : "self-start")}
                              >
                                <AttachmentMedia>
                                  <FileText className="size-4 text-primary" />
                                </AttachmentMedia>
                                <AttachmentContent>
                                  <AttachmentTitle>{m.attachment.name}</AttachmentTitle>
                                  {m.attachment.size && (
                                    <AttachmentDescription>
                                      {m.attachment.size}
                                    </AttachmentDescription>
                                  )}
                                </AttachmentContent>
                              </Attachment>
                            )}
                            <MessageFooter>
                              {isValid(new Date(m.at))
                                ? formatDistanceToNow(new Date(m.at), {
                                    addSuffix: true,
                                    locale: dateLocale,
                                  })
                                : ""}
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      ))}
                    </MessageGroup>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

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
                {i18n.inbox.aiOff}
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
