"use client";

import { use, useState } from "react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { ThreadList } from "@/components/chat/thread-list";
import { ChatView } from "@/components/chat/chat-view";
import { Card } from "@/components/ui/card";

export default function InboxThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const lang = useLeadsStore((s) => s.settings.language);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const [q, setQ] = useState("");

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted/50" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{i18n.inbox.title}</h1>
        <p className="text-sm text-muted-foreground">{i18n.inbox.subtitle}</p>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="grid min-h-[640px] lg:grid-cols-[340px_1fr]">
          <div className="hidden lg:block">
            <ThreadList query={q} onQueryChange={setQ} activeId={threadId} />
          </div>
          <ChatView threadId={threadId} />
        </div>
      </Card>
    </div>
  );
}
