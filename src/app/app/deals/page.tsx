"use client";

import { PluginGate } from "@/components/plugin-gate";

import { useMemo } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Deal, DealStage } from "@/lib/types";
import { DEAL_STAGES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

function DealCard({ deal, leadName }: { deal: Deal; leadName: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id, data: { stage: deal.stage } });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing",
        isDragging && "opacity-60 ring-2 ring-primary"
      )}
    >
      <Link
        href={`/app/leads/${deal.leadId}`}
        className="font-medium hover:underline"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {deal.title}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">{leadName}</p>
      <div className="mt-2 flex items-center justify-between">
        <Badge variant="secondary">
          ${deal.value.toLocaleString()}
        </Badge>
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  title,
  deals,
  leadName,
}: {
  stage: DealStage;
  title: string;
  deals: Deal[];
  leadName: (id: string) => string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] w-[240px] shrink-0 flex-col rounded-xl border border-zinc-200 bg-zinc-50",
        isOver && "border-blue-300 bg-blue-50/60"
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white/80 px-3 py-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[10px] text-muted-foreground">
            {deals.length} · ${total.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {deals.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">—</p>
        ) : (
          deals.map((d) => (
            <DealCard key={d.id} deal={d} leadName={leadName(d.leadId)} />
          ))
        )}
      </div>
    </div>
  );
}

export default function DealsPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const deals = useLeadsStore((s) => s.deals);
  const leads = useLeadsStore((s) => s.leads);
  const updateDealStage = useLeadsStore((s) => s.updateDealStage);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStage = useMemo(() => {
    const map = Object.fromEntries(
      DEAL_STAGES.map((s) => [s, [] as Deal[]])
    ) as Record<DealStage, Deal[]>;
    for (const d of deals) map[d.stage].push(d);
    return map;
  }, [deals]);

  function leadName(id: string) {
    return leads.find((l) => l.id === id)?.name ?? "—";
  }

  function onDragEnd(e: DragEndEvent) {
    const dealId = String(e.active.id);
    const overId = e.over?.id;
    if (!overId) return;
    const stage = String(overId) as DealStage;
    if (DEAL_STAGES.includes(stage)) {
      updateDealStage(dealId, stage);
    }
  }

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted/50" />;
  }

  return (
    <PluginGate id="deals">
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {i18n.dealsPage.title}
        </h1>
        <p className="text-sm text-muted-foreground">{i18n.dealsPage.subtitle}</p>
      </div>

      {deals.length === 0 ? (
        <Card className="p-8">
          <Empty className="py-12 border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{i18n.dealsPage.emptyAll}</EmptyTitle>
              <EmptyDescription>
                {i18n.dealsPage.emptyHint}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-3 overflow-x-auto pb-4">
              {DEAL_STAGES.map((stage) => (
                <StageColumn
                  key={stage}
                  stage={stage}
                  title={i18n.dealsPage.stages[stage]}
                  deals={byStage[stage]}
                  leadName={leadName}
                />
              ))}
            </div>
          </DndContext>

          {/* Fallback stage buttons for accessibility / mobile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick stage update</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {deals.slice(0, 6).map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center gap-1 rounded-lg border border-border/50 px-2 py-1.5 text-xs"
                >
                  <span className="mr-1 font-medium">{d.title}</span>
                  {DEAL_STAGES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={d.stage === s ? "default" : "outline"}
                      className="h-7 px-2 text-[10px]"
                      onClick={() => updateDealStage(d.id, s)}
                    >
                      {i18n.dealsPage.stages[s]}
                    </Button>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  </PluginGate>
  );
}
