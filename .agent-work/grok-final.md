# LeadPilot — Grok final ship report

**SHA:** `8b2f36f` (on `main`; prior Agy ship `5b4c066`)

**Build:** `npm run build` exit 0 (Next.js 16.3.5).

## New / notable routes

| Route | Kind |
| --- | --- |
| `/` | Landing (mobile Sheet + MDL pricing) |
| `/developers` | Public API docs (marketing shell) |
| `/app` | Queue overview |
| `/app/inbox`, `/app/inbox/[threadId]` | Conversations (mobile list → thread) |
| `/app/leads`, `/app/leads/[id]` | Scored queue |
| `/app/companies`, `/app/deals`, `/app/tasks` | Operations |
| `/app/import` | Channels / CSV |
| `/app/marketplace` | Connector marketplace (webhook URL + test) |
| `/app/developers` | In-app API docs |
| `/app/settings` | API keys + billing (MDL) |
| `/app/metrics` | Model metrics |
| `/app/workflow`, `/app/campaign` | Modules (preview, not “Coming soon”) |
| `/app/chat` | Inbox alias |

## Mobile fixes summary

- Landing hamburger **Sheet** now includes **Marketplace** and **Developers & API** (desktop nav too).
- Inbox stays split: list-only under `lg`, thread page hides list (`hidden lg:block`) with back on chat.
- AppShell mobile: `SidebarTrigger`, brand truncate `md:hidden`, padded main `p-3 sm:p-5`.
- Marketplace webhook URL is `origin + path` (copyable); test buttons hit real handlers.
- Unused lucide imports removed from landing (avoid dead icons on mobile bundle).

## API endpoint list

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/v1/health` | public |
| GET | `/api/v1/leads` | Bearer / `x-api-key` |
| POST | `/api/v1/leads` | Bearer / `x-api-key` |
| GET | `/api/v1/leads/[id]` | Bearer / `x-api-key` |
| POST | `/api/v1/score` | Bearer / `x-api-key` |
| POST | `/api/v1/messages` | Bearer / `x-api-key` |
| GET | `/api/v1/openapi.json` | public |
| POST | `/api/v1/webhooks/telegram` | connector / `x-leadpilot-test` |
| POST | `/api/v1/webhooks/viber` | connector / `x-leadpilot-test` |
| POST | `/api/v1/webhooks/facebook` | connector / `x-leadpilot-test` **(added this pass)** |
| POST | `/api/generate` | app message generation |

## This-pass fixes

- Facebook marketplace test no longer posts to Telegram; `/api/v1/webhooks/facebook` wired to `handleFacebookWebhook`.
- Zustand: `apiKeys` / `customConnectors` / `connectors` use stable empty constants (`?? EMPTY_*`) instead of `|| []`.
- User-visible “CRM” / leftover “coming next” connector copy cleaned (EN+RU). No leftover “Coming soon” strings.
- MDL rates already on landing + settings billing (`≈ 900 / 2,700 / 7,200 MDL`).
- Telegram/Viber/Facebook setup dialogs: webhook URL + **Send Test Webhook** → real route handlers.

Skipped: extra Facebook `hub.challenge` GET verify (not required for demo test button).
