# Task 3 Auth + workspace bootstrap — Grok

**SHA (feat):** `016196fb0ba77ecca5aa478eec19d52e82bde8ae` (already on origin/main)
**Follow-up:** settings Sign out → `/login` redirect (this commit)

## Shipped
- `/login` — magic link + email/password, minimal light UI (`#266df0`)
- `/auth/callback` — code exchange + `ensureWorkspaceForUser`
- First login creates `workspaces` + owner `memberships`, seeds `wp_plugins` (core active / optional inactive) and `connector_installs` (`enabled=false`)
- Session present → `preferSupabaseRepo` / desk factory prefers Supabase; anonymous stays labeled Demo sample
- Settings shows workspace name + Sign out; app shell badge switches Demo sample → workspace name
- `docs/SUPABASE.md`: `NEXT_PUBLIC_SUPABASE_*` + **Vercel Production** env must be set (browser deploy later)
- `@supabase/ssr` cookie clients + root `middleware` session refresh
- `npm run build` exit 0

## Notes
- Supabase Auth email confirmation is ON — signup returns no session until confirm; magic link / confirmed password login bootstraps for real
- No secrets committed
