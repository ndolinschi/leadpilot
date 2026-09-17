# Supabase setup (LeadPilot)

LeadPilot uses Supabase for Auth, Postgres (RLS multi-tenant), and Realtime.
**Demo / local mode works without credentials** — the app falls back to labeled Demo sample data in the browser.

## Project (production)

| Field | Value |
|-------|-------|
| Project id | `xxyhztviztdhvjzdfdmb` |
| URL | `https://xxyhztviztdhvjzdfdmb.supabase.co` |
| Region | `eu-central-1` |
| Applied migration | `leadpilot_init_desk` (= `supabase/migrations/0001_init.sql`) |

Tables: `workspaces`, `memberships`, `wp_plugins` (WordPress-style install/activate/deactivate), `companies`, `leads`, `threads`, `messages`, `deals`, `tasks`, `activities`, `connector_installs`, `api_keys`.

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

## 5. WordPress-style plugins (`wp_plugins`)

| status | meaning |
|--------|---------|
| `installed` | Row exists, not serving routes/API |
| `active` | Gates nav, `PluginGate`, and API surfaces |
| `inactive` | Installed but deactivated |

Activate/deactivate updates `status` + `activated_at` and fires package hooks in `@leadpilot/core`. No “Coming soon” walls — inactive plugins hide routes; missing features are real deactivate states.

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
