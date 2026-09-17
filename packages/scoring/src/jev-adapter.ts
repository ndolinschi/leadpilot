import type { LeadFeatures, ScoreResult } from "@leadpilot/core";
import { scoreLead } from "./score";

export interface ScoringEngineAdapter {
  id: string;
  name: string;
  score(features: LeadFeatures): Promise<ScoreResult> | ScoreResult;
  isAvailable(): boolean;
}

/**
 * Default JS logistic scoring adapter. Runs zero-latency in browser and edge runtimes.
 */
export class JsLogisticScoringAdapter implements ScoringEngineAdapter {
  id = "js-logistic";
  name = "JS Logistic Regression (Offline Calibrated)";

  isAvailable(): boolean {
    return true;
  }

  score(features: LeadFeatures): ScoreResult {
    return scoreLead(features);
  }
}

export interface JevAdapterConfig {
  endpoint?: string;
  apiKey?: string;
  timeoutMs?: number;
}

/**
 * TypeSafe Jev ML adapter stub.
 * Connects to external ML/Jev inference service when configured, with graceful fallback to JS logistic.
 */
export class JevScoringAdapter implements ScoringEngineAdapter {
  id = "jev-ml";
  name = "TypeSafe Jev ML Scoring Engine";

  private config: JevAdapterConfig;
  private fallback: JsLogisticScoringAdapter;

  constructor(config: JevAdapterConfig = {}) {
    this.config = {
      endpoint: process.env.JEV_SCORING_URL || config.endpoint,
      apiKey: process.env.JEV_API_KEY || config.apiKey,
      timeoutMs: config.timeoutMs ?? 2000,
    };
    this.fallback = new JsLogisticScoringAdapter();
  }

  isAvailable(): boolean {
    return Boolean(this.config.endpoint && this.config.apiKey);
  }

  async score(features: LeadFeatures): Promise<ScoreResult> {
    if (!this.isAvailable()) {
      // Graceful fallback to offline logistic model
      return this.fallback.score(features);
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(this.config.endpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ features }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Jev scoring returned status ${response.status}`);
      }

      const result = (await response.json()) as ScoreResult;
      return result;
    } catch (err) {
      console.warn("Jev scoring call failed, falling back to JS logistic:", err);
      return this.fallback.score(features);
    }
  }
}

export function getScoringEngine(preference?: "logistic" | "jev"): ScoringEngineAdapter {
  if (preference === "jev") {
    const jev = new JevScoringAdapter();
    if (jev.isAvailable()) return jev;
  }
  return new JsLogisticScoringAdapter();
}
