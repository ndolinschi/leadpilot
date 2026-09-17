# Grok Build — final monorepo + Supabase pass

**SHA:** `49af8067e745abeff3d89db4282614f68922b34e`  
**Date:** 2026-09-17  
**Supabase:** `xxyhztviztdhvjzdfdmb` (anon in `.env.local`; dual-mode repo: local Demo sample ↔ workspace)

## Smoke review

| Area | Status |
| --- | --- |
| Packages `@leadpilot/core`, `connectors`, `scoring` | Wired via tsconfig paths + `file:` deps. App re-exports (`src/lib/plugins.ts`, `score.ts`, `connectors/registry.ts`). |
| Supabase clients | `config` / `client` / `server` / `admin` — null-safe when env missing. |
| Dual-mode `createDeskRepository` | `auto`/`local`/`supabase`; supabase requires client + workspaceId. |
| `wp-activate` | Activate / deactivate / install against `DeskRepository` + plugin hooks. Locked plugins cannot deactivate. |
| Settings Plugins tab | WordPress-style list with Active/Inactive + Required. |
| Marketplace connectors | Real webhook handlers (`telegram`/`viber`/`facebook`) + CSV/email; custom JSON manifests. |

`npm run build` **exit 0** (Next.js 16.3.5, 28 routes).

## Fixes shipped

1. Removed fake **Production** badge on Marketplace; labeled **Demo sample**.
2. i18n: marketplace subtitle no longer claims “Production”; landing CTA is “Open Demo Queue”.
3. Campaign “Open Live Inbox” → “Open Conversations”. Queue no longer fabricates `P(convert)=94%`.
4. **Workflow** and **Campaign** wrapped in `PluginGate`; sidebar + route redirect honor plugin on/off.
5. Locked plugin deactivate throws in the store (matches wp-activate).
6. Demo sample labeled in shell header, lead table, lead detail, and queue cards (`isDemoSample` from seed).

## Not mocked

Seed CRM is explicit Demo sample (`isDemoSample: true`). Webhook tests set `isTest` → `isDemoSample`. Live webhook path requires tokens. No Coming soon walls on import/marketplace.
