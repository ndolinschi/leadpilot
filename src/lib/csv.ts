import Papa from "papaparse";
import type { Lead, Seniority, CompanySettings } from "./types";
import { applyScore } from "./score";
import { generateMessage } from "./messages";

const SENIORITIES: Seniority[] = ["junior", "mid", "senior", "exec"];

function boolish(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapRow(row: Record<string, string>, idx: number): Lead {
  const g = (...keys: string[]) => {
    for (const k of keys) {
      const hit = Object.entries(row).find(
        ([hk]) => hk.toLowerCase().replace(/[\s_]/g, "") === k.toLowerCase().replace(/[\s_]/g, "")
      );
      if (hit && hit[1] !== undefined && hit[1] !== "") return hit[1];
    }
    return "";
  };
  const seniorityRaw = g("seniority") || "mid";
  const seniority = (SENIORITIES.includes(seniorityRaw as Seniority) ? seniorityRaw : "mid") as Seniority;
  const linkedin = g("linkedin", "linkedinurl") || undefined;
  const phone = g("phone", "mobile") || undefined;
  const base: Lead = {
    id: `imp_${Date.now()}_${idx}`,
    name: g("name", "fullname", "contact") || `Lead ${idx + 1}`,
    title: g("title", "jobtitle", "role") || "Unknown",
    company: g("company", "account", "organization") || "Unknown",
    industry: g("industry") || "Other",
    companySize: num(g("companysize", "employees", "size"), 50),
    source: (g("source") || "inbound").toLowerCase(),
    country: (g("country") || "US").toUpperCase().slice(0, 2),
    email: g("email") || `lead${idx}@example.com`,
    phone,
    linkedin,
    lastTouchDays: num(g("lasttouchdays", "dayssincelasttouch"), 14),
    emailsOpened: num(g("emailsopened", "opens")),
    emailsSent: num(g("emailssent", "sends")),
    siteVisits: num(g("sitevisits", "visits", "pageviews")),
    demoRequested: boolish(g("demorequested", "demo")),
    budgetSignal: Math.min(1, Math.max(0, num(g("budgetsignal", "budget"), 0.4))),
    seniority,
    hasLinkedin: Boolean(linkedin),
    hasPhone: Boolean(phone),
    createdAt: new Date().toISOString(),
    outcome: null,
  };
  return applyScore(base);
}

export function parseLeadsCsv(text: string, settings: CompanySettings): { leads: Lead[]; errors: string[] } {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const errors: string[] = [];
  if (parsed.errors.length) errors.push(...parsed.errors.slice(0, 5).map((e) => e.message));
  const leads = (parsed.data || [])
    .filter((r) => Object.values(r).some((v) => String(v).trim()))
    .map((row, i) => {
      const scored = mapRow(row, i);
      return { ...scored, message: generateMessage(scored, scored.channel!, settings) };
    });
  return { leads, errors };
}

export const SAMPLE_CSV = `name,title,company,industry,companySize,source,country,email,lastTouchDays,emailsOpened,emailsSent,siteVisits,demoRequested,budgetSignal,seniority,linkedin,phone
Alex Chen,VP Sales,Nimbus Analytics,SaaS,120,inbound,US,alex.chen@nimbusanalytics.io,3,4,5,12,true,0.8,exec,https://linkedin.com/in/alex-chen,+12025550123
Elena Popescu,Head of Growth,Harbor CRM,SaaS,60,webinar,RO,elena@harborcrm.io,7,2,3,6,false,0.55,senior,,+37369111222
Marcus Silva,SDR,Orbit Freight,Logistics,250,cold,DE,marcus@orbitfreight.io,21,0,2,1,false,0.2,junior,https://linkedin.com/in/marcus-silva,
`;
