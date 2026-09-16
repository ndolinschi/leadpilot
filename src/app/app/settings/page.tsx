"use client";

import { toast } from "sonner";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Lang, PluginId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLUGIN_REGISTRY,
  mergePlugins,
} from "@/lib/plugins";

export default function SettingsPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const updateSettings = useLeadsStore((s) => s.updateSettings);
  const resetDemo = useLeadsStore((s) => s.resetDemo);
  const rescoreAll = useLeadsStore((s) => s.rescoreAll);
  const i18n = t(lang);
  const S = i18n.settingsPage;
  const plugins = mergePlugins(settings.plugins);

  function save() {
    rescoreAll();
    toast.success(S.saved);
  }

  function togglePlugin(id: PluginId, on: boolean) {
    updateSettings({
      plugins: { ...plugins, [id]: on },
    });
  }

  const groups = [
    { key: "crm" as const, label: i18n.plugins.groupCrm },
    { key: "ai" as const, label: i18n.plugins.groupAi },
    { key: "system" as const, label: i18n.plugins.groupSystem },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{S.title}</h1>
      </div>

      <Card className="border-zinc-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{S.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">{S.company}</Label>
            <Input
              id="company"
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voice">{S.voice}</Label>
            <Textarea
              id="voice"
              rows={3}
              value={settings.voice}
              onChange={(e) => updateSettings({ voice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pitch">{S.pitch}</Label>
            <Textarea
              id="pitch"
              rows={3}
              value={settings.productPitch}
              onChange={(e) => updateSettings({ productPitch: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{S.language}</Label>
            <Select
              value={settings.language}
              onValueChange={(v) =>
                updateSettings({ language: (v as Lang) || "en" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {settings.language === "ru" ? "Русский" : "English"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-zinc-600">
            {S.apiNote}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>{S.save}</Button>
            <Button
              variant="outline"
              onClick={() => {
                resetDemo();
                toast.message(S.resetDone);
              }}
            >
              {S.reset}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{S.pluginsTitle}</CardTitle>
          <CardDescription>{S.pluginsSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {groups.map((g) => {
            const items = PLUGIN_REGISTRY.filter((p) => p.group === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key} className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {g.label}
                </p>
                <div className="space-y-3">
                  {items.map((p) => {
                    const on = plugins[p.id] !== false;
                    const label =
                      i18n.plugins.labels[p.id as keyof typeof i18n.plugins.labels] ||
                      p.id;
                    const pain = lang === "ru" ? p.painRu : p.painEn;
                    const desc = lang === "ru" ? p.descriptionRu : p.descriptionEn;
                    return (
                      <div
                        key={p.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-900">
                              {label}
                            </span>
                            {p.id === "ai-scoring" && (
                              <span className="rounded-full bg-[#266df0]/10 px-2 py-0.5 text-[10px] font-medium text-[#266df0]">
                                default on
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            <span className="font-medium text-zinc-600">
                              {i18n.plugins.pain}:{" "}
                            </span>
                            {pain}
                          </p>
                          <p className="text-xs text-zinc-500">{desc}</p>
                        </div>
                        <Switch
                          checked={on}
                          onCheckedChange={(v) => togglePlugin(p.id, !!v)}
                          aria-label={label}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
