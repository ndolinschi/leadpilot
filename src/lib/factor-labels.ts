import type { Lang } from "./types";

/** Bilingual explainability labels keyed by score feature id. */
const LABELS: Record<string, { en: string; ru: string }> = {
  demoRequested: { en: "Demo requested", ru: "Запрос демо" },
  budgetSignal: { en: "Budget signal", ru: "Сигнал бюджета" },
  emailsOpened: { en: "Emails opened", ru: "Открытия писем" },
  siteVisits: { en: "Site visits", ru: "Визиты на сайт" },
  openRate: { en: "Email open rate", ru: "Open rate писем" },
  recency: { en: "Days since last touch", ru: "Дни с последнего контакта" },
  companySize: { en: "Company size", ru: "Размер компании" },
  seniority: { en: "Seniority", ru: "Уровень должности" },
  source: { en: "Lead source", ru: "Источник лида" },
  industry: { en: "Industry", ru: "Отрасль" },
  country: { en: "Market / country", ru: "Рынок / страна" },
};

export function factorLabel(
  feature: string,
  fallback: string,
  lang: Lang,
  detail?: string
): string {
  const base = LABELS[feature]?.[lang] ?? fallback;
  if (!detail) return base;
  return lang === "ru" ? `${base} (${detail})` : `${base} (${detail})`;
}

/** Extract parenthetical detail from English score label, e.g. "Seniority (exec)". */
export function factorDetailFromLabel(label: string): string | undefined {
  const m = label.match(/\(([^)]+)\)\s*$/);
  return m?.[1];
}
