import type { Lead, Seniority } from "./types";
import { applyScore } from "./score";
import { generateMessage } from "./messages";

const FIRST = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Sam", "Jamie", "Chris", "Pat", "Dana", "Robin", "Cameron", "Drew",
  "Elena", "Marcus", "Sofia", "Noah", "Mia", "Lucas", "Olivia", "Ethan",
  "Amelia", "Liam", "Isabella", "Mason", "Charlotte", "James",
];
const LAST = [
  "Chen", "Patel", "Nguyen", "Kowalski", "Silva", "Andersen", "Rossi",
  "Berg", "Popescu", "Ivanov", "Schmidt", "Dubois", "García", "Kim",
  "Sato", "Okafor", "Williams", "Brown", "Davis", "Miller", "Wilson",
  "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris",
];
const COMPANIES = [
  "Nimbus Analytics", "Ledgerly", "Orbit Freight", "PulseCare", "Shopforge",
  "Quanta Grid", "BrightShelf", "Harbor CRM", "VoltOps", "ClearPath AI",
  "Stacklane", "Northbeam Labs", "Aether Pay", "Fieldnote", "Cobalt Route",
  "Lumen Dental", "Parcelwise", "SynthoBank", "Relay HQ", "Pinecrest Soft",
  "Driftline", "Helix Inventory", "NovaGrid", "SummitOps", "Kite Metrics",
  "Blueform", "Asterisk Health", "CargoNest", "Finch Ledger", "Ripple Retail",
  "Shieldcraft", "Campusly", "ForgeWorks", "MediOrbit", "PayNest",
  "Routewise", "Learnloop", "Vaultspan", "Cartwright Co", "Atlas Clinics",
];
const TITLES: { title: string; seniority: Seniority }[] = [
  { title: "CEO", seniority: "exec" },
  { title: "Founder", seniority: "exec" },
  { title: "VP Sales", seniority: "exec" },
  { title: "Head of Growth", seniority: "senior" },
  { title: "Director of Marketing", seniority: "senior" },
  { title: "Sales Manager", seniority: "senior" },
  { title: "Revenue Operations Lead", seniority: "senior" },
  { title: "Demand Gen Manager", seniority: "mid" },
  { title: "Account Executive", seniority: "mid" },
  { title: "Marketing Specialist", seniority: "mid" },
  { title: "SDR", seniority: "junior" },
  { title: "Business Development Rep", seniority: "junior" },
];
const INDUSTRIES = ["SaaS", "FinTech", "Healthcare", "Logistics", "Retail", "Manufacturing", "EdTech", "Cybersecurity", "Other"];
const SOURCES = ["inbound", "outbound", "webinar", "referral", "linkedin", "cold"];
const COUNTRIES = ["US", "UK", "DE", "NL", "MD", "RO", "UA", "PL", "FR", "CA", "AU", "SE", "SG", "CH"];
const SIZES = [8, 15, 25, 40, 60, 120, 250, 480, 900, 2000, 5000];

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function createSeedLeads(count = 64): Lead[] {
  const rng = mulberry32(20260916);
  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
    const company = pick(rng, COMPANIES);
    const { title, seniority } = pick(rng, TITLES);
    const industry = pick(rng, INDUSTRIES);
    const source = pick(rng, SOURCES);
    const country = pick(rng, COUNTRIES);
    const companySize = pick(rng, SIZES);
    const emailsSent = Math.floor(rng() * 8);
    const emailsOpened = emailsSent === 0 ? 0 : Math.floor(rng() * (emailsSent + 1));
    const siteVisits = Math.floor(rng() * 25);
    const demoRequested = rng() > 0.78;
    const budgetSignal = Math.round(rng() * 100) / 100;
    const lastTouchDays = Math.floor(rng() * 45);
    const hasLinkedin = rng() > 0.18;
    const hasPhone = rng() > 0.35;
    const slug = name.toLowerCase().replace(/\s+/g, ".");
    const domain = company.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".io";

    const base: Lead = {
      id: `lead_${String(i + 1).padStart(3, "0")}`,
      name,
      title,
      company,
      industry,
      companySize,
      source,
      country,
      email: `${slug}@${domain}`,
      phone: hasPhone ? `+1${Math.floor(2000000000 + rng() * 7000000000)}` : undefined,
      linkedin: hasLinkedin ? `https://linkedin.com/in/${slug.replace(".", "-")}` : undefined,
      lastTouchDays,
      emailsOpened,
      emailsSent,
      siteVisits,
      demoRequested,
      budgetSignal,
      seniority,
      hasLinkedin,
      hasPhone,
      createdAt: new Date(Date.UTC(2026, 7, 1 + Math.floor(rng() * 40))).toISOString(),
      outcome: null,
    };

    const scored = applyScore(base);
    const message = generateMessage(scored, scored.channel, {
      companyName: "LeadPilot",
      voice: "Consultative, concise, value-first. No hype. Mention one concrete outcome.",
      language: "en",
      productPitch: "Stop FIFO queues and tool-switching: ML priority, best channel, personalized first-touch — in one CRM inbox.",
    });

    leads.push({ ...scored, message });
  }

  return leads.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export const SEED_LEADS = createSeedLeads(72);
