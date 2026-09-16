"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Activity,
  Channel,
  ChatMessage,
  Company,
  CompanySettings,
  Deal,
  DealStage,
  Lead,
  Outcome,
  Task,
  Thread,
} from "@/lib/types";
import { CRM_SEED } from "@/lib/seed-crm";
import { applyScore } from "@/lib/score";
import { generateMessage } from "@/lib/messages";
import { parseLeadsCsv } from "@/lib/csv";

const defaultSettings: CompanySettings = {
  companyName: "LeadPilot",
  voice: "Consultative, concise, value-first. No hype. Mention one concrete outcome.",
  language: "en",
  productPitch:
    "AI lead prioritization with channel recommendation and personalized first-touch messages.",
};

function withMessages(leads: Lead[], settings: CompanySettings): Lead[] {
  return leads.map((l) => {
    const scored = applyScore(l);
    return {
      ...scored,
      message: l.message || generateMessage(scored, scored.channel, settings),
      companyId: l.companyId,
      stage: l.stage,
    };
  });
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

type State = {
  companies: Company[];
  leads: Lead[];
  threads: Thread[];
  messages: ChatMessage[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  settings: CompanySettings;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  resetDemo: () => void;
  updateSettings: (partial: Partial<CompanySettings>) => void;
  updateOutcome: (id: string, outcome: Outcome) => void;
  updateLeadMessage: (id: string, message: string) => void;
  regenerateMessage: (id: string, channel?: Channel) => void;
  importCsv: (text: string) => { count: number; errors: string[] };
  getLead: (id: string) => Lead | undefined;
  rescoreAll: () => void;
  // CRM
  getCompany: (id: string) => Company | undefined;
  getThread: (id: string) => Thread | undefined;
  getThreadMessages: (threadId: string) => ChatMessage[];
  getLeadThreads: (leadId: string) => Thread[];
  sendMessage: (threadId: string, body: string) => void;
  markThreadRead: (threadId: string) => void;
  openOrCreateThread: (leadId: string, channel?: Channel) => string;
  updateDealStage: (dealId: string, stage: DealStage) => void;
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  addActivity: (activity: Omit<Activity, "id">) => void;
};

function seedState(settings: CompanySettings) {
  const seed = CRM_SEED;
  return {
    companies: seed.companies,
    leads: withMessages(seed.leads, settings),
    threads: seed.threads,
    messages: seed.messages,
    deals: seed.deals,
    tasks: seed.tasks,
    activities: seed.activities,
    settings,
  };
}

export const useLeadsStore = create<State>()(
  persist(
    (set, get) => ({
      ...seedState(defaultSettings),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      resetDemo: () =>
        set({
          ...seedState({
            ...defaultSettings,
            language: get().settings.language,
          }),
        }),
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      updateOutcome: (id, outcome) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, outcome } : l)),
          activities: [
            {
              id: uid("act"),
              leadId: id,
              type: "note" as const,
              title: `Outcome: ${outcome ?? "cleared"}`,
              at: new Date().toISOString(),
            },
            ...s.activities,
          ],
        })),
      updateLeadMessage: (id, message) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, message } : l)),
        })),
      regenerateMessage: (id, channel) => {
        const { leads, settings } = get();
        const lead = leads.find((l) => l.id === id);
        if (!lead) return;
        const ch = channel || lead.channel || "email";
        const message = generateMessage(lead, ch, settings);
        set({
          leads: leads.map((l) =>
            l.id === id ? { ...l, message, channel: ch } : l
          ),
        });
      },
      importCsv: (text) => {
        const { settings, leads, companies, activities } = get();
        const { leads: imported, errors } = parseLeadsCsv(text, settings);
        const newCompanies = [...companies];
        const scored = imported.map((l) => {
          let companyId = companies.find((c) => c.name === l.company)?.id;
          if (!companyId) {
            companyId = uid("co");
            newCompanies.push({
              id: companyId,
              name: l.company,
              industry: l.industry,
              size: l.companySize,
              country: l.country,
            });
          }
          return { ...applyScore(l), companyId, message: l.message };
        });
        set({
          companies: newCompanies,
          leads: [...scored, ...leads],
          activities: [
            {
              id: uid("act"),
              type: "import",
              title: `Imported ${scored.length} leads`,
              at: new Date().toISOString(),
            },
            ...activities,
          ],
        });
        return { count: scored.length, errors };
      },
      getLead: (id) => get().leads.find((l) => l.id === id),
      rescoreAll: () =>
        set((s) => ({ leads: withMessages(s.leads, s.settings) })),
      getCompany: (id) => get().companies.find((c) => c.id === id),
      getThread: (id) => get().threads.find((t) => t.id === id),
      getThreadMessages: (threadId) =>
        get()
          .messages.filter((m) => m.threadId === threadId)
          .sort((a, b) => +new Date(a.at) - +new Date(b.at)),
      getLeadThreads: (leadId) =>
        get()
          .threads.filter((t) => t.leadId === leadId)
          .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
      sendMessage: (threadId, body) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread || !body.trim()) return;
        const at = new Date().toISOString();
        const msg: ChatMessage = {
          id: uid("msg"),
          threadId,
          direction: "out",
          body: body.trim(),
          at,
          channel: thread.channel,
        };
        set((s) => ({
          messages: [...s.messages, msg],
          threads: s.threads
            .map((t) =>
              t.id === threadId ? { ...t, updatedAt: at, unread: 0 } : t
            )
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
          activities: [
            {
              id: uid("act"),
              leadId: thread.leadId,
              type: "message_sent",
              title: "Outbound message sent",
              detail: body.trim().slice(0, 80),
              at,
            },
            ...s.activities,
          ],
        }));
      },
      markThreadRead: (threadId) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, unread: 0 } : t
          ),
        })),
      openOrCreateThread: (leadId, channel) => {
        const { leads, threads, messages, activities } = get();
        const lead = leads.find((l) => l.id === leadId);
        if (!lead) return "";
        const ch = channel || lead.channel || "email";
        const existing = threads.find(
          (t) => t.leadId === leadId && t.channel === ch
        );
        if (existing) return existing.id;
        const id = uid("th");
        const at = new Date().toISOString();
        const subject =
          ch === "call"
            ? `Call with ${lead.name}`
            : ch === "linkedin"
              ? `LinkedIn · ${lead.company}`
              : ch === "messenger"
                ? `Chat · ${lead.name.split(" ")[0]}`
                : `Re: ${lead.company} — outreach`;
        const firstBody =
          lead.message ||
          generateMessage(lead, ch, get().settings);
        const sys: ChatMessage = {
          id: uid("msg"),
          threadId: id,
          direction: "system",
          body: "Thread created from lead — recommended channel.",
          at,
          channel: ch,
        };
        const out: ChatMessage = {
          id: uid("msg"),
          threadId: id,
          direction: "out",
          body: firstBody,
          at: new Date(Date.now() + 1000).toISOString(),
          channel: ch,
        };
        set({
          threads: [
            { id, leadId, channel: ch, subject, updatedAt: out.at, unread: 0 },
            ...threads,
          ],
          messages: [...messages, sys, out],
          activities: [
            {
              id: uid("act"),
              leadId,
              type: "message_sent",
              title: "New conversation started",
              detail: subject,
              at,
            },
            ...activities,
          ],
        });
        return id;
      },
      updateDealStage: (dealId, stage) => {
        const deal = get().deals.find((d) => d.id === dealId);
        if (!deal) return;
        const at = new Date().toISOString();
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId ? { ...d, stage, updatedAt: at } : d
          ),
          activities: [
            {
              id: uid("act"),
              leadId: deal.leadId,
              type: "stage_change",
              title: `Deal moved to ${stage}`,
              detail: deal.title,
              at,
            },
            ...s.activities,
          ],
        }));
      },
      toggleTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        })),
      addTask: (task) =>
        set((s) => ({
          tasks: [...s.tasks, { ...task, id: uid("task") }],
        })),
      addActivity: (activity) =>
        set((s) => ({
          activities: [{ ...activity, id: uid("act") }, ...s.activities],
        })),
    }),
    {
      name: "leadpilot-crm-v1",
      partialize: (s) => ({
        companies: s.companies,
        leads: s.leads,
        threads: s.threads,
        messages: s.messages,
        deals: s.deals,
        tasks: s.tasks,
        activities: s.activities,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/** @deprecated alias */
export const useCrmStore = useLeadsStore;
