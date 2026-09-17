"use client";

import { PluginGate } from "@/components/plugin-gate";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function TasksPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const tasks = useLeadsStore((s) => s.tasks);
  const leads = useLeadsStore((s) => s.leads);
  const toggleTask = useLeadsStore((s) => s.toggleTask);
  const addTask = useLeadsStore((s) => s.addTask);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const [title, setTitle] = useState("");

  const open = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const done = useMemo(() => tasks.filter((t) => t.done), [tasks]);

  if (!hydrated) {
    return <div className="h-72 animate-pulse rounded-xl bg-muted/50" />;
  }

  function onAdd() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      due: new Date(Date.now() + 3 * 86400_000).toISOString(),
      done: false,
      leadId: leads[0]?.id,
    });
    setTitle("");
    toast.success(i18n.tasksPage.added);
  }

  return (
    <PluginGate id="tasks">
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
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckCircle2 className="size-4 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>{i18n.tasksPage.empty}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              ) : (
                open.map((task) => {
                  const lead = leads.find((l) => l.id === task.leadId);
                  return (
                    <div
                      key={task.id}
                      className="flex w-full items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={task.done}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-0.5"
                        aria-label={task.title}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="cursor-pointer font-medium hover:text-primary"
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i18n.tasksPage.due}{" "}
                          {format(new Date(task.due), "MMM d")}
                          {lead && (
                            <>
                              {" · "}
                              <Link
                                href={`/app/leads/${lead.id}`}
                                className="hover:underline text-foreground/80 font-medium"
                              >
                                {lead.name}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
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
              {done.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  {i18n.tasksPage.emptyDone}
                </p>
              ) : (
                done.map((task) => (
                  <div
                    key={task.id}
                    className="flex w-full items-start gap-3 rounded-lg border border-border/40 px-3 py-2.5 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                      aria-label={task.title}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="cursor-pointer font-medium line-through"
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PluginGate>
  );
}
