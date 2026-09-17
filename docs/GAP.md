# LeadPilot — HAVE / NEED (кратко)

Дата: 2026-09-17 · Проект Supabase `xxyhztviztdhvjzdfdmb` · таблица `modules`

## HAVE (есть сейчас)

- **Auth + workspace bootstrap**: `/login`, magic link / пароль, создание `workspaces` + `memberships`, сид `modules` и `connector_installs`.
- **Supabase desk end-to-end** (после входа): leads / threads / messages / deals / tasks CRUD через `SupabaseDeskRepository` → Zustand hydrate + persist.
- **Демо без входа**: локальный Zustand + seed с меткой «Демо-выборка» (не продакшн-данные).
- **Онбординг-чеклист** (EN+RU): Import CSV → Score → Conversation → Verdict.
- **Маркетплейс как Shopify**: activate/deactivate модулей (`modules`); в навигации только active; коннекторы — сначала activate, потом config; без фейковых Production-бейджей.
- **API keys**: generate/revoke, hash в `api_keys`; `/api/v1` проверяет через RPC `verify_api_key` + env `LEADPILOT_API_KEYS`.
- **Модули workflow / campaign**: реальные минимальные страницы, gated через `modules` / PluginGate.
- **Мобильный polish**: `/login` и `/app` shell (компактный header, Sign in на mobile).
- **Миграции**: `0001_init`, `0002_rename_modules` (`wp_plugins`→`modules`), `0003_fix_bootstrap_and_api_keys`.

## NEED (следующий слой денег)

- **Vercel Production env**: `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_DATA_BACKEND=auto`, опционально `SUPABASE_SERVICE_ROLE_KEY`, `LEADPILOT_API_KEYS`.
- **Биллинг / планы**: Stripe (или локальный провайдер MD) + лимиты по планам Starter/Growth/Scale.
- **Realtime inbox**: Supabase Realtime на `messages` / `threads`.
- **Жёсткие коннекторы**: реальные Telegram/Viber bot tokens в secrets, не только test webhook.
- **Команда / роли**: invite members, agent vs owner UI.
- **Наблюдаемость**: Sentry + базовые product analytics (воронка import→verdict).
- **Email deliverability**: подтверждённый SMTP / Resend для magic link в MD-домене.

## Не делать

- Не выдавать демо-seed за live Production.
- Не показывать inactive модули в nav.
- Не хранить raw API keys — только `key_hash` + `key_prefix`.
