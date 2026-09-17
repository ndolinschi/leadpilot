# Monorepo + Supabase scaffold handoff

## Status
Build green (`npm run build` exit 0). Supabase project live: `xxyhztviztdhvjzdfdmb`.

## Shipped
- pnpm-workspace.yaml + turbo.json; packages `@leadpilot/core|connectors|scoring`
- App stays at repo root (gradual); `src/lib/{types,plugins,score,connectors}` re-export packages
- `supabase/migrations/0001_init.sql` matching applied `leadpilot_init_desk` (+ `wp_plugins`)
- `docs/SUPABASE.md`, `.env.example` updated
- `@supabase/supabase-js` + `src/lib/supabase/{config,client,server,admin}.ts` (demo-safe if env missing)
- Dual-mode `src/lib/repo/{local,supabase,index}.ts`
- WordPress activate/deactivate: `src/lib/plugins/wp-activate.ts` + `wp_plugins` via repo
- Demo seed labeled (`isDemoSample` / Demo sample comments); no Coming-soon plugin walls in registry

## Remaining (Devin / Task 3+)
- Auth login + workspace bootstrap
- Store dual-mode switch when session present
- Marketplace UI call activatePlugin/deactivatePlugin against repo
- Connector installs persist to `connector_installs`
