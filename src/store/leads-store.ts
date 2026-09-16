"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Channel, CompanySettings, Lead, Outcome } from "@/lib/types";
import { SEED_LEADS } from "@/lib/seed-leads";
import { applyScore } from "@/lib/score";
import { generateMessage } from "@/lib/messages";
import { parseLeadsCsv } from "@/lib/csv";

const defaultSettings: CompanySettings = {
  companyName: "LeadPilot",
  voice: "Consultative, concise, value-first. No hype. Mention one concrete outcome.",
  language: "en",
  productPitch: "AI lead prioritization with channel recommendation and personalized first-touch messages.",
};

type State = {
  leads: Lead[];
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
};

function withMessages(leads: Lead[], settings: CompanySettings): Lead[] {
  return leads.map((l) => {
    const scored = applyScore(l);
    return {
      ...scored,
      message: l.message || generateMessage(scored, scored.channel, settings),
    };
  });
}

export const useLeadsStore = create<State>()(
  persist(
    (set, get) => ({
      leads: withMessages(SEED_LEADS, defaultSettings),
      settings: defaultSettings,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      resetDemo: () =>
        set({
          leads: withMessages(SEED_LEADS, get().settings),
          settings: { ...defaultSettings, language: get().settings.language },
        }),
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      updateOutcome: (id, outcome) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, outcome } : l)),
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
          leads: leads.map((l) => (l.id === id ? { ...l, message, channel: ch } : l)),
        });
      },
      importCsv: (text) => {
        const { settings, leads } = get();
        const { leads: imported, errors } = parseLeadsCsv(text, settings);
        set({ leads: [...imported, ...leads] });
        return { count: imported.length, errors };
      },
      getLead: (id) => get().leads.find((l) => l.id === id),
      rescoreAll: () => set((s) => ({ leads: withMessages(s.leads, s.settings) })),
    }),
    {
      name: "leadpilot-v1",
      partialize: (s) => ({ leads: s.leads, settings: s.settings }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
