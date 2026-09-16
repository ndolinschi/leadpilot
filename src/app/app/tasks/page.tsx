"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const tasks = useLeadsStore((s) => s.tasks);
  const leads = useLeadsStore((s) => s.leads);
  const toggleTask = useLeadsStore((s) => s.toggleTask);
  const addTask = useLeadsStore((s) => s.addTask);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const [title, setTitle] = useState("");

  if (!hydrated) {
    return <div className="h-72 animate-pulse rounded-xl bg-muted/50" />;
  }

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  function onAdd() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      due: new Date(Date.now() + 3 * 86400_000).toISOString(),
      done: false,
      leadId: leads[0]?.id,
    });
    setTitle("");
    toast.success("Task added");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {i18n.tasksPage.title}
        </h1>
        <p className="text-sm text-muted-foreground">{i18n.tasksPage.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{i18n.tasksPage.add}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input
            className="max-w-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={i18n.tasksPage.placeholder}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
          />
          <Button onClick={onAdd}>{i18n.tasksPage.add}</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {i18n.tasksPage.open} ({open.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {open.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {i18n.tasksPage.empty}
              </p>
            ) : (
              open.map((task) => {
                const lead = leads.find((l) => l.id === task.leadId);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="mt-0.5 size-4 shrink-0 rounded border border-border" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {i18n.tasksPage.due}{" "}
                        {format(new Date(task.due), "MMM d")}
                        {lead && (
                          <>
                            {" · "}
                            <Link
                              href={`/app/leads/${lead.id}`}
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lead.name}
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {i18n.tasksPage.done} ({done.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {done.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border border-border/40 px-3 py-2.5 text-left opacity-70 hover:opacity-100"
                )}
              >
                <Badge variant="secondary" className="mt-0.5">
                  ✓
                </Badge>
                <p className="font-medium line-through">{task.title}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
