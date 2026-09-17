"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Key,
  CreditCard,
  Sliders,
  Store,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { generateRawApiKey, hashApiKey } from "@/lib/api-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonLink } from "@/components/button-link";
import type { ApiKeyRecord } from "@/lib/types";

const EMPTY_API_KEYS: ApiKeyRecord[] = [];

export default function SettingsPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const apiKeys = useLeadsStore((s) => s.settings.apiKeys) ?? EMPTY_API_KEYS;
  const updateSettings = useLeadsStore((s) => s.updateSettings);
  const addApiKey = useLeadsStore((s) => s.addApiKey);
  const revokeApiKey = useLeadsStore((s) => s.revokeApiKey);
  const resetDemo = useLeadsStore((s) => s.resetDemo);
  const rescoreAll = useLeadsStore((s) => s.rescoreAll);
  const i18n = t(lang);
  const S = i18n.settingsPage;
  const L = i18n.landing;
  const isRu = lang === "ru";

  // API Key creation modal
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [createdPlainKey, setCreatedPlainKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState<"live" | "test">("live");

  function saveGeneral() {
    rescoreAll();
    toast.success(S.saved);
  }

  async function handleCreateKey() {
    const rawKey = generateRawApiKey(keyType);
    const hashed = await hashApiKey(rawKey);
    const keyRecord = {
      id: `key_${Date.now().toString(36)}`,
      name: keyName.trim() || (isRu ? "API Ключ" : "API Token"),
      prefix: `${rawKey.slice(0, 11)}...`,
      hashedKey: hashed,
      createdAt: new Date().toISOString(),
    };
    addApiKey(keyRecord);
    setCreatedPlainKey(rawKey);
    setKeyName("");
  }

  function copyKey(text: string) {
    navigator.clipboard.writeText(text);
    toast.success(isRu ? "Ключ скопирован в буфер обмена" : "API key copied to clipboard");
  }

  const plans = [
    {
      key: "starter" as const,
      price: L.starterPrice,
      mdl: L.starterMdl,
      who: L.starterWho,
      pluginsText: L.starterPlugins,
      features: [L.fStarter1, L.fStarter2, L.fStarter3, L.fStarter4],
    },
    {
      key: "growth" as const,
      price: L.growthPrice,
      mdl: L.growthMdl,
      featured: true,
      who: L.growthWho,
      pluginsText: L.growthPlugins,
      features: [L.fGrowth1, L.fGrowth2, L.fGrowth3, L.fGrowth4],
    },
    {
      key: "scale" as const,
      price: L.scalePrice,
      mdl: L.scaleMdl,
      who: L.scaleWho,
      pluginsText: L.scalePlugins,
      features: [L.fScale1, L.fScale2, L.fScale3, L.fScale4],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{S.title}</h1>
          <p className="text-sm text-muted-foreground">{i18n.tagline}</p>
        </div>
        <ButtonLink href="/app/marketplace" variant="outline" className="inline-flex items-center gap-1.5 self-start">
          <Store className="size-4" />
          <span>{isRu ? "Перейти в Маркетплейс" : "Connector Marketplace"}</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </ButtonLink>
      </div>

      <Tabs defaultValue="apiKeys" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="apiKeys" className="inline-flex items-center gap-1.5">
            <Key className="size-3.5" />
            <span>{S.tabApiKeys}</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="inline-flex items-center gap-1.5">
            <Sliders className="size-3.5" />
            <span>{S.tabGeneral}</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="inline-flex items-center gap-1.5">
            <CreditCard className="size-3.5" />
            <span>{S.tabBilling}</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Workspace API Keys */}
        <TabsContent value="apiKeys" className="mt-6 space-y-6">
          <Card className="border-zinc-200 bg-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">{S.apiKeysTitle}</CardTitle>
                <CardDescription>{S.apiKeysDesc}</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setCreatedPlainKey(null);
                  setNewKeyModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                <span>{S.createKey}</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-muted-foreground">
                  <Key className="mx-auto size-6 text-zinc-400 mb-2" />
                  <p>{S.noKeys}</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-zinc-50/40">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3.5">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-zinc-900 truncate">{key.name}</p>
                          <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-800">
                            {key.prefix}
                          </code>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          SHA256: {key.hashedKey.slice(0, 16)}… · Created {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          revokeApiKey(key.id);
                          toast.success(S.keyRevoked);
                        }}
                        className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        <span>{S.revokeKey}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-blue-600 shrink-0" />
                  <span>
                    {isRu
                      ? "Серверная верификация: поддерживается заголовок Authorization: Bearer lp_... и x-api-key"
                      : "Server verification: Supports Authorization: Bearer lp_... and x-api-key headers"}
                  </span>
                </div>
                <ButtonLink href="/app/developers" variant="outline" size="sm" className="text-[11px] self-start sm:self-auto bg-white">
                  <span>API Docs</span>
                  <ExternalLink className="size-3 ml-1 text-blue-600" />
                </ButtonLink>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: General Settings */}
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
                <Button onClick={saveGeneral}>{S.save}</Button>
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

        {/* Tab 3: Billing & Plans */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="border-zinc-200 bg-white shadow-none">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{S.billingTitle}</CardTitle>
                  <CardDescription>{S.billingSubtitle}</CardDescription>
                </div>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                  {S.currentPlanBadge}: Growth ($149 / ≈ 2 700 MDL)
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
                    <CardHeader className="space-y-2 pb-3">
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
                      <div>
                        <div className="text-3xl font-bold tracking-tight text-zinc-900">
                          ${p.price}
                          <span className="text-sm font-normal text-zinc-500">{L.perMonth}</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 mt-0.5">
                          {p.mdl} / mo
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed min-h-[44px]">
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

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-950">
                      {isRu ? "Фиксированный курс конверсии Молдовы" : "Moldova Fixed Conversion Rate"}
                    </p>
                    <p className="text-blue-800 mt-0.5">{L.rateComment}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Key Modal */}
      <Dialog open={newKeyModalOpen} onOpenChange={setNewKeyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{createdPlainKey ? S.newKeyTitle : S.createKey}</DialogTitle>
            <DialogDescription>
              {createdPlainKey ? S.newKeyWarning : S.apiKeysDesc}
            </DialogDescription>
          </DialogHeader>

          {createdPlainKey ? (
            <div className="space-y-4 py-3">
              <div className="rounded-lg bg-zinc-900 p-3.5 font-mono text-xs text-emerald-400 flex items-center justify-between gap-2 border border-zinc-800">
                <span className="break-all">{createdPlainKey}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 h-7 px-2 text-xs"
                  onClick={() => copyKey(createdPlainKey)}
                >
                  <Copy className="size-3 mr-1" />
                  <span>{isRu ? "Копировать" : "Copy"}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <AlertCircle className="size-4 shrink-0 text-amber-600" />
                <span>{S.newKeyWarning}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="key-name" className="text-xs">{isRu ? "Имя ключа" : "Key Description / Name"}</Label>
                <Input
                  id="key-name"
                  placeholder={S.keyNamePlaceholder}
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isRu ? "Среда" : "Environment"}</Label>
                <Select value={keyType} onValueChange={(v) => setKeyType(v as "live" | "test")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live (lp_live_*)</SelectItem>
                    <SelectItem value="test">Test / Sandbox (lp_test_*)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            {createdPlainKey ? (
              <Button onClick={() => setNewKeyModalOpen(false)}>
                {isRu ? "Готово" : "Done"}
              </Button>
            ) : (
              <Button onClick={handleCreateKey}>
                {isRu ? "Сгенерировать ключ" : "Create Token"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
