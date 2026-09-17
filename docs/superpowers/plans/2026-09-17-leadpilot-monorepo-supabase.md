# LeadPilot Monorepo + Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn LeadPilot into a sellable Client Operations Desk: one GitHub monorepo, modular packages, Supabase auth/DB, Vercel Hobby deploy — beachhead digital agencies MD/RO.

**Architecture:** pnpm + Turborepo monorepo. `apps/web` (Next.js UI) talks to Supabase (Auth, Postgres RLS, Realtime) and keeps `/api/v1` as the public integration surface. Connectors live in `packages/connectors`. Domain types/scoring ports in `packages/core` + `packages/scoring`. Demo mode remains for anonymous visitors; signed-in workspaces use Supabase.

**Tech Stack:** Next.js 16, TypeScript, Tailwind, shadcn, Zustand (UI only), Supabase JS, pnpm workspaces, Turbo, Vercel Hobby, optional TypeSafe Jev behind scoring adapter.

## Global Constraints

- Russian product chat with Nichita; app UI EN+RU (RO later)
- No paid Vercel upgrades; Hobby only
- No “CRM/plugin” jargon in customer copy — Desk / Queue / Conversations / Marketplace / Connectors
- Coding CLIs: Agy → Devin → Grok Build last; `--dangerously-skip-permissions` / `--always-approve`
- Never commit secrets; env via Vercel + `.env.local`
- Preserve diploma ML path (JS logistic now; Jev adapter later)
- Zustand selectors must stay reference-stable (useMemo for derived arrays)

## File map (target)

```
leadpilot/
  apps/web/                 # current Next app moved here
  packages/core/            # domain types, ports
  packages/connectors/      # csv, telegram, viber, email, facebook
  packages/scoring/         # scoreLead, channel, jev adapter stub
  packages/api-contract/    # openapi.json source of truth
  supabase/
    migrations/0001_init.sql
    seed.sql
  docs/superpowers/specs/...
  pnpm-workspace.yaml
  turbo.json
  package.json
```

---

### Task 1: Monorepo scaffold (keep app green)

**Files:**
- Create: `pnpm-workspace.yaml`, `turbo.json`, root `package.json`
- Move: current Next app → `apps/web` (or in-place packages without full move if safer: `packages/*` alongside `src` first — prefer gradual: add packages first, then relocate `src` to `apps/web` in Task 1b)
- Test: `pnpm -C apps/web build` exit 0

- [ ] **Step 1:** Add pnpm workspace + turbo without breaking current `npm run build`
- [ ] **Step 2:** Extract `packages/core` with shared types from `src/lib/types.ts`
- [ ] **Step 3:** Extract `packages/connectors` from `src/lib/connectors`
- [ ] **Step 4:** Extract `packages/scoring` from scoring libs
- [ ] **Step 5:** Commit `chore: monorepo scaffold`

**Produces:** Importable `@leadpilot/core`, `@leadpilot/connectors`, `@leadpilot/scoring`

---

### Task 2: Supabase schema + RLS

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `supabase/config.toml` (optional), `apps/web/src/lib/supabase/{client,server,admin}.ts`
- Test: SQL applies on empty project; RLS denies cross-workspace

**Schema tables:** `workspaces`, `memberships`, `companies`, `leads`, `threads`, `messages`, `deals`, `tasks`, `activities`, `connector_installs`, `api_keys`

- [ ] **Step 1:** Write migration with PK/FK, `workspace_id`, indexes, `created_at`
- [ ] **Step 2:** RLS policies: member of workspace can CRUD own rows
- [ ] **Step 3:** Wire env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Step 4:** Document setup in `docs/SUPABASE.md`

**Produces:** Empty multi-tenant DB ready for app

---

### Task 3: Auth + workspace bootstrap

**Files:**
- Create: `apps/web/src/app/(auth)/login/page.tsx`, `callback/route.ts`
- Modify: shell to show workspace when session present
- Test: magic link / Google OAuth login creates workspace + membership

- [ ] **Step 1:** Supabase Auth email magic link (and Google if configured)
- [ ] **Step 2:** On first login create default workspace
- [ ] **Step 3:** Demo mode still works without login (local seed)

---

### Task 4: Desk repository switch (dual-mode)

**Files:**
- Create: `packages/core/src/repo.ts` ports; `apps/web/src/lib/repo/{local,supabase}.ts`
- Modify: store to call repo instead of only localStorage for signed-in
- Test: signed-in lead list loads from Supabase; demo still local

- [ ] **Step 1:** Define repository interface (listLeads, upsertLead, listThreads, …)
- [ ] **Step 2:** Local adapter wraps current Zustand seed
- [ ] **Step 3:** Supabase adapter
- [ ] **Step 4:** Feature flag `DATA_BACKEND=local|supabase`

---

### Task 5: API v1 on Supabase

**Files:**
- Modify: `apps/web/src/app/api/v1/**`
- Test: Bearer `lp_…` maps to `api_keys` hash; CRUD leads/messages

- [ ] **Step 1:** Persist hashed API keys in `api_keys`
- [ ] **Step 2:** Auth middleware for v1
- [ ] **Step 3:** Point health/openapi at live contract

---

### Task 6: Connector installs persisted

**Files:**
- Modify: marketplace page + webhook routes
- Test: enable Telegram install row; test webhook writes message to workspace

---

### Task 7: Onboarding + MD sell polish

**Files:** landing, `/app` queue empty states, 3-step Import → Score → Talk
- Test: new workspace checklist completes in <10 min with CSV

---

### Task 8: Deploy

- Vercel project root `apps/web` or monorepo settings
- Supabase free project linked
- Smoke: health, login, CSV import, inbox

---

## Done when

1. `pnpm build` green for web  
2. Supabase migration applied  
3. Logged-in workspace persists leads across browsers  
4. Demo anonymous path still works  
5. Spec + this plan committed on `main`  
