# Task 3 Auth + workspace bootstrap — Grok

**Feature SHA:** `016196fb0ba77ecca5aa478eec19d52e82bde8ae`
**HEAD:** `e6239fcb10aaa5c1a2249eef92aa2bcab3d9fd18` (on origin/main)

## Shipped
- `/login` — magic link + email/password, minimal light UI
- `/auth/callback` — code exchange + workspace bootstrap
- First login: `workspaces` + owner `memberships`; seed `wp_plugins` (core active / optional inactive); `connector_installs` enabled=false
- Session → prefer Supabase desk repo; anonymous → labeled Demo sample
- Settings: workspace name + Sign out (redirects to `/login`)
- App shell badge: Demo sample ↔ workspace name
- `docs/SUPABASE.md`: NEXT_PUBLIC_SUPABASE_* + Vercel Production env note
- `@supabase/ssr` + middleware session refresh
- `npm run build` = 0

## Notes
- Email confirmation enabled on project — password signup may require confirm before session; magic link works after click
- Secrets not committed
