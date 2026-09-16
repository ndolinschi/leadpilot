"use client";

import { useState } from "react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { ThreadList } from "@/components/chat/thread-list";
import { Card } from "@/components/ui/card";

export default function InboxPage() {
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
          <ThreadList query={q} onQueryChange={setQ} />
          <div className="hidden items-center justify-center p-8 text-center text-muted-foreground lg:flex">
            <div>
              <p className="font-medium text-foreground">{i18n.inbox.noThread}</p>
              <p className="mt-1 text-sm">{i18n.inbox.noThreadHint}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
