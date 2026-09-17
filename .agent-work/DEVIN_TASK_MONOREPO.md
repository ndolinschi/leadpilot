# Devin — audit monorepo+Supabase scaffold (ALWAYS ALLOW)

cwd: /workspace/leadpilot
SHA on main: bfb4630
Supabase LIVE: xxyhztviztdhvjzdfdmb (eu-central-1). Env in .env.local (anon only). Migration applied remotely.

## Bar
NO MOCKS. Plugins WordPress-style (install/activate/deactivate → gate routes/API). Demo seed labeled Demo sample only. Beautiful usable product.

## Do
1. Audit packages/@leadpilot/*, supabase/migrations/0001_init.sql, docs/SUPABASE.md, src/lib/supabase/*, src/lib/repo/*, src/lib/plugins/wp-activate.ts against plan.
2. Wire Marketplace / Settings plugin toggles to call activatePlugin/deactivatePlugin (or repo.setPluginStatus) so toggles are real, not decorative.
3. Ensure connector enable persists toward connector_installs when supabase+workspace available; local demo still works.
4. Fix any type/build gaps. `npm run build` must exit 0.
5. Commit+push fixes to origin main. Write `.agent-work/devin-monorepo-handoff.md`.

No questions. Ship.
