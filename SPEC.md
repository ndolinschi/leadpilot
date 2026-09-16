# LeadPilot — Diploma Product Specification

## Thesis alignment
**Machine Learning-Based System for Lead Prioritization, Communication Channel Recommendation, and Personalized Message Generation.**

LeadPilot is the sellable SaaS embodiment of that thesis: a sales inbox ranked by conversion probability, with best-channel recommendation, personalized first-touch copy, and SHAP-like explainability.

## Problem
B2B teams process leads chronologically or with crude rules. High-intent buyers wait while cold contacts consume SDR time. Channel choice is guesswork; first messages are generic.

## Product pipeline (per lead)
1. **Priority score (0–100)** — calibrated P(convert)
2. **Best channel** — `email | call | linkedin | messenger`
3. **Personalized first-touch message** — templates or LLM
4. **Explainability** — signed factor contributions (logistic surrogate of offline XGBoost)

## Architecture
```
CSV / seed CRM  →  feature vector  →  JS logistic score + channel softmax
                                   →  message generator (/api/generate)
                                   →  Zustand + localStorage UI
```
- **Frontend:** Next.js App Router, TypeScript, Tailwind, shadcn/ui, Recharts
- **State:** Zustand persisted to `localStorage` (demo-friendly, no DB)
- **Scoring:** Pure TypeScript (`src/lib/score.ts`) — no Python on Vercel
- **Messages:** `POST /api/generate` uses OpenAI/Anthropic if env keys exist; else high-quality templates (`src/lib/messages.ts`)

## Models (diploma-friendly)
### Priority model
Offline training narrative: synthetic B2B CRM (~12k rows) → XGBoost ranker → **logistic calibration**. Coefficients exported into `WEIGHTS` / `INTERCEPT` in `score.ts`. Runtime = sigmoid(linear terms). Display score = probability × 100.

Features include: demo requested, budget signal, email opens / open rate, site visits, recency, log company size, seniority, source, industry, country tier.

### Channel model
Softmax over channel utilities (engagement → email, exec+phone+demo → call, LinkedIn presence/source → linkedin, regional/SMB → messenger).

### Explainability
Linear term contributions of the logistic surrogate (SHAP-like for this model class). Positive/negative bars on the lead detail page.

### Offline metrics (frozen)
See `src/lib/eval-metrics.ts`: AUC ≈ 0.84, lift@20% ≈ 2.31× vs chronological baseline on synthetic holdout.

## Pages
| Route | Purpose |
|-------|---------|
| `/` | Marketing: problem → product → how → metrics → pricing |
| `/app` | Ranked leads dashboard + filters |
| `/app/leads/[id]` | Score, channel, message, explainability, outcome |
| `/app/import` | CSV import |
| `/app/metrics` | Offline eval charts |
| `/app/settings` | Company voice, language EN/RU, API note |

## Pricing (marketing)
Starter $49 · Growth $149 · Scale $399 / month

## Limitations
- Demo store is **client-side only** (localStorage); not multi-user CRM sync
- Coefficients are from **synthetic** CRM — recalibrate on customer data before production claims
- LLM generation optional; quality depends on API keys and prompts
- Outcome marking is a **feedback-loop stub** (stored locally, not yet used for online learning)
- Channel model is utility/softmax, not a separately trained multi-class production model

## Privacy
- Lead data stays in the browser (`localStorage`) for the demo
- API keys must be server env vars (`OPENAI_API_KEY` / `ANTHROPIC_API_KEY`) — **never** written to localStorage
- `/api/generate` only sends lead fields needed for copywriting when a key is present

## i18n
English default UI with Russian toggle (diploma author is RU speaker).
