# Agy — LeadPilot Path B scaffold (Tasks 1–2 + stubs)

cwd: `/workspace/leadpilot`
Plan: `docs/superpowers/plans/2026-09-17-leadpilot-monorepo-supabase.md`
Spec: `docs/superpowers/specs/2026-09-17-leadpilot-money-product-design.md`

ALWAYS ALLOW / --dangerously-skip-permissions. No questions. Ship green.

## Product bar (non-negotiable)
- REMOVE MOCKS mindset: no "Coming soon" walls; connectors/plugins must be install/activate/deactivate like WordPress (real registry, real hooks, real webhooks).
- Demo seed stays, but must be clearly labeled "Demo sample" — never pretend to be live production data.
- Prefer WordPress-style plugin registry: active plugins table (DB + client), activate toggles that gate routes/API.

## Do NOW

### 1) Monorepo scaffold WITHOUT breaking production build (gradual preferred)
- Add `pnpm-workspace.yaml`, root `turbo.json`, root `package.json` (workspaces scripts).
- Prefer gradual: keep current Next app at repo root working (`npm run build` / `pnpm build` exit 0). Add packages alongside:
  - `packages/core` → `@leadpilot/core` (extract shared types from `src/lib/types.ts`; re-export from existing path or update imports)
  - `packages/connectors` → `@leadpilot/connectors` (move/copy connectors; WordPress-style: manifest + activate/deactivate + hooks)
  - `packages/scoring` → `@leadpilot/scoring` (extract `score.ts`; keep JS logistic; stub Jev adapter)
- Wire tsconfig paths so app can import `@leadpilot/*`.
- If you relocate to `apps/web`, ensure build still 0. Safer: packages first, app stays at root for now OR move carefully with root package.json forwarding scripts.
- Install pnpm if needed (`corepack enable && corepack prepare pnpm@latest --activate` or npm i -g pnpm).

### 2) Supabase schema + RLS
Create `supabase/migrations/0001_init.sql` with FULL schema:
- Tables: `workspaces`, `memberships`, `companies`, `leads`, `threads`, `messages`, `deals`, `tasks`, `activities`, `connector_installs`, `api_keys`
- ALSO WordPress-style: `plugin_installs` (or extend connector_installs) with `workspace_id`, `plugin_id`, `status` (installed|active|inactive), `config` jsonb, `activated_at`, `created_at`
- PK/FK, `workspace_id` on tenant tables, indexes, `created_at`, soft-delete `deleted_at` where sensible
- RLS: member of workspace can CRUD own workspace rows; deny cross-workspace
- Helper: `is_workspace_member(workspace_id)` security definer function

### 3) docs/SUPABASE.md
Setup steps: create project, apply migration, env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), local demo mode without creds.

### 4) Supabase JS stubs (demo-safe)
- Add `@supabase/supabase-js` dependency
- Create `src/lib/supabase/{client,server,admin}.ts` (or under apps/web if moved)
- Read env vars; if missing, export null clients / `isSupabaseConfigured() === false` so app still runs in demo/local mode
- Update `.env.example` with the three vars (empty)

### 5) Plugin registry port (WordPress-style, no mocks)
In `@leadpilot/core` or connectors package:
- Types: `PluginManifest`, `PluginInstallStatus` (installed/active/inactive)
- Registry API sketch: `listPlugins()`, `getPlugin(id)`, activate/deactivate contract
- App can keep existing marketplace toggles but types should support real activate gating later
- Do NOT add fake "live" webhook responses that pretend production — handlers stay real; demo data labeled

### 6) Verify + commit
- `npm run build` OR `pnpm build` exit 0 (whatever is primary after scaffold)
- Commit: `chore: monorepo scaffold + supabase init + plugin registry ports`
- Push `origin main`
- Write handoff: `/workspace/leadpilot/.agent-work/agy-monorepo-handoff.md` with SHA, file list, build status, remaining for Devin

Do NOT require live Supabase credentials. Migrations + stubs enough.
