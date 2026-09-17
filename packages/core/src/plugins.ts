import type { PluginId, PluginInstallStatus, PluginInstall } from "./types";

export type { PluginId, PluginInstallStatus, PluginInstall };

export interface PluginManifest {
  id: PluginId | string;
  name: string;
  version: string;
  labelKey: PluginId;
  /** Pain → value copy shown in Settings / Marketplace */
  painEn: string;
  painRu: string;
  descriptionEn: string;
  descriptionRu: string;
  href?: string;
  navKey?:
    | "leads"
    | "inbox"
    | "deals"
    | "companies"
    | "tasks"
    | "metrics"
    | "import"
    | "workflow"
    | "campaign";
  group: "crm" | "system" | "ai";
  icon?: string;
  locked?: boolean;
  defaultStatus?: PluginInstallStatus;
  capabilities?: string[];
}

export type PluginDef = PluginManifest;

export const PLUGIN_REGISTRY: PluginManifest[] = [
  {
    id: "inbox",
    name: "Unified Inbox",
    version: "1.0.0",
    labelKey: "inbox",
    painEn: "Too many tools — inbox + email + LinkedIn + notes in separate tabs.",
    painRu: "Слишком много инструментов — почта, LinkedIn и заметки в разных вкладках.",
    descriptionEn: "Unified inbox: every channel thread in one place with AI reply assist so reps stop context-switching.",
    descriptionRu: "Единый inbox: все каналы в одном месте с AI-ассистентом ответов — без переключения между окнами.",
    href: "/app/inbox",
    navKey: "inbox",
    group: "crm",
    icon: "inbox",
    defaultStatus: "active",
  },
  {
    id: "leads",
    name: "Ranked Queue & Leads",
    version: "1.0.0",
    labelKey: "leads",
    painEn: "Leads pile up chronologically; hot buyers wait behind cold ones.",
    painRu: "Лиды копятся хронологически; горячие ждут за холодными.",
    descriptionEn: "Ranked lead database with filters — work the queue by intent, not FIFO.",
    descriptionRu: "Ранжированная база лидов с фильтрами — очередь по intent, не FIFO.",
    href: "/app/leads",
    navKey: "leads",
    group: "crm",
    icon: "leads",
    locked: true,
    defaultStatus: "active",
  },
  {
    id: "ai-scoring",
    name: "ML Priority Scoring",
    version: "1.0.0",
    labelKey: "ai-scoring",
    painEn: "FIFO queues go cold; generic templates get ignored; channel is guesswork.",
    painRu: "FIFO-очередь стынет; шаблоны игнорируют; канал выбирают наугад.",
    descriptionEn: "ML priority score, best-channel recommendation, explainability, and personalized first-touch / chat AI composer. On by default.",
    descriptionRu: "ML-приоритет, лучший канал, объяснимость и персональный AI-composer. Включён по умолчанию.",
    group: "ai",
    icon: "ai-scoring",
    defaultStatus: "active",
  },
  {
    id: "deals",
    name: "Deals & Pipelines",
    version: "1.0.0",
    labelKey: "deals",
    painEn: "Pipeline chaos — stages live in spreadsheets and Slack threads.",
    painRu: "Хаос в воронке — стадии в таблицах и Slack.",
    descriptionEn: "Kanban deals board with drag-and-drop stages and instant outcome verdicts.",
    descriptionRu: "Kanban сделок drag-and-drop — честная воронка и моментальные вердикты.",
    href: "/app/deals",
    navKey: "deals",
    group: "crm",
    icon: "deals",
    defaultStatus: "active",
  },
  {
    id: "import",
    name: "Ingestion & Channels",
    version: "1.0.0",
    labelKey: "import",
    painEn: "Leads scattered across CSV files, Facebook lead ads, Telegram, and Viber channels.",
    painRu: "Лиды раскиданы по CSV-файлам, лид-формам Facebook, Telegram и Viber.",
    descriptionEn: "Channels & Ingestion: CSV plus Telegram, Viber, and Facebook Lead Ads in Marketplace.",
    descriptionRu: "Каналы и захват: CSV плюс Telegram, Viber и Facebook Lead Ads в Маркетплейсе.",
    href: "/app/import",
    navKey: "import",
    group: "system",
    icon: "import",
    defaultStatus: "active",
  },
  {
    id: "companies",
    name: "Company Directory",
    version: "1.0.0",
    labelKey: "companies",
    painEn: "Account context scattered across notes and browser tabs.",
    painRu: "Контекст аккаунта размазан по заметкам и вкладкам.",
    descriptionEn: "Company directory linked to leads, deals, and activity.",
    descriptionRu: "Справочник компаний, связанный с лидами, сделками и активностью.",
    href: "/app/companies",
    navKey: "companies",
    group: "crm",
    icon: "companies",
    defaultStatus: "active",
  },
  {
    id: "tasks",
    name: "Actionable Tasks",
    version: "1.0.0",
    labelKey: "tasks",
    painEn: "Follow-ups slip when reminders live outside the desk.",
    painRu: "Follow-up срываются, если напоминания живут вне рабочего стола.",
    descriptionEn: "Task checklist tied to leads so nothing goes cold unnoticed.",
    descriptionRu: "Чеклист задач по лидам — ничего не стынет незамеченным.",
    href: "/app/tasks",
    navKey: "tasks",
    group: "crm",
    icon: "tasks",
    defaultStatus: "active",
  },
  {
    id: "metrics",
    name: "Model & Desk Metrics",
    version: "1.0.0",
    labelKey: "metrics",
    painEn: "No proof the ranking model beats chronological work.",
    painRu: "Нет доказательств, что ранжирование лучше хронологии.",
    descriptionEn: "Offline AUC, lift, and precision@K vs chronological baseline.",
    descriptionRu: "Офлайн AUC, lift и precision@K против хронологического baseline.",
    href: "/app/metrics",
    navKey: "metrics",
    group: "system",
    icon: "metrics",
    defaultStatus: "active",
  },
  {
    id: "workflow",
    name: "Routing & Automations",
    version: "0.9.0",
    labelKey: "workflow",
    painEn: "Manual routing is slow — leads sit unassigned waiting for reps to claim them.",
    painRu: "Ручной роутинг тормозит продажи — лиды лежат нераспределёнными.",
    descriptionEn: "Auto-routing rules, stage automation, SLA triggers, and escalation policies.",
    descriptionRu: "Правила авто-роутинга, автоматизация смены стадий, SLA-триггеры и эскалации.",
    href: "/app/workflow",
    navKey: "workflow",
    group: "system",
    icon: "workflow",
    defaultStatus: "inactive",
  },
  {
    id: "campaign",
    name: "Outbound Sequences",
    version: "0.9.0",
    labelKey: "campaign",
    painEn: "Manual 1-on-1 outreach doesn't scale for broad lead lists.",
    painRu: "Ручные точечные касания не масштабируются на большие базы лидов.",
    descriptionEn: "Multi-touch outbound sequences, follow-up cadence, and warm-up automation.",
    descriptionRu: "Многошаговые аутбаунд-последовательности, цепочки follow-up и авто-прогрев.",
    href: "/app/campaign",
    navKey: "campaign",
    group: "crm",
    icon: "campaign",
    defaultStatus: "inactive",
  },
];

export const DEFAULT_PLUGINS: Record<PluginId, boolean> = {
  leads: true,
  inbox: true,
  deals: true,
  companies: true,
  tasks: true,
  metrics: true,
  "ai-scoring": true,
  import: true,
  workflow: false,
  campaign: false,
};

export function listPlugins(): PluginManifest[] {
  return [...PLUGIN_REGISTRY];
}

export function getPlugin(id: string): PluginManifest | undefined {
  return PLUGIN_REGISTRY.find((p) => p.id === id);
}

export function registerPlugin(manifest: PluginManifest): void {
  const idx = PLUGIN_REGISTRY.findIndex((p) => p.id === manifest.id);
  if (idx >= 0) {
    PLUGIN_REGISTRY[idx] = manifest;
  } else {
    PLUGIN_REGISTRY.push(manifest);
  }
}

export function mergePlugins(
  partial?: Partial<Record<PluginId, boolean>> | null
): Record<PluginId, boolean> {
  return { ...DEFAULT_PLUGINS, ...(partial || {}) };
}

export function isPluginEnabled(
  plugins: Record<PluginId, boolean> | undefined,
  id: PluginId
): boolean {
  if (!plugins) return DEFAULT_PLUGINS[id];
  return plugins[id] !== false;
}

export function navPlugins(plugins: Record<PluginId, boolean>) {
  return PLUGIN_REGISTRY.filter(
    (p) => p.href && p.navKey && isPluginEnabled(plugins, p.id as PluginId)
  );
}

/** WordPress-style lifecycle hook contracts */
export type PluginHookEvent = "install" | "activate" | "deactivate" | "uninstall";

export type PluginHookHandler = (context: {
  workspaceId: string;
  pluginId: string;
  config?: Record<string, unknown>;
}) => Promise<void> | void;

const pluginHooks: Map<PluginHookEvent, Set<PluginHookHandler>> = new Map();

export function addPluginHook(event: PluginHookEvent, handler: PluginHookHandler): () => void {
  if (!pluginHooks.has(event)) {
    pluginHooks.set(event, new Set());
  }
  pluginHooks.get(event)!.add(handler);
  return () => {
    pluginHooks.get(event)?.delete(handler);
  };
}

export async function runPluginHooks(
  event: PluginHookEvent,
  context: { workspaceId: string; pluginId: string; config?: Record<string, unknown> }
): Promise<void> {
  const handlers = pluginHooks.get(event);
  if (!handlers) return;
  for (const handler of handlers) {
    await handler(context);
  }
}
