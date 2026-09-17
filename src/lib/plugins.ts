export type PluginId =
  | "leads"
  | "inbox"
  | "deals"
  | "companies"
  | "tasks"
  | "metrics"
  | "ai-scoring"
  | "import"
  | "workflow"
  | "campaign";

export type PluginDef = {
  id: PluginId;
  labelKey: PluginId;
  /** Pain → value copy shown in Settings */
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
  coming?: boolean;
  icon?: string;
  locked?: boolean;
};

export const PLUGIN_REGISTRY: PluginDef[] = [
  {
    id: "inbox",
    labelKey: "inbox",
    painEn: "Too many tools — CRM + email + LinkedIn + notes in separate tabs.",
    painRu: "Слишком много инструментов — CRM, почта, LinkedIn и заметки в разных вкладках.",
    descriptionEn: "Unified inbox: every channel thread in one place with AI reply assist so reps stop context-switching.",
    descriptionRu: "Единый inbox: все каналы в одном месте с AI-ассистентом ответов — без переключения между окнами.",
    href: "/app/inbox",
    navKey: "inbox",
    group: "crm",
    icon: "inbox",
  },
  {
    id: "leads",
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
  },
  {
    id: "ai-scoring",
    labelKey: "ai-scoring",
    painEn: "FIFO queues go cold; generic templates get ignored; channel is guesswork.",
    painRu: "FIFO-очередь стынет; шаблоны игнорируют; канал выбирают наугад.",
    descriptionEn: "ML priority score, best-channel recommendation, explainability, and personalized first-touch / chat AI composer. On by default.",
    descriptionRu: "ML-приоритет, лучший канал, объяснимость и персональный AI-composer. Включён по умолчанию.",
    group: "ai",
    icon: "ai-scoring",
  },
  {
    id: "deals",
    labelKey: "deals",
    painEn: "Pipeline chaos — stages live in spreadsheets and Slack threads.",
    painRu: "Хаос в воронке — стадии в таблицах и Slack.",
    descriptionEn: "Kanban deals board with drag-and-drop stages and instant outcome verdicts.",
    descriptionRu: "Kanban сделок drag-and-drop — честная воронка и моментальные вердикты.",
    href: "/app/deals",
    navKey: "deals",
    group: "crm",
    icon: "deals",
  },
  {
    id: "import",
    labelKey: "import",
    painEn: "Leads scattered across CSV files, Facebook lead ads, Telegram, and Viber channels.",
    painRu: "Лиды раскиданы по CSV-файлам, лид-формам Facebook, Telegram и Viber.",
    descriptionEn: "Channels & Ingestion: CSV today; Facebook Leads, Viber, and Telegram connectors coming next.",
    descriptionRu: "Каналы и захват: CSV сегодня; Facebook Leads, Viber и Telegram — в разработке.",
    href: "/app/import",
    navKey: "import",
    group: "system",
    icon: "import",
  },
  {
    id: "companies",
    labelKey: "companies",
    painEn: "Account context scattered across notes and browser tabs.",
    painRu: "Контекст аккаунта размазан по заметкам и вкладкам.",
    descriptionEn: "Company directory linked to leads, deals, and activity.",
    descriptionRu: "Справочник компаний, связанный с лидами, сделками и активностью.",
    href: "/app/companies",
    navKey: "companies",
    group: "crm",
    icon: "companies",
  },
  {
    id: "tasks",
    labelKey: "tasks",
    painEn: "Follow-ups slip when reminders live outside the CRM.",
    painRu: "Follow-up срываются, если напоминания вне CRM.",
    descriptionEn: "Task checklist tied to leads so nothing goes cold unnoticed.",
    descriptionRu: "Чеклист задач по лидам — ничего не стынет незамеченным.",
    href: "/app/tasks",
    navKey: "tasks",
    group: "crm",
    icon: "tasks",
  },
  {
    id: "metrics",
    labelKey: "metrics",
    painEn: "No proof the ranking model beats chronological work.",
    painRu: "Нет доказательств, что ранжирование лучше хронологии.",
    descriptionEn: "Offline AUC, lift, and precision@K vs chronological baseline.",
    descriptionRu: "Офлайн AUC, lift и precision@K против хронологического baseline.",
    href: "/app/metrics",
    navKey: "metrics",
    group: "system",
    icon: "metrics",
  },
  {
    id: "workflow",
    labelKey: "workflow",
    painEn: "Manual routing is slow — leads sit unassigned waiting for reps to claim them.",
    painRu: "Ручной роутинг тормозит продажи — лиды лежат нераспределёнными.",
    descriptionEn: "Auto-routing rules, stage automation, SLA triggers, and escalation policies.",
    descriptionRu: "Правила авто-роутинга, автоматизация смены стадий, SLA-триггеры и эскалации.",
    href: "/app/workflow",
    navKey: "workflow",
    group: "system",
    coming: true,
    icon: "workflow",
  },
  {
    id: "campaign",
    labelKey: "campaign",
    painEn: "Manual 1-on-1 outreach doesn't scale for broad lead lists.",
    painRu: "Ручные точечные касания не масштабируются на большие базы лидов.",
    descriptionEn: "Multi-touch outbound sequences, follow-up cadence, and warm-up automation.",
    descriptionRu: "Многошаговые аутбаунд-последовательности, цепочки follow-up и авто-прогрев.",
    href: "/app/campaign",
    navKey: "campaign",
    group: "crm",
    coming: true,
    icon: "campaign",
  },
];

export const DEFAULT_PLUGINS: Record<PluginId, boolean> = {
  leads: true,
  inbox: true,
  deals: true,
  companies: true,
  tasks: true,
  metrics: true,
  "ai-scoring": true, // default-on: kill FIFO cold leads
  import: true,
  workflow: false,
  campaign: false,
};

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
    (p) => p.href && p.navKey && !p.coming && isPluginEnabled(plugins, p.id)
  );
}
