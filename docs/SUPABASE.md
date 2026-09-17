# Supabase setup (LeadPilot)

LeadPilot uses Supabase for Auth, Postgres (RLS multi-tenant), and Realtime.
**Demo / local mode works without credentials** — the app falls back to labeled Demo sample data in the browser.

## Project (production)

| Field | Value |
|-------|-------|
| Project id | `xxyhztviztdhvjzdfdmb` |
| URL | `https://xxyhztviztdhvjzdfdmb.supabase.co` |
| Region | `eu-central-1` |
| Applied migrations | `0001_init.sql` (+ `0002_rename_modules.sql`: `wp_plugins`→`modules`) |

Tables: `workspaces`, `memberships`, `modules` (install/activate/deactivate; `module_slug`), `companies`, `leads`, `threads`, `messages`, `deals`, `tasks`, `activities`, `connector_installs`, `api_keys`.

Migration `0002_rename_modules.sql` renames legacy `wp_plugins` / `plugin_slug` → `modules` / `module_slug`.

## 1. Create a project (if starting fresh)

1. Open [supabase.com](https://supabase.com) → New project
2. Pick region close to users (MD/RO → `eu-central-1`)
3. Save the **anon** (publishable) and **service_role** keys — never commit service_role

## 2. Apply migration

SQL editor → paste `supabase/migrations/0001_init.sql` → Run  
Or CLI:

```bash
supabase db push
# or
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
```

Idempotent `create table if not exists` / policy drops are safe to re-run on empty projects. On the already-applied production project, skip re-apply unless you know you need it.

## 3. Environment variables

Copy `.env.example` → `.env.local` (gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# optional publishable alias (same as anon on newer dashboards)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# server-only — never expose to the browser
SUPABASE_SERVICE_ROLE_KEY=
# dual-mode desk: auto | local | supabase
NEXT_PUBLIC_DATA_BACKEND=auto
```

Vercel: Project Settings → Environment Variables (Hobby is fine).  
Local secrets mirror: `/workspace/secrets/leadpilot-supabase.env` (not committed).

## 4. Demo mode without credentials

If `NEXT_PUBLIC_SUPABASE_URL` or anon key is missing:

- `isSupabaseConfigured()` → `false`
- Desk uses local Zustand + seed labeled **Demo sample**
- Auth routes stay inactive; Marketplace/connectors still run real handler code paths locally

Never present demo seed as live production data.

## 5. Modules (`modules`)

| status | meaning |
|--------|---------|
| `installed` | Row exists, not serving routes/API |
| `active` | Gates nav, `PluginGate`, and API surfaces |
| `inactive` | Installed but deactivated |

Column `module_slug` matches the registry id. Activate/deactivate updates `status` + `activated_at` and fires package hooks in `@leadpilot/core`. Inactive modules hide routes; missing features are real deactivate states.

## 6. Auth (Task 3+)

Enable Email magic link (and Google OAuth if desired) in Authentication → Providers.  
Redirect URL: `https://YOUR_DOMAIN/auth/callback` and `http://localhost:3000/auth/callback`.

## 7. Smoke checks

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/workspaces?select=id&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
# → [] (RLS, no session) means schema is up
```

App: `pnpm build` or `npm run build` exit 0 with or without env.

## Auth + workspace bootstrap (Task 3)

Routes:

- `/login` — magic link and email+password (minimal light UI)
- `/auth/callback` — exchanges the auth code for a session, then ensures workspace

On first successful login the client/server bootstrap:

1. Creates a `workspaces` row (if the user has no membership)
2. Inserts an `owner` row in `memberships`
3. Seeds `modules` from `PLUGIN_REGISTRY` (core modules `active`; optional modules `inactive`)
4. Seeds `connector_installs` for built-in connectors with `enabled=false` until activated

Signed-in sessions make `DATA_BACKEND=auto` prefer the Supabase desk repository. Anonymous visitors stay on the labeled **Demo sample** local mode.

### Supabase Auth settings

Authentication → Providers → Email: enable magic link and/or password.

Redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://YOUR_PRODUCTION_DOMAIN/auth/callback`


### Vercel note (Production)

**Production environment variables must be set on Vercel before the browser deploy.** Configure at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DATA_BACKEND=auto`

Browser deploy comes later — do not skip Production env setup.

### Vercel Production

Set these on the **Production** environment (browser deploy comes later; do this before go-live):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DATA_BACKEND=auto`

Optional server-only: `SUPABASE_SERVICE_ROLE_KEY` (never expose to the browser).

Local secrets live in `/workspace/secrets/leadpilot-supabase.env` and `.env.local` (gitignored). **Do not commit secrets.**

