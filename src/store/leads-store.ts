"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Activity,
  ApiKeyRecord,
  Channel,
  ChatMessage,
  Company,
  CompanySettings,
  ConnectorState,
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
import { DEFAULT_PLUGINS, getPlugin, mergePlugins, type PluginId } from "@/lib/plugins";
import { activatePlugin, deactivatePlugin } from "@/lib/plugins/wp-activate";
import { activateConnector, deactivateConnector } from "@/lib/connectors/registry";
import type { ConnectorManifest } from "@/lib/connectors/types";
import { LocalDeskRepository } from "@/lib/repo";

const defaultConnectors: Record<string, ConnectorState> = {
  csv: { enabled: true, installed: true },
  telegram: { enabled: true, installed: true },
  viber: { enabled: true, installed: true },
  facebook: { enabled: true, installed: true },
  email: { enabled: true, installed: true },
};

const defaultApiKeys: ApiKeyRecord[] = [
  {
    id: "key_demo_01",
    name: "Demo sample key",
    prefix: "lp_demo_e891b2...",
    hashedKey: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    createdAt: new Date().toISOString(),
  },
];

const defaultSettings: CompanySettings = {
  companyName: "LeadPilot",
  voice: "Consultative, concise, value-first. No hype. Mention one concrete outcome.",
  language: "en",
  productPitch:
    "Stop FIFO queues and tool-switching: ML priority, best channel, personalized first-touch — in one inbox.",
  plugins: { ...DEFAULT_PLUGINS },
  connectors: defaultConnectors,
  apiKeys: defaultApiKeys,
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
  customConnectors: ConnectorManifest[];
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
  // Connectors & API Keys
  addApiKey: (key: ApiKeyRecord) => void;
  revokeApiKey: (id: string) => void;
  toggleConnector: (id: string, enabled: boolean) => void;
  setPluginEnabled: (id: PluginId, enabled: boolean) => void;
  updateConnectorConfig: (id: string, config: Record<string, string | boolean>) => void;
  registerConnector: (manifest: ConnectorManifest) => void;
  receiveWebhookLeadAndMessage: (lead: Lead, message?: ChatMessage) => { leadId: string; threadId: string };
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
    customConnectors: [],
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
        set((s) => ({
          settings: {
            ...s.settings,
            ...partial,
            plugins: mergePlugins({
              ...s.settings.plugins,
              ...(partial.plugins || {}),
            }),
            connectors: {
              ...s.settings.connectors,
              ...(partial.connectors || {}),
            },
          },
        })),
      addApiKey: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            apiKeys: [key, ...(s.settings.apiKeys || [])],
          },
        })),
      revokeApiKey: (id) =>
        set((s) => ({
          settings: {
            ...s.settings,
            apiKeys: (s.settings.apiKeys || []).filter((k) => k.id !== id),
          },
        })),
      toggleConnector: (id, enabled) => {
        const workspaceId = "local-demo";
        // Fire WordPress-style connector lifecycle hooks (real, not mocked)
        void (enabled
          ? activateConnector(workspaceId, id)
          : deactivateConnector(workspaceId, id));
        set((s) => {
          const current = s.settings.connectors || defaultConnectors;
          const entry = current[id] || { installed: true, enabled: false };
          return {
            settings: {
              ...s.settings,
              connectors: {
                ...current,
                [id]: { ...entry, installed: true, enabled },
              },
            },
          };
        });
      },
      setPluginEnabled: (id, enabled) => {
        const manifest = getPlugin(id);
        if (manifest?.locked && !enabled) {
          throw new Error(`Plugin "${id}" is required and cannot be deactivated`);
        }
        // Persist via DeskRepository + wp_plugins lifecycle (local Demo sample today)
        const repo = new LocalDeskRepository({
          settings: get().settings,
        });
        void (enabled ? activatePlugin(repo, id) : deactivatePlugin(repo, id));
        set((s) => ({
          settings: {
            ...s.settings,
            plugins: mergePlugins({
              ...s.settings.plugins,
              [id]: enabled,
            }),
          },
        }));
      },
      updateConnectorConfig: (id, config) =>
        set((s) => {
          const current = s.settings.connectors || defaultConnectors;
          const entry = current[id] || { installed: true, enabled: true };
          return {
            settings: {
              ...s.settings,
              connectors: {
                ...current,
                [id]: {
                  ...entry,
                  config: { ...(entry.config || {}), ...config },
                },
              },
            },
          };
        }),
      registerConnector: (manifest) =>
        set((s) => {
          const exists = s.customConnectors.some((c) => c.id === manifest.id);
          const customConnectors = exists
            ? s.customConnectors.map((c) => (c.id === manifest.id ? manifest : c))
            : [manifest, ...s.customConnectors];
          const connectors = {
            ...(s.settings.connectors || defaultConnectors),
            [manifest.id]: { installed: true, enabled: true },
          };
          return {
            customConnectors,
            settings: { ...s.settings, connectors },
          };
        }),
      receiveWebhookLeadAndMessage: (lead, message) => {
        const { leads, companies, threads, messages, activities } = get();
        const existingLeadIndex = leads.findIndex((l) => l.id === lead.id || (lead.email && l.email === lead.email));
        let activeLead: Lead;
        let nextLeads = [...leads];

        if (existingLeadIndex >= 0) {
          activeLead = { ...leads[existingLeadIndex], ...lead };
          nextLeads[existingLeadIndex] = activeLead;
        } else {
          activeLead = lead;
          nextLeads = [activeLead, ...leads];

          // Check if company exists
          if (!companies.some((c) => c.name === lead.company)) {
            const coId = uid("co");
            set({
              companies: [
                {
                  id: coId,
                  name: lead.company,
                  industry: lead.industry || "Other",
                  size: lead.companySize || 10,
                  country: lead.country || "Moldova",
                },
                ...companies,
              ],
            });
          }
        }

        let targetThreadId = "";
        let nextThreads = [...threads];
        let nextMessages = [...messages];

        if (message) {
          targetThreadId = message.threadId || uid("th");
          const threadIdx = threads.findIndex((t) => t.id === targetThreadId);
          if (threadIdx >= 0) {
            nextThreads[threadIdx] = {
              ...threads[threadIdx],
              updatedAt: message.at,
              unread: (threads[threadIdx].unread || 0) + 1,
            };
          } else {
            nextThreads = [
              {
                id: targetThreadId,
                leadId: activeLead.id,
                channel: message.channel || activeLead.channel || "messenger",
                subject: `${activeLead.channel === "messenger" ? "Chat" : "Conversation"} · ${activeLead.name}`,
                updatedAt: message.at,
                unread: 1,
              },
              ...threads,
            ];
          }
          nextMessages = [message, ...messages];
        }

        const newActivity: Activity = {
          id: uid("act"),
          leadId: activeLead.id,
          type: "message_received",
          title: `Inbound ${activeLead.channel || "webhook"} event received`,
          detail: message?.body?.slice(0, 80) || activeLead.company,
          at: new Date().toISOString(),
        };

        set({
          leads: nextLeads,
          threads: nextThreads,
          messages: nextMessages,
          activities: [newActivity, ...activities],
        });

        return { leadId: activeLead.id, threadId: targetThreadId };
      },
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
      name: "leadpilot-crm-v3",
      partialize: (s) => ({
        companies: s.companies,
        leads: s.leads,
        threads: s.threads,
        messages: s.messages,
        deals: s.deals,
        tasks: s.tasks,
        activities: s.activities,
        settings: s.settings,
        customConnectors: s.customConnectors,
      }),
      onRehydrateStorage: () => (state, err) => {
        if (err) {
          console.error("LeadPilot rehydrate failed", err);
        }
        if (state) {
          state.settings = {
            ...defaultSettings,
            ...state.settings,
            plugins: mergePlugins(state.settings?.plugins),
            connectors: {
              ...defaultConnectors,
              ...(state.settings?.connectors || {}),
            },
            apiKeys: state.settings?.apiKeys?.length ? state.settings.apiKeys : defaultApiKeys,
          };
          state.setHydrated(true);
        } else {
          // ensure UI never sticks on skeleton forever
          useLeadsStore.setState({ hydrated: true });
        }
      },
    }
  )
);

/** @deprecated alias */
export const useCrmStore = useLeadsStore;
