"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Store,
  Upload,
  Bot,
  Send,
  Share2,
  FileSpreadsheet,
  Mail,
  Code2,
  Copy,
  Play,
  Settings2,
  FileCode,
  Puzzle,
  Lock,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { useAuthOptional } from "@/components/auth/auth-provider";
import { t } from "@/lib/i18n";
import { BUILTIN_CONNECTORS, validateCustomManifest } from "@/lib/connectors/registry";
import type { ConnectorManifest } from "@/lib/connectors/types";
import type { ConnectorState, PluginId } from "@/lib/types";
import { listPlugins, isPluginEnabled, mergePlugins } from "@/lib/plugins";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ButtonLink } from "@/components/button-link";

const EMPTY_CONNECTORS: Record<string, ConnectorState> = {};
const EMPTY_CUSTOM: ConnectorManifest[] = [];

const ICON_MAP: Record<string, typeof Store> = {
  csv: FileSpreadsheet,
  telegram: Send,
  viber: Bot,
  facebook: Share2,
  email: Mail,
};

export default function MarketplacePage() {
  const auth = useAuthOptional();
  const lang = useLeadsStore((s) => s.settings.language);
  const pluginsRaw = useLeadsStore((s) => s.settings.plugins);
  const plugins = useMemo(() => mergePlugins(pluginsRaw), [pluginsRaw]);
  const setPluginEnabled = useLeadsStore((s) => s.setPluginEnabled);
  const connectorsConfig = useLeadsStore((s) => s.settings.connectors) ?? EMPTY_CONNECTORS;
  const customConnectors = useLeadsStore((s) => s.customConnectors) ?? EMPTY_CUSTOM;
  const toggleConnector = useLeadsStore((s) => s.toggleConnector);
  const updateConnectorConfig = useLeadsStore((s) => s.updateConnectorConfig);
  const registerConnector = useLeadsStore((s) => s.registerConnector);
  const receiveWebhookLeadAndMessage = useLeadsStore((s) => s.receiveWebhookLeadAndMessage);
  const i18n = t(lang);
  const M = i18n.marketplacePage;
  const isRu = lang === "ru";
  const usingWorkspace = Boolean(auth?.usingSupabase);

  const moduleList = useMemo(() => listPlugins(), []);

  const allConnectors: ConnectorManifest[] = useMemo(() => {
    const map = new Map<string, ConnectorManifest>();
    for (const c of BUILTIN_CONNECTORS) map.set(c.id, c);
    for (const c of customConnectors) map.set(c.id, c);
    return Array.from(map.values());
  }, [customConnectors]);

  const [selectedConnector, setSelectedConnector] = useState<ConnectorManifest | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [manifestJson, setManifestJson] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  function openSetup(c: ConnectorManifest) {
    const state = connectorsConfig[c.id];
    if (!state?.enabled) {
      toast.message(
        isRu
          ? "Сначала активируйте коннектор — затем настройте."
          : "Activate the connector first, then configure."
      );
      return;
    }
    setSelectedConnector(c);
    const existing = state?.config || {};
    const initial: Record<string, string> = {};
    for (const [k, v] of Object.entries(existing)) initial[k] = String(v);
    setConfigValues(initial);
  }

  function handleSaveConfig() {
    if (!selectedConnector) return;
    updateConnectorConfig(selectedConnector.id, configValues);
    toast.success(M.configSaved);
  }

  function handleToggleModule(id: PluginId, enabled: boolean) {
    try {
      setPluginEnabled(id, enabled);
      toast.success(
        enabled
          ? isRu
            ? "Модуль активирован — появится в навигации"
            : "Module activated — now in navigation"
          : isRu
            ? "Модуль деактивирован — скрыт из навигации"
            : "Module deactivated — hidden from navigation"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cannot change module");
    }
  }

  async function handleSendTest(connector: ConnectorManifest) {
    if (connectorsConfig[connector.id]?.enabled === false) {
      toast.error(isRu ? "Активируйте коннектор перед тестом" : "Activate connector before testing");
      return;
    }
    setTestBusy(true);
    try {
      let endpoint = connector.webhookPath;
      let payload: Record<string, unknown> = {};

      if (connector.id === "telegram") {
        endpoint = "/api/v1/webhooks/telegram";
        payload = {
          update_id: 1000000 + Math.floor(Math.random() * 90000),
          isTest: true,
          message: {
            message_id: Math.floor(Math.random() * 50000),
            from: {
              id: 777000 + Math.floor(Math.random() * 1000),
              first_name: "Radu",
              last_name: "Lungu",
              username: "radu_chisinau",
            },
            chat: { id: 777000 + Math.floor(Math.random() * 1000) },
            date: Math.floor(Date.now() / 1000),
            text: isRu
              ? "Здравствуйте, мы открываем новый филиал в Кишинёве, нужен срочный расчёт тарифа."
              : "Hello, we are opening a new office in Chisinau and would like a quote.",
          },
        };
      } else if (connector.id === "viber") {
        endpoint = "/api/v1/webhooks/viber";
        payload = {
          event: "message",
          isTest: true,
          message_token: Date.now(),
          timestamp: Date.now(),
          sender: { id: `viber_${Math.floor(Math.random() * 9000)}`, name: "Dr. Mihai Sandu", country: "MD" },
          message: {
            type: "text",
            text: isRu
              ? "Добрый день! Хотим подключить колл-центр стоматологической клиники."
              : "Good day! We would like to connect our dental clinic desk to LeadPilot.",
          },
        };
      } else if (connector.id === "facebook") {
        endpoint = "/api/v1/webhooks/facebook";
        payload = {
          isTest: true,
          object: "page",
          entry: [
            {
              id: "page_md_demo",
              time: Date.now(),
              messaging: [
                {
                  sender: { id: `fb_${Math.floor(Math.random() * 9000)}` },
                  message: {
                    mid: `m_${Date.now()}`,
                    text: isRu
                      ? "Здравствуйте, заявка с Facebook Lead Ads — нужна консультация."
                      : "Hello from Facebook Lead Ads — we need a consultation.",
                  },
                },
              ],
            },
          ],
        };
      }

      const res = await fetch(endpoint || `/api/v1/webhooks/${connector.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-leadpilot-test": "true" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.lead) receiveWebhookLeadAndMessage(data.lead, data.chatMessage);
        toast.success(M.testSuccess);
      } else {
        toast.error(data.message || M.testFailure);
      }
    } catch {
      toast.error(M.testFailure);
    } finally {
      setTestBusy(false);
    }
  }

  function handleImportManifest() {
    try {
      const parsed = JSON.parse(manifestJson);
      const { valid, manifest, error } = validateCustomManifest(parsed);
      if (!valid || !manifest) {
        toast.error(error || "Invalid manifest format");
        return;
      }
      registerConnector(manifest);
      toast.success(
        isRu
          ? `Коннектор ${manifest.name} установлен (выключен до активации)`
          : `Connector ${manifest.name} installed (disabled until activated)`
      );
      setImportModalOpen(false);
      setManifestJson("");
    } catch {
      toast.error(isRu ? "Некорректный JSON файл" : "Invalid JSON syntax");
    }
  }

  function handleFileUpload(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setManifestJson(String(reader.result || ""));
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{M.title}</h1>
            <Badge
              variant="outline"
              className={
                usingWorkspace
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }
            >
              {usingWorkspace
                ? isRu
                  ? "Рабочее пространство"
                  : "Workspace"
                : isRu
                  ? "Демо-выборка"
                  : "Demo sample"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{M.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setImportModalOpen(true)} variant="outline" className="inline-flex items-center gap-1.5 shadow-2xs">
            <Upload className="size-4" />
            <span>{M.importPackage}</span>
          </Button>
          <ButtonLink href="/app/developers" variant="outline" className="inline-flex items-center gap-1.5">
            <Code2 className="size-4" />
            <span>API Docs</span>
          </ButtonLink>
        </div>
      </div>

      {/* Modules — Shopify-style activate/deactivate */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Puzzle className="size-3.5" />
            {isRu ? "Модули рабочего стола" : "Desk modules"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isRu
              ? "Активируйте модуль — он появится в навигации. Деактивируйте — скрыт, без «Production» бейджей."
              : "Activate a module to show it in nav. Deactivate to hide — no fake Production badges."}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {moduleList.map((mod) => {
            const id = mod.id as PluginId;
            const enabled = isPluginEnabled(plugins, id);
            const locked = Boolean(mod.locked);
            return (
              <Card key={mod.id} className="border-zinc-200 bg-white shadow-2xs">
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      {mod.name}
                      {locked && <Lock className="size-3 text-zinc-400" />}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {isRu ? mod.descriptionRu : mod.descriptionEn}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={locked && enabled}
                    onCheckedChange={(val) => handleToggleModule(id, val)}
                    aria-label={mod.name}
                  />
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <Badge
                    className={
                      enabled
                        ? "bg-emerald-600 text-white text-[10px]"
                        : "bg-zinc-200 text-zinc-700 text-[10px]"
                    }
                  >
                    {enabled
                      ? isRu
                        ? "Активен"
                        : "Active"
                      : isRu
                        ? "Выключен"
                        : "Inactive"}
                  </Badge>
                  {mod.href && enabled && (
                    <ButtonLink href={mod.href} variant="ghost" size="sm" className="text-xs h-7">
                      {isRu ? "Открыть" : "Open"}
                    </ButtonLink>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Connectors */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Store className="size-3.5" />
            {isRu ? "Коннекторы каналов" : "Channel connectors"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isRu
              ? "Активируйте → затем настройте токены и webhook. Тест работает только у активных."
              : "Activate → then configure tokens & webhook. Test only works when active."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allConnectors.map((c) => {
            const Icon = ICON_MAP[c.id] || Store;
            const isEnabled = connectorsConfig[c.id]?.enabled === true;
            const desc = isRu ? c.descriptionRu : c.description;
            const hasWebhook = Boolean(c.webhookPath);

            return (
              <Card
                key={c.id}
                className="flex flex-col justify-between border-zinc-200 bg-white shadow-2xs transition-all hover:border-blue-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#266df0] border border-blue-100">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">
                        v{c.version}
                      </span>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(val) => toggleConnector(c.id, val)}
                        aria-label={c.name}
                      />
                    </div>
                  </div>
                  <CardTitle className="pt-2 text-base font-semibold text-zinc-900">{c.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="outline" className="text-[10px] font-normal border-zinc-200">
                      {c.brand}
                    </Badge>
                    {hasWebhook && (
                      <Badge variant="outline" className="text-[10px] font-normal border-blue-200 text-blue-700 bg-blue-50/50">
                        Webhook
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-1 flex flex-1 flex-col justify-between text-xs text-muted-foreground">
                  <p className="leading-relaxed text-zinc-600 line-clamp-3">{desc}</p>
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {isRu ? "Статус:" : "Status:"}
                      </span>
                      <Badge
                        className={
                          isEnabled
                            ? "bg-emerald-600 text-white text-[10px]"
                            : "bg-zinc-200 text-zinc-700 text-[10px]"
                        }
                      >
                        {isEnabled ? M.enabledBadge : M.disabledBadge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        disabled={!isEnabled}
                        onClick={() => openSetup(c)}
                      >
                        <Settings2 className="mr-1 size-3.5" />
                        <span>{isRu ? "Настроить" : "Configure"}</span>
                      </Button>
                      {hasWebhook && (
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs shrink-0"
                          disabled={testBusy || !isEnabled}
                          onClick={() => handleSendTest(c)}
                          title="Send sample webhook through real handler"
                        >
                          <Play className="size-3 text-white" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {selectedConnector && (
        <Dialog open={Boolean(selectedConnector)} onOpenChange={(open) => !open && setSelectedConnector(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#266df0]">
                  {(() => {
                    const Icon = ICON_MAP[selectedConnector.id] || Store;
                    return <Icon className="size-4" />;
                  })()}
                </div>
                <div>
                  <DialogTitle>{selectedConnector.name}</DialogTitle>
                  <DialogDescription>
                    {selectedConnector.brand} · v{selectedConnector.version}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {selectedConnector.webhookPath && (
                <div className="space-y-1.5 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-950">{M.webhookUrl}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-blue-700"
                      onClick={() => {
                        const origin = typeof window !== "undefined" ? window.location.origin : "https://leadpilot.io";
                        navigator.clipboard.writeText(`${origin}${selectedConnector.webhookPath}`);
                        toast.success(isRu ? "URL скопирован в буфер" : "Webhook URL copied");
                      }}
                    >
                      <Copy className="mr-1 size-3" />
                      <span>{isRu ? "Копировать" : "Copy"}</span>
                    </Button>
                  </div>
                  <code className="block break-all rounded bg-white px-2 py-1 font-mono text-[11px] text-blue-900 border border-blue-100">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}${selectedConnector.webhookPath}`
                      : selectedConnector.webhookPath}
                  </code>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  {isRu ? "Инструкция по подключению:" : "Setup Steps:"}
                </p>
                <ol className="list-decimal space-y-1.5 pl-4 text-xs text-zinc-600 leading-relaxed">
                  {((isRu ? selectedConnector.setupStepsRu : selectedConnector.setupStepsEn) || []).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {selectedConnector.configSchema && selectedConnector.configSchema.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    {isRu ? "Учётные данные и токены:" : "Credentials & Parameters:"}
                  </p>
                  {selectedConnector.configSchema.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={field.key} className="text-xs">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </Label>
                      <Input
                        id={field.key}
                        type={field.type === "password" ? "password" : "text"}
                        placeholder={field.placeholder}
                        value={configValues[field.key] || ""}
                        onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                        className="text-xs font-mono"
                      />
                      {field.description && (
                        <p className="text-[10px] text-muted-foreground">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
              {selectedConnector.webhookPath ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={testBusy}
                  onClick={() => handleSendTest(selectedConnector)}
                  className="text-xs"
                >
                  <Play className="mr-1.5 size-3 text-blue-600" />
                  <span>{M.testWebhook}</span>
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedConnector(null)}>
                  {isRu ? "Закрыть" : "Close"}
                </Button>
                <Button size="sm" onClick={handleSaveConfig}>
                  {M.saveConfig}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{M.importModalTitle}</DialogTitle>
            <DialogDescription>{M.importModalDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">{M.pasteJson}</Label>
              <Textarea
                rows={7}
                placeholder='{\n  "id": "custom-desk",\n  "name": "Custom Desk Ingest",\n  "brand": "Make / Zapier",\n  "version": "1.0.0",\n  "capabilities": ["inbound_leads"]\n}'
                value={manifestJson}
                onChange={(e) => setManifestJson(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="manifest-file"
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
              />
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                render={<label htmlFor="manifest-file" className="cursor-pointer inline-flex items-center gap-1.5" />}
              >
                <FileCode className="size-3.5" />
                <span>{M.uploadFile}</span>
              </Button>
              {manifestJson && (
                <span className="text-[11px] text-emerald-600 font-medium">✓ Manifest loaded</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(false)}>
              {isRu ? "Отмена" : "Cancel"}
            </Button>
            <Button size="sm" onClick={handleImportManifest}>
              {M.validateAndInstall}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
