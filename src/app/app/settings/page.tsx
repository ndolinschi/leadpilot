"use client";

import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Inbox,
  Users,
  Zap,
  Kanban,
  Upload,
  Building2,
  CheckSquare,
  LineChart,
  Workflow,
  Megaphone,
  Check,
  Lock,
  ExternalLink,
  CreditCard,
  Sliders,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Lang, PluginId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLUGIN_REGISTRY, mergePlugins } from "@/lib/plugins";

const PLUGIN_ICONS: Record<string, LucideIcon> = {
  inbox: Inbox,
  leads: Users,
  "ai-scoring": Zap,
  deals: Kanban,
  import: Upload,
  companies: Building2,
  tasks: CheckSquare,
  metrics: LineChart,
  workflow: Workflow,
  campaign: Megaphone,
};

export default function SettingsPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const updateSettings = useLeadsStore((s) => s.updateSettings);
  const resetDemo = useLeadsStore((s) => s.resetDemo);
  const rescoreAll = useLeadsStore((s) => s.rescoreAll);
  const pluginsRaw = useLeadsStore((s) => s.settings.plugins);
  const plugins = useMemo(() => mergePlugins(pluginsRaw), [pluginsRaw]);
  const i18n = t(lang);
  const S = i18n.settingsPage;
  const L = i18n.landing;
  const isRu = lang === "ru";

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

  const plans = [
    {
      key: "starter" as const,
      price: 49,
      who: L.starterWho,
      pluginsText: L.starterPlugins,
      features: [L.fStarter1, L.fStarter2, L.fStarter3, L.fStarter4],
    },
    {
      key: "growth" as const,
      price: 149,
      featured: true,
      who: L.growthWho,
      pluginsText: L.growthPlugins,
      features: [L.fGrowth1, L.fGrowth2, L.fGrowth3, L.fGrowth4],
    },
    {
      key: "scale" as const,
      price: 399,
      who: L.scaleWho,
      pluginsText: L.scalePlugins,
      features: [L.fScale1, L.fScale2, L.fScale3, L.fScale4],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{S.title}</h1>
        <p className="text-sm text-muted-foreground">{i18n.tagline}</p>
      </div>

      <Tabs defaultValue="plugins" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="plugins" className="inline-flex items-center gap-1.5">
            <Store className="size-3.5" />
            <span>{S.tabPlugins}</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="inline-flex items-center gap-1.5">
            <CreditCard className="size-3.5" />
            <span>{S.tabBilling}</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="inline-flex items-center gap-1.5">
            <Sliders className="size-3.5" />
            <span>{S.tabGeneral}</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Plugins App-Store */}
        <TabsContent value="plugins" className="mt-6 space-y-6">
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {g.label}
                    </p>
                    <div className="space-y-3">
                      {items.map((p) => {
                        const Icon = PLUGIN_ICONS[p.id] || Store;
                        const on = p.locked ? true : p.coming ? false : plugins[p.id] !== false;
                        const label =
                          i18n.plugins.labels[p.id as keyof typeof i18n.plugins.labels] ||
                          p.id;
                        const pain = lang === "ru" ? p.painRu : p.painEn;
                        const desc = lang === "ru" ? p.descriptionRu : p.descriptionEn;

                        return (
                          <div
                            key={p.id}
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:bg-zinc-50"
                          >
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 text-[#266df0] shadow-2xs">
                                <Icon className="size-5" />
                              </div>
                              <div className="min-w-0 space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-zinc-900">
                                    {label}
                                  </span>
                                  {p.locked && (
                                    <Badge variant="outline" className="inline-flex items-center gap-1 border-zinc-300 text-zinc-600 text-[10px]">
                                      <Lock className="size-2.5" />
                                      {i18n.landing.pluginCoreLocked}
                                    </Badge>
                                  )}
                                  {p.id === "ai-scoring" && (
                                    <Badge className="bg-blue-600 text-white text-[10px] hover:bg-blue-600">
                                      default on
                                    </Badge>
                                  )}
                                  {p.coming && (
                                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                                      {i18n.plugins.comingBadge}
                                    </Badge>
                                  )}
                                  {p.href && (
                                    <Link
                                      href={p.href}
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                                    >
                                      <span>{isRu ? "Открыть" : "View"}</span>
                                      <ExternalLink className="size-2.5" />
                                    </Link>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-600">
                                  <span className="font-semibold text-zinc-700">
                                    {i18n.plugins.pain}:{" "}
                                  </span>
                                  {pain}
                                </p>
                                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>

                                {/* Extra info for Channels plugin */}
                                {p.id === "import" && (
                                  <div className="pt-2 flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="bg-white text-[10px] border-emerald-300 text-emerald-700">
                                      ✓ CSV (Active)
                                    </Badge>
                                    <Badge variant="outline" className="bg-white text-[10px] text-muted-foreground border-dashed">
                                      Facebook Leads (Soon)
                                    </Badge>
                                    <Badge variant="outline" className="bg-white text-[10px] text-muted-foreground border-dashed">
                                      Viber (Soon)
                                    </Badge>
                                    <Badge variant="outline" className="bg-white text-[10px] text-muted-foreground border-dashed">
                                      Telegram (Soon)
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-end sm:self-center shrink-0">
                              <Switch
                                checked={on}
                                disabled={p.locked || p.coming}
                                onCheckedChange={(v) => togglePlugin(p.id, !!v)}
                                aria-label={label}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Billing & Plans */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="border-zinc-200 bg-white shadow-none">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{S.billingTitle}</CardTitle>
                  <CardDescription>{S.billingSubtitle}</CardDescription>
                </div>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                  {S.currentPlanBadge}: Growth ($149/mo)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
                {plans.map((p) => (
                  <Card
                    key={p.key}
                    className={
                      p.featured
                        ? "relative flex flex-col justify-between border-2 border-blue-600 bg-white shadow-sm"
                        : "flex flex-col justify-between border-zinc-200 bg-white shadow-none"
                    }
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base text-zinc-900">
                          {p.key === "starter" ? L.starter : p.key === "growth" ? L.growth : L.scale}
                        </CardTitle>
                        {p.featured && (
                          <Badge className="bg-blue-600 text-white hover:bg-blue-600 text-[10px]">
                            {L.popular}
                          </Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-zinc-900">
                        ${p.price}
                        <span className="text-sm font-normal text-zinc-500">{L.perMonth}</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed min-h-[36px]">
                        {p.who}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-4 pt-0">
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-2.5">
                        <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                          {S.planIncludes}:
                        </p>
                        <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                          {p.pluginsText}
                        </p>
                      </div>

                      <ul className="space-y-2 text-xs text-zinc-600 flex-1">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={p.featured ? "default" : "outline"}
                        size="sm"
                        className="mt-auto w-full"
                        disabled={p.featured}
                      >
                        {p.featured ? (isRu ? "Активный тариф (Демо)" : "Active Plan (Demo)") : (isRu ? "Переключить план" : "Switch Plan")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Check className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-blue-950">
                    {isRu ? "Бесплатный демонстрационный режим" : "Free Interactive Demo Mode"}
                  </p>
                  <p className="text-blue-800 mt-0.5">{L.freeDemoNote}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
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

              <div className="flex flex-wrap gap-2 pt-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
