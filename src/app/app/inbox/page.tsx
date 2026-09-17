"use client";

import { PluginGate } from "@/components/plugin-gate";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { ThreadList } from "@/components/chat/thread-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsLarge } from "@/hooks/use-mobile";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";

export default function InboxPage() {
  const router = useRouter();
  const isLarge = useIsLarge();
  const lang = useLeadsStore((s) => s.settings.language);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const threads = useLeadsStore((s) => s.threads);
  const leads = useLeadsStore((s) => s.leads);
  const resetDemo = useLeadsStore((s) => s.resetDemo);
  const openOrCreateThread = useLeadsStore((s) => s.openOrCreateThread);
  const i18n = t(lang);
  const [q, setQ] = useState("");

  const firstThreadId = useMemo(() => {
    if (!threads || threads.length === 0) return null;
    const sorted = [...threads].sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
    );
    return sorted[0]?.id ?? null;
  }, [threads]);

  // On desktop, auto-redirect to first conversation for dual-pane view
  useEffect(() => {
    if (hydrated && isLarge && firstThreadId) {
      router.replace(`/app/inbox/${firstThreadId}`);
    }
  }, [hydrated, isLarge, firstThreadId, router]);

  function handleOpenDemo() {
    if (threads.length > 0) {
      router.push(`/app/inbox/${threads[0].id}`);
      return;
    }
    if (leads.length > 0) {
      const topLead = [...leads].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
      const tid = openOrCreateThread(topLead.id, topLead.channel);
      router.push(`/app/inbox/${tid}`);
      return;
    }
    resetDemo();
    router.push("/app/inbox/th_001");
  }

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted/50" />;
  }

  return (
    <PluginGate id="inbox">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{i18n.inbox.title}</h1>
          <p className="text-sm text-muted-foreground">{i18n.inbox.subtitle}</p>
        </div>
        <Card className="overflow-hidden p-0 border-border/60 bg-white">
          <div className="flex flex-col lg:grid lg:min-h-[640px] lg:grid-cols-[340px_1fr]">
            <div className="w-full">
              <ThreadList query={q} onQueryChange={setQ} />
            </div>
            <div className="hidden items-center justify-center p-8 text-center text-muted-foreground lg:flex">
              {firstThreadId ? (
                <div className="space-y-2">
                  <div className="mx-auto size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs text-muted-foreground">{i18n.app.loading}</p>
                </div>
              ) : (
                <Empty className="border border-dashed p-8">
                  <EmptyMedia variant="icon">
                    <MessageSquare className="size-4 text-blue-600" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>{i18n.inbox.empty}</EmptyTitle>
                    <EmptyDescription>{i18n.inbox.emptyHint}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={handleOpenDemo} size="sm">
                      {i18n.inbox.openDemoThread}
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PluginGate>
  );
}
