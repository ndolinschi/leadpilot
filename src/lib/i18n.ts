import type { Lang } from "./types";

const en = {
  brand: "LeadPilot",
  tagline: "Prioritize leads. Pick the channel. Send the right first touch.",
  nav: {
    product: "Product", how: "How it works", metrics: "Metrics", pricing: "Pricing",
    demo: "Open Demo", dashboard: "Dashboard", import: "Import", settings: "Settings",
    backMarketing: "Marketing",
  },
  landing: {
    heroTitle: "Close more deals by talking to the right leads first",
    heroSub: "LeadPilot scores every lead, recommends the best channel, and drafts a personalized first-touch message — with explainable factors your team can trust.",
    ctaDemo: "Try live demo", ctaHow: "See how it works",
    problemTitle: "The problem",
    problemBody: "Sales teams drown in inbound and outbound noise. Chronological queues waste senior time on cold leads while hot buyers go quiet.",
    productTitle: "The product",
    productBody: "A machine-learning pipeline that ranks leads 0–100, chooses email / call / LinkedIn / messenger, and generates a ready-to-send first message — with SHAP-like reasons.",
    howTitle: "How it works",
    step1: "Ingest lead signals", step1d: "CRM fields, engagement, firmographics",
    step2: "Priority score", step2d: "Calibrated probability → 0–100",
    step3: "Best channel", step3d: "Softmax over channel utilities",
    step4: "Personalized message", step4d: "Templates or LLM via API key",
    metricsTitle: "Offline evaluation (seed CRM)",
    metricAuc: "AUC", metricLift: "Lift @ 20%", metricReply: "Reply-rate lift",
    pricingTitle: "Simple pricing", starter: "Starter", growth: "Growth", scale: "Scale",
    perMonth: "/ mo", ctaFinal: "Start with the interactive demo — no signup",
    footer: "Diploma product · ML lead prioritization · Client-side demo store",
  },
  app: {
    leads: "Leads", search: "Search name, company, email…",
    filterChannel: "Channel", filterIndustry: "Industry", filterSource: "Source",
    minScore: "Min score", all: "All", score: "Score", channel: "Channel",
    company: "Company", title: "Title", source: "Source", outcome: "Outcome",
    empty: "No leads match filters", loading: "Loading leads…",
  },
  detail: {
    priority: "Priority score", probability: "Conversion probability",
    recommended: "Recommended channel", message: "First-touch message",
    regenerate: "Regenerate", copy: "Copy message", copied: "Copied",
    explain: "Why this score", raise: "Raised score", lower: "Lowered score",
    outcome: "Mark outcome", won: "Won", lost: "Lost", noReply: "No reply",
    profile: "Lead profile", channelMix: "Channel probabilities",
  },
  importPage: {
    title: "Import leads",
    subtitle: "Upload a CSV. We’ll map common columns and score every row.",
    choose: "Choose CSV", preview: "Preview", import: "Import & score",
    sample: "Download sample CSV",
    hint: "Accepted headers: name, title, company, industry, companySize, source, country, email, lastTouchDays, emailsOpened, emailsSent, siteVisits, demoRequested, budgetSignal, seniority",
  },
  metricsPage: {
    title: "Model metrics",
    subtitle: "Precomputed offline evaluation on synthetic CRM holdout (not live production telemetry).",
    auc: "ROC AUC", lift: "Lift at top 20%", baseline: "vs chronological baseline", precision: "Precision @ K",
  },
  settingsPage: {
    title: "Settings", company: "Company name", voice: "Brand voice", pitch: "Product pitch",
    language: "UI language",
    apiNote: "API keys: set OPENAI_API_KEY or ANTHROPIC_API_KEY in the server environment. Keys are never stored in localStorage.",
    reset: "Reset demo data", save: "Save settings",
  },
  channels: { email: "Email", call: "Call", linkedin: "LinkedIn", messenger: "Messenger" },
};

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};
type Dict = DeepString<typeof en>;

const ru: Dict = {
  brand: "LeadPilot",
  tagline: "Приоритизация лидов. Канал. Персональное первое сообщение.",
  nav: {
    product: "Продукт", how: "Как работает", metrics: "Метрики", pricing: "Цены",
    demo: "Открыть демо", dashboard: "Дашборд", import: "Импорт", settings: "Настройки",
    backMarketing: "Маркетинг",
  },
  landing: {
    heroTitle: "Закрывайте больше сделок, начиная с правильных лидов",
    heroSub: "LeadPilot оценивает каждый лид, рекомендует канал и готовит первое сообщение — с объяснимыми факторами, которым команда может доверять.",
    ctaDemo: "Живое демо", ctaHow: "Как это работает",
    problemTitle: "Проблема",
    problemBody: "Отделы продаж тонут в шуме. Хронологические очереди тратят время на холодных лидов, пока горячие покупатели молчат.",
    productTitle: "Продукт",
    productBody: "ML-пайплайн: оценка 0–100, выбор email / звонок / LinkedIn / мессенджер и готовое первое сообщение — с SHAP-подобными причинами.",
    howTitle: "Как работает",
    step1: "Сигналы лида", step1d: "CRM, вовлечение, firmographics",
    step2: "Приоритет", step2d: "Калиброванная вероятность → 0–100",
    step3: "Лучший канал", step3d: "Softmax по полезности каналов",
    step4: "Сообщение", step4d: "Шаблоны или LLM по API-ключу",
    metricsTitle: "Офлайн-оценка (seed CRM)",
    metricAuc: "AUC", metricLift: "Lift @ 20%", metricReply: "Рост ответов",
    pricingTitle: "Простые тарифы", starter: "Starter", growth: "Growth", scale: "Scale",
    perMonth: "/ мес", ctaFinal: "Начните с интерактивного демо — без регистрации",
    footer: "Дипломный продукт · ML-приоритизация · Клиентское демо-хранилище",
  },
  app: {
    leads: "Лиды", search: "Поиск: имя, компания, email…",
    filterChannel: "Канал", filterIndustry: "Отрасль", filterSource: "Источник",
    minScore: "Мин. score", all: "Все", score: "Оценка", channel: "Канал",
    company: "Компания", title: "Должность", source: "Источник", outcome: "Исход",
    empty: "Нет лидов по фильтрам", loading: "Загрузка лидов…",
  },
  detail: {
    priority: "Приоритет", probability: "Вероятность конверсии",
    recommended: "Рекомендуемый канал", message: "Первое сообщение",
    regenerate: "Перегенерировать", copy: "Копировать", copied: "Скопировано",
    explain: "Почему такая оценка", raise: "Повысили", lower: "Понизили",
    outcome: "Отметить исход", won: "Выигран", lost: "Проигран", noReply: "Без ответа",
    profile: "Профиль лида", channelMix: "Вероятности каналов",
  },
  importPage: {
    title: "Импорт лидов",
    subtitle: "Загрузите CSV — сопоставим колонки и оценим каждую строку.",
    choose: "Выбрать CSV", preview: "Превью", import: "Импорт и оценка",
    sample: "Скачать sample CSV",
    hint: "Заголовки: name, title, company, industry, companySize, source, country, email, lastTouchDays, emailsOpened, emailsSent, siteVisits, demoRequested, budgetSignal, seniority",
  },
  metricsPage: {
    title: "Метрики модели",
    subtitle: "Превычисленные офлайн-метрики на synthetic CRM holdout (не live-телеметрия).",
    auc: "ROC AUC", lift: "Lift на топ-20%", baseline: "vs хронологический baseline", precision: "Precision @ K",
  },
  settingsPage: {
    title: "Настройки", company: "Название компании", voice: "Голос бренда", pitch: "Описание продукта",
    language: "Язык UI",
    apiNote: "API-ключи: задайте OPENAI_API_KEY или ANTHROPIC_API_KEY в окружении сервера. Ключи никогда не хранятся в localStorage.",
    reset: "Сбросить демо-данные", save: "Сохранить",
  },
  channels: { email: "Email", call: "Звонок", linkedin: "LinkedIn", messenger: "Мессенджер" },
};

export function t(lang: Lang): Dict {
  return lang === "ru" ? ru : en;
}
export type I18n = Dict;
