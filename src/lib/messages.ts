import type { Channel, CompanySettings, Lang, Lead } from "./types";

export function buildPrompt(
  lead: Lead,
  channel: Channel,
  settings: Pick<CompanySettings, "companyName" | "voice" | "productPitch" | "language">
): string {
  return [
    `Write a personalized first-touch ${channel} message.`,
    `Language: ${settings.language === "ru" ? "Russian" : "English"}.`,
    `Sender company: ${settings.companyName}.`,
    `Product: ${settings.productPitch}.`,
    `Voice: ${settings.voice}.`,
    `Lead: ${lead.name}, ${lead.title} at ${lead.company} (${lead.industry}, ${lead.companySize} employees, ${lead.country}).`,
    `Source: ${lead.source}. Engagement: ${lead.emailsOpened}/${lead.emailsSent} opens, ${lead.siteVisits} site visits, demoRequested=${lead.demoRequested}.`,
    `Keep it under 90 words for email/linkedin/messenger; under 40 words for call opener. No fake claims.`,
  ].join("\n");
}

function opener(lead: Lead, lang: Lang): string {
  return lang === "ru" ? `Здравствуйте, ${lead.name.split(" ")[0]}!` : `Hi ${lead.name.split(" ")[0]},`;
}

function valueHook(lead: Lead, settings: CompanySettings, lang: Lang): string {
  const pitch = settings.productPitch;
  if (lang === "ru") {
    if (lead.demoRequested) return `Видели, что вы запросили демо — ${settings.companyName} помогает командам вроде ${lead.company} быстрее квалифицировать лиды: ${pitch}`;
    if (lead.siteVisits >= 8) return `Заметили интерес к продукту со стороны ${lead.company}. ${settings.companyName}: ${pitch}`;
    if (lead.source === "webinar") return `После вебинара подумал(а), что ${lead.company} может ускорить follow-up: ${pitch}`;
    return `${settings.companyName} помогает B2B-командам в ${lead.industry}: ${pitch}`;
  }
  if (lead.demoRequested) return `Saw you requested a demo — ${settings.companyName} helps teams like ${lead.company} prioritize inbound faster: ${pitch}`;
  if (lead.siteVisits >= 8) return `Noticed ${lead.company} exploring the product. ${settings.companyName}: ${pitch}`;
  if (lead.source === "referral") return `A mutual connection suggested ${lead.company} might care about this — ${pitch}`;
  if (lead.source === "webinar") return `Following the webinar, I thought ${lead.company} could tighten follow-up: ${pitch}`;
  return `${settings.companyName} helps ${lead.industry} teams: ${pitch}`;
}

function cta(channel: Channel, lang: Lang): string {
  if (lang === "ru") {
    switch (channel) {
      case "call": return "Удобно коротко созвониться на 10 минут на этой неделе?";
      case "linkedin": return "Если актуально — ответьте сюда, пришлю 1-страничный пример.";
      case "messenger": return "Ок на 2 минуты голосом или текстом сегодня/завтра?";
      default: return "Есть 15 минут на этой неделе сравнить ваш текущий процесс с коротким разбором?";
    }
  }
  switch (channel) {
    case "call": return "Open to a 10-minute call this week?";
    case "linkedin": return "If useful, reply here and I’ll share a one-pager with examples.";
    case "messenger": return "OK for a 2-minute voice note or chat today/tomorrow?";
    default: return "Worth 15 minutes this week to compare your current process to a short teardown?";
  }
}

export function generateMessage(lead: Lead, channel: Channel, settings: CompanySettings): string {
  const lang = settings.language;
  const first = opener(lead, lang);
  const hook = valueHook(lead, settings, lang);
  const ask = cta(channel, lang);
  if (channel === "call") {
    return lang === "ru"
      ? `${first} Это ${settings.companyName}. ${hook} ${ask}`
      : `${first} This is ${settings.companyName}. ${hook} ${ask}`;
  }
  if (channel === "linkedin" || channel === "messenger") {
    return `${first}\n\n${hook}\n\n${ask}`;
  }
  const subjectHint = lang === "ru"
    ? `Тема: идея для ${lead.company} — приоритезация лидов`
    : `Subject: quick idea for ${lead.company} — lead prioritization`;
  const sign = lang === "ru"
    ? `\n\nС уважением,\nкоманда ${settings.companyName}`
    : `\n\nBest,\n${settings.companyName} team`;
  return `${subjectHint}\n\n${first}\n\n${hook}\n\n${ask}${sign}`;
}
