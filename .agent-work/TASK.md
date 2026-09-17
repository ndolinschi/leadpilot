# LeadPilot production elevation — SHIP NOW

Working directory: `/workspace/leadpilot`
PATH must include: `/home/box/.local/bin:/home/box/.grok/bin:$PATH`
Do NOT ask questions. Implement everything. Keep light white UI #266df0, shadcn, EN+RU. Hobby Vercel. Keep Zustand selector safety (useMemo for derived arrays).

## Non-negotiable outcomes

### A) Mobile (375px)
1. Landing: hamburger Sheet with nav links on <md; pricing cards stack; no horizontal overflow.
2. AppShell: Sheet sidebar works on mobile; header not cramped.
3. Inbox: on <lg show either thread list OR chat (not side-by-side min-h 640); back button to list; chat full width.
4. Tables: DataTable horizontal scroll wrapper ok; filter row wraps.
5. Mentally verify `/`, `/app/inbox`, `/app/leads` usable at 375px.

### B) Language / sell Moldova tomorrow
Rewrite i18n landing + in-app nav away from "CRM/plugins":
- Brand: platform that runs client processing / call-center work end-to-end.
- Moldova framing: agencies, clinics, banks, e-commerce support desks drowning in Facebook/Viber/phone — one queue, priority who to answer, talk, close.
- Pricing: keep $49/$149/$399 AND show ≈ 900 / 2700 / 7200 MDL (comment approx fixed rate in UI); who for: solo / team / ops.
- Nav rename: Overview→Queue / Очередь; Inbox→Conversations / Диалоги; Import→Channels market entry; Settings→Workspace; remove "Plugin" from sidebar — use "Modules" or "Marketplace" / "Magazin modulelor" only on market page.
- Speak outcomes: найти клиента → оценить → поговорить → вердикт / find → score → talk → verdict.

### C) Connector Marketplace (production shape)
Create `src/lib/connectors/`:
- `types.ts` — ConnectorManifest { id, name, brand, version, capabilities, authType, webhookPath?, configSchema }
- `registry.ts` — built-in packs: csv, telegram, viber, email, facebook with real manifests
- Each connector folder with `manifest.ts` + `handler.ts` (CSV fully works; Telegram/Viber implement webhook verify + inbound message → lead/thread creation stubs that ARE real code paths — if secrets missing return clear 503 with setup instructions)
- Marketplace page `/app/marketplace` (+ landing section): install/enable toggles persisted in store; "Import connector package" accepts JSON manifest upload (validate + register into localStorage/store)
- Settings: link to Marketplace; workspace API keys live in Settings (not vague plugin list)

### D) Public API
Under `src/app/api/v1/`:
- GET /api/v1/health
- GET /api/v1/leads, POST /api/v1/leads (Bearer lp_... or x-api-key)
- GET /api/v1/leads/:id
- POST /api/v1/messages
- POST /api/v1/score (existing JS ML)
- GET /api/v1/openapi.json + docs page `/app/developers` (or `/developers`)
- API keys: generate/revoke in Settings, hashed-at-rest in zustand persist (Web Crypto or sha256). Also accept env LEADPILOT_API_KEYS. Document Hobby pragmatism.
- Webhooks: POST /api/v1/webhooks/telegram and /api/v1/webhooks/viber calling connector handlers.

### E) Value-first demo
- Open Demo → conversations with first thread open.
- Overview = operator Queue: next hot lead, open chat CTA, verdict counts.
- Lead detail: score explain + chat + verdict dominant.

### F) Quality
- `npm run build` = 0 errors
- No leftover "Coming soon" empty walls — Telegram/Viber pages show setup steps + webhook URL + test button that posts sample update through the real handler.
- Commit + push origin/main when done (or leave clean working tree ready for final agent to push). Prefer committing if build passes.

## Implementation notes
- Existing plugin system in `src/lib/plugins.ts` can be evolved into modules/connectors — don't leave dead "Coming soon" stubs.
- Reuse existing score.ts, csv.ts, leads-store, chat components.
- Prefer minimal breakage: keep routes working; add marketplace/developers; rename copy.
- For Telegram/Viber connector pages: real setup UI with webhook URLs pointing at /api/v1/webhooks/...

Ship complete. Report what you changed.
