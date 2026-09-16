export type PluginId =
  | "leads"
  | "inbox"
  | "deals"
  | "companies"
  | "tasks"
  | "metrics"
  | "ai-scoring"
  | "import";

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
    | "import";
  group: "crm" | "system" | "ai";
  locked?: boolean;
};

export const PLUGIN_REGISTRY: PluginDef[] = [
  {
    id: "inbox",
    labelKey: "inbox",
    painEn: "Too many tools — CRM + email + LinkedIn + notes in separate tabs.",
    painRu: "Слишком много инструментов — CRM, почта, LinkedIn и заметки в разных вкладках.",
    descriptionEn: "Unified inbox: every channel thread in one place so SDRs stop context-switching.",
    descriptionRu: "Единый inbox: все каналы в одном месте — без переключения между инструментами.",
    href: "/app/inbox",
    navKey: "inbox",
    group: "crm",
  },
  {
    id: "leads",
    labelKey: "leads",
    painEn: "Leads pile up chronologically; hot buyers wait behind cold ones.",
    painRu: "Лиды копятся хронологически; горячие ждут за холодными.",
    descriptionEn: "Ranked lead list with filters — work the queue by intent, not FIFO.",
    descriptionRu: "Ранжированный список с фильтрами — очередь по intent, не FIFO.",
    href: "/app/leads",
    navKey: "leads",
    group: "crm",
  },
  {
    id: "ai-scoring",
    labelKey: "ai-scoring",
    painEn: "FIFO queues go cold; generic templates get ignored; channel is guesswork.",
    painRu: "FIFO-очередь стынет; шаблоны игнорируют; канал выбирают наугад.",
    descriptionEn: "ML priority score, best-channel recommendation, explainability, and personalized first-touch / chat AI composer. On by default.",
    descriptionRu: "ML-приоритет, лучший канал, объяснимость и персональный AI-composer. Включён по умолчанию.",
    group: "ai",
  },
  {
    id: "deals",
    labelKey: "deals",
    painEn: "Pipeline chaos — stages live in spreadsheets and Slack threads.",
    painRu: "Хаос в воронке — стадии в таблицах и Slack.",
    descriptionEn: "Kanban deals board with drag-and-drop stages to keep pipeline honest.",
    descriptionRu: "Kanban сделок drag-and-drop — честная воронка без хаоса.",
    href: "/app/deals",
    navKey: "deals",
    group: "crm",
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
  },
  {
    id: "import",
    labelKey: "import",
    painEn: "New lists land in CSV and sit unscored for days.",
    painRu: "Новые списки в CSV лежат днями без скоринга.",
    descriptionEn: "CSV import that scores every row on the way in.",
    descriptionRu: "CSV-импорт со скорингом каждой строки при загрузке.",
    href: "/app/import",
    navKey: "import",
    group: "system",
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
    (p) => p.href && p.navKey && isPluginEnabled(plugins, p.id)
  );
}
