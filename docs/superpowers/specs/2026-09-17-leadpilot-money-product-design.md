# LeadPilot — Money Product Design (2026-09-17)

## 1. Problem (Moldova + similar markets)

Agencies, clinics, microfinance, and e-commerce support desks drown in **Facebook / Viber / phone / email**. Work is FIFO, no shared queue, no priority, no verdict. Buying Bitrix/Salesforce is heavy and expensive; WhatsApp Business alone is not a desk.

**Job to be done:** from *find client* → *score who first* → *talk in one place* → *close with verdict* — sellable as a desk, not as “another CRM”.

## 2. ICP (first money) — recommendation

| Priority | Segment | Why they pay |
|----------|---------|--------------|
| **P0** | Digital agencies & lead-gen shops (MD/RO) | Many channels, need queue + SLA for clients |
| **P1** | Clinics / dental / beauty | Missed Viber/FB leads = lost appointments |
| **P2** | Microfinance / e-com support | Volume + compliance-ish audit of outcomes |

**Beachhead:** 1–10 seat agency desk, RO/RU UI, MDL/EUR pricing, CSV + Viber/Telegram connectors first.

## 3. Value proposition (no jargon)

**LeadPilot = Client Operations Desk**  
One queue for every channel. Score who to answer. Talk. Mark verdict. Connectors install like apps. API for your stack.

Diploma wedge kept: ML priority + channel + message (JS now; Jev/LLM later behind modules).

## 4. Architecture approaches

### A — Keep single Next.js + Zustand (status quo+)
- Fast iterates, already live
- **Con:** localStorage ≠ multi-user, no billing, API keys toy, won’t survive first paying customer

### B — Modular monolith (recommended)
- **One repo** `leadpilot` monorepo (pnpm/turborepo):
  - `apps/web` — Next.js UI
  - `packages/core` — domain (leads, threads, scoring ports)
  - `packages/connectors` — CSV/Telegram/Viber/Email/FB manifests+handlers
  - `packages/api` — `/api/v1` contract + OpenAPI
  - `packages/scoring` — ML/Jev adapters
- **Supabase:** Auth, Postgres (tenants, leads, messages, connector installs, API keys hashed), Realtime for inbox, Storage for CSV
- Modules = DB rows + package plugins; marketplace enables installs per workspace
- **Pro:** one deployable product, clear package boundaries, production data, sellable
- **Con:** migration from localStorage one-time cost

### C — Microservices / many repos
- Overkill for beachhead; ops tax; reject for now

**Recommendation: B.**

## 5. Product modules (marketplace)

| Module | Status target | Monetization |
|--------|---------------|--------------|
| Core Desk (queue, leads, verdicts) | included | seat base |
| Conversations | included Growth+ | — |
| Channels CSV | included | — |
| Telegram / Viber connectors | paid add-on or Growth | connector fee |
| Scoring (ML) | included; Jev upgrade | usage |
| Developers API | Growth+ | — |
| Campaigns / Workflow | Phase 2 | add-on |

## 6. Pricing (sell tomorrow)

| Plan | Price | MDL ≈ | Includes |
|------|-------|-------|----------|
| Starter | $49/mo | ~900 | 1 seat, 1k leads, CSV, scoring, queue |
| Growth | $149/mo | ~2700 | 5 seats, 10k leads, Conversations, 1 messenger connector, API |
| Scale | $399/mo | ~7200 | 20 seats, unlimited scoring, SSO later, audit |

Trial: 14 days Growth, card optional later (Lemon/Paddle for MD geography).

## 7. Supabase data model (sketch)

`workspaces`, `memberships`, `leads`, `companies`, `threads`, `messages`, `deals`, `tasks`, `activities`, `connector_installs`, `api_keys` (hash), `outcomes`

RLS by `workspace_id`. Soft delete. Audit log table Phase 2.

## 8. API (keep + harden)

Existing `/api/v1/*` becomes Supabase-backed; Bearer workspace keys; rate limit; OpenAPI truth source.

## 9. UI quality bar (P0 from audit)

- Demo data clearly labeled; empty states that sell the job
- Mobile: list XOR chat (done) — polish density
- Onboarding: 3 steps Import → Score → First conversation
- Marketplace: install → config secrets → test webhook (real)
- Remove remaining “toy” feel; one accent; RO default for MD ICP

## 10. Success metrics (90 days)

- 5 paying workspaces OR 20 trials started
- Median time-to-first-scored-CSV < 10 min
- ≥1 live Viber or Telegram connector in production use

## 11. Non-goals (Phase 1)

Full Bitrix parity, native mobile apps, custom domains paid, multi-region.

## 12. Implementation phases

1. Spec approve → monorepo scaffold + Supabase schema  
2. Migrate desk from Zustand persist → Supabase (keep seed demo mode)  
3. Auth + workspace + billing stub  
4. Harden connectors + API keys  
5. Onboarding + polish UI for MD sale  
