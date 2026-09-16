"use client";

import { cn } from "@/lib/utils";

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const color = score >= 70 ? "bg-emerald-400" : score >= 45 ? "bg-amber-400" : "bg-slate-500";
  return (
    <div className={cn("flex items-center gap-2 min-w-[120px]", className)}>
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      <span className="tabular-nums text-sm font-semibold w-10 text-right">{score.toFixed(1)}</span>
    </div>
  );
}
