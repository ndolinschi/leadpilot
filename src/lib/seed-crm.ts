import type {
  Activity,
  Channel,
  ChatMessage,
  Company,
  Deal,
  DealStage,
  Lead,
  Task,
  Thread,
} from "./types";
import { createSeedLeads } from "./seed-leads";

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

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

const SDR_OUTBOUNDS = [
  (name: string, company: string) =>
    `Hi ${name.split(" ")[0]}, noticed ${company} is scaling outbound — we help teams prioritize the top 20% of leads that convert. Open to a quick look?`,
  (name: string, company: string) =>
    `Hey ${name.split(" ")[0]} — saw ${company}'s recent hiring in sales. Curious if lead prioritization is on your radar this quarter?`,
  (name: string) =>
    `Hi ${name.split(" ")[0]}, following up on the demo request. Happy to walk through how ML scoring cuts time-to-first-touch. Free Thursday?`,
  (name: string, company: string) =>
    `${name.split(" ")[0]}, short note: teams like ${company} use channel-aware scoring to lift reply rates ~1.6×. Worth comparing notes?`,
  (name: string) =>
    `Quick touch, ${name.split(" ")[0]} — sharing a one-pager on priority scoring vs chronological queues. Reply if useful.`,
];

const LEAD_INBOUNDS = [
  "Thanks — interesting. Can you send a short case study for B2B SaaS?",
  "We're evaluating tools this quarter. What's typical time-to-value?",
  "Got it. Our SDRs are drowning in inbound. Can we book 20 min next week?",
  "Not a priority right now, but keep me posted on the LinkedIn channel model.",
  "Looks promising. Who else in our industry is using this?",
  "Can you share pricing and whether it works with HubSpot?",
  "Interesting approach. Do you support RU + EN message generation?",
  "Following up — our RevOps lead wants to see the explainability UI.",
];

const CALL_NOTES = [
  "Call note: discussed demo pipeline, interest in priority inbox. Next: send proposal.",
  "Voicemail left — mentioned webinar follow-up and ML scoring lift.",
  "Discovery call: pain = chronological queue. Budget soft yes. Stage → qualified.",
];

export type CrmSeed = {
  companies: Company[];
  leads: Lead[];
  threads: Thread[];
  messages: ChatMessage[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
};

export function createCrmSeed(leadCount = 40): CrmSeed {
  const rng = mulberry32(20260916);
  const rawLeads = createSeedLeads(leadCount);

  // Companies from unique company names
  const companyMap = new Map<string, Company>();
  for (const lead of rawLeads) {
    if (!companyMap.has(lead.company)) {
      const id = `co_${String(companyMap.size + 1).padStart(3, "0")}`;
      const domain = lead.company.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".io";
      companyMap.set(lead.company, {
        id,
        name: lead.company,
        industry: lead.industry,
        size: lead.companySize,
        country: lead.country,
        domain,
        website: `https://${domain}`,
      });
    }
  }
  const companies = Array.from(companyMap.values());

  const leads: Lead[] = rawLeads.map((l) => ({
    ...l,
    companyId: companyMap.get(l.company)?.id,
    stage: (["new", "qualified", "proposal", "won", "lost"] as DealStage[])[
      Math.min(4, Math.floor((100 - (l.score ?? 50)) / 22))
    ],
  }));

  const threads: Thread[] = [];
  const messages: ChatMessage[] = [];
  const activities: Activity[] = [];
  const deals: Deal[] = [];
  const tasks: Task[] = [];

  // ~20 chat threads with multi-message history
  const threadLeads = [...leads].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 22);
  threadLeads.forEach((lead, ti) => {
    const channel = (lead.channel || pick(rng, ["email", "linkedin", "messenger", "call"] as Channel[])) as Channel;
    const threadId = `th_${String(ti + 1).padStart(3, "0")}`;
    const msgCount = 3 + Math.floor(rng() * 5); // 3–7 messages
    const unread = rng() > 0.55 ? Math.floor(rng() * 3) : 0;
    let lastAt = hoursAgo(2 + ti * 3 + Math.floor(rng() * 40));

    const subject =
      channel === "call"
        ? `Call with ${lead.name}`
        : channel === "linkedin"
          ? `LinkedIn · ${lead.company}`
          : channel === "messenger"
            ? `Chat · ${lead.name.split(" ")[0]}`
            : `Re: ${lead.company} — priority scoring`;

    const threadMsgs: ChatMessage[] = [];
    for (let m = 0; m < msgCount; m++) {
      const isOut = m % 2 === 0;
      const at = new Date(new Date(lastAt).getTime() - (msgCount - m) * (2 + rng() * 18) * 3600_000).toISOString();
      let body: string;
      if (channel === "call") {
        body = isOut ? CALL_NOTES[m % CALL_NOTES.length]! : "Prospect confirmed interest; asked for ROI slide.";
      } else if (isOut) {
        body = SDR_OUTBOUNDS[m % SDR_OUTBOUNDS.length]!(lead.name, lead.company);
      } else {
        body = LEAD_INBOUNDS[Math.floor(rng() * LEAD_INBOUNDS.length)]!;
      }
      let attachment: ChatMessage["attachment"] = undefined;
      if (ti === 0 && m === 0) {
        attachment = {
          name: "LeadPilot_Product_Overview.pdf",
          size: "2.4 MB",
          type: "pdf",
        };
      } else if (ti === 1 && m === 0) {
        attachment = {
          name: "Enterprise_Case_Study.pdf",
          size: "1.8 MB",
          type: "pdf",
        };
      }

      const msg: ChatMessage = {
        id: `msg_${threadId}_${m + 1}`,
        threadId,
        direction: isOut ? "out" : "in",
        body,
        at,
        channel,
        ...(attachment ? { attachment } : {}),
      };
      threadMsgs.push(msg);
      messages.push(msg);
    }
    lastAt = threadMsgs[threadMsgs.length - 1]?.at || lastAt;

    threads.push({
      id: threadId,
      leadId: lead.id,
      channel,
      subject,
      updatedAt: lastAt,
      unread,
    });

    activities.push({
      id: `act_msg_${threadId}`,
      leadId: lead.id,
      type: unread > 0 ? "message_received" : "message_sent",
      title: unread > 0 ? "New inbound reply" : "Outbound message sent",
      detail: subject,
      at: lastAt,
    });
  });

  // Special rich seeding for th_001 (first thread)
  if (threads[0]) {
    const th1 = threads[0];
    th1.unread = 2;
    const l1 = leads.find((l) => l.id === th1.leadId) || leads[0];

    // Replace th_001 messages with a curated rich dialogue
    const th1Msgs: ChatMessage[] = [
      {
        id: "msg_sys_001",
        threadId: th1.id,
        direction: "system",
        body: "Channels / Import: Inbound captured from high-intent form · Channel: " + th1.channel,
        at: hoursAgo(72),
        channel: th1.channel,
      },
      {
        id: "msg_sys_002",
        threadId: th1.id,
        direction: "system",
        body: `AI Scoring: Priority ${(l1.score ?? 94.2).toFixed(1)}/100 · Softmax recommended ${th1.channel} · Intent: High`,
        at: hoursAgo(71),
        channel: th1.channel,
      },
      {
        id: `msg_${th1.id}_1`,
        threadId: th1.id,
        direction: "out",
        body: `Hi ${l1.name.split(" ")[0]}, noticed ${l1.company} is scaling outbound routine — we help teams prioritize the top 20% of leads that actually convert. Open to a quick look?`,
        at: hoursAgo(70),
        channel: th1.channel,
        attachment: {
          name: "LeadPilot_Product_Overview.pdf",
          size: "2.4 MB",
          type: "pdf",
        },
      },
      {
        id: `msg_${th1.id}_2`,
        threadId: th1.id,
        direction: "in",
        body: "Thanks! We're evaluating tools this quarter to replace our call-center routine. Can you share security compliance and typical time-to-value?",
        at: hoursAgo(48),
        channel: th1.channel,
      },
      {
        id: "msg_sys_003",
        threadId: th1.id,
        direction: "system",
        body: "AI suggested: ask for budget, share security one-pager, and propose 15-min walkthrough.",
        at: hoursAgo(47),
        channel: th1.channel,
      },
      {
        id: `msg_${th1.id}_3`,
        threadId: th1.id,
        direction: "out",
        body: "Definitely! Attaching our SOC2 compliance overview and deployment guide. We usually go from CSV ingestion to live scoring in under 60 seconds. Free Thursday at 2 PM?",
        at: hoursAgo(24),
        channel: th1.channel,
        attachment: {
          name: "SOC2_Security_Overview.pdf",
          size: "1.6 MB",
          type: "pdf",
        },
      },
      {
        id: `msg_${th1.id}_4`,
        threadId: th1.id,
        direction: "in",
        body: "Thursday 2 PM works for our team. Attaching our vendor onboarding checklist — looking forward to comparing notes.",
        at: hoursAgo(2),
        channel: th1.channel,
        attachment: {
          name: "Vendor_Security_Checklist.pdf",
          size: "940 KB",
          type: "pdf",
        },
      },
      {
        id: "msg_sys_004",
        threadId: th1.id,
        direction: "system",
        body: "AI suggested: calendar invite sent · Recommended verdict: Qualified / In Proposal.",
        at: hoursAgo(1.5),
        channel: th1.channel,
      },
    ];

    // Remove old th_001 messages and push curated ones
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].threadId === th1.id) {
        messages.splice(i, 1);
      }
    }
    messages.push(...th1Msgs);
    th1.updatedAt = hoursAgo(1.5);
  }

  // 12 deals across stages
  const stageCycle: DealStage[] = [
    "new", "new", "qualified", "qualified", "qualified",
    "proposal", "proposal", "proposal", "won", "won", "lost", "lost",
  ];
  const dealLeads = [...leads].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12);
  dealLeads.forEach((lead, i) => {
    const stage = stageCycle[i]!;
    const value = Math.round((8_000 + rng() * 92_000) / 500) * 500;
    const updatedAt = daysAgo(Math.floor(rng() * 14));
    deals.push({
      id: `deal_${String(i + 1).padStart(3, "0")}`,
      leadId: lead.id,
      title: `${lead.company} — LeadPilot`,
      value,
      stage,
      updatedAt,
    });
    activities.push({
      id: `act_deal_${i + 1}`,
      leadId: lead.id,
      type: "stage_change",
      title: `Deal moved to ${stage}`,
      detail: `$${value.toLocaleString()}`,
      at: updatedAt,
    });
  });

  // Tasks
  const taskTitles = [
    "Follow up on demo request",
    "Send ROI one-pager",
    "Book discovery call",
    "Confirm HubSpot sync path",
    "Share explainability screenshot",
    "Prepare proposal draft",
    "Nudge LinkedIn thread",
    "Update deal stage after call",
    "Import webinar attendees",
    "Review top-10 priority leads",
  ];
  taskTitles.forEach((title, i) => {
    const lead = leads[i % leads.length];
    tasks.push({
      id: `task_${String(i + 1).padStart(3, "0")}`,
      leadId: lead?.id,
      title,
      due: daysAgo(-Math.floor(rng() * 10)), // due in future (negative daysAgo = future)
      done: rng() > 0.72,
    });
  });

  // Extra score / note activities
  leads.slice(0, 15).forEach((lead, i) => {
    activities.push({
      id: `act_score_${i + 1}`,
      leadId: lead.id,
      type: "score",
      title: `Priority scored ${lead.score}`,
      detail: `Recommended channel: ${lead.channel}`,
      at: daysAgo(Math.floor(rng() * 20)),
    });
  });

  activities.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  threads.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return { companies, leads, threads, messages, deals, tasks, activities };
}

export const CRM_SEED = createCrmSeed(40);
