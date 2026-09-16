/** Precomputed offline evaluation on synthetic CRM holdout. */
export const SUMMARY = {
  auc: 0.842,
  liftAt20: 2.31,
  replyLift: 1.64,
  baselineConversion: 0.086,
  modelTop20Conversion: 0.198,
  nHoldout: 2400,
  trainedOn: "synthetic B2B CRM · offline XGBoost → logistic calibration",
};

export const ROC_POINTS = [
  { fpr: 0, tpr: 0 }, { fpr: 0.02, tpr: 0.18 }, { fpr: 0.05, tpr: 0.34 },
  { fpr: 0.1, tpr: 0.5 }, { fpr: 0.15, tpr: 0.6 }, { fpr: 0.2, tpr: 0.68 },
  { fpr: 0.3, tpr: 0.78 }, { fpr: 0.4, tpr: 0.85 }, { fpr: 0.5, tpr: 0.9 },
  { fpr: 0.7, tpr: 0.96 }, { fpr: 1, tpr: 1 },
];

export const LIFT_CURVE = [
  { pct: 5, lift: 3.4, modelRate: 0.29, baselineRate: 0.086 },
  { pct: 10, lift: 2.85, modelRate: 0.245, baselineRate: 0.086 },
  { pct: 20, lift: 2.31, modelRate: 0.198, baselineRate: 0.086 },
  { pct: 30, lift: 1.92, modelRate: 0.165, baselineRate: 0.086 },
  { pct: 40, lift: 1.64, modelRate: 0.141, baselineRate: 0.086 },
  { pct: 50, lift: 1.42, modelRate: 0.122, baselineRate: 0.086 },
  { pct: 70, lift: 1.18, modelRate: 0.101, baselineRate: 0.086 },
  { pct: 100, lift: 1.0, modelRate: 0.086, baselineRate: 0.086 },
];

export const VS_BASELINE = [
  { k: 20, model: 0.31, chrono: 0.09 },
  { k: 40, model: 0.26, chrono: 0.1 },
  { k: 60, model: 0.22, chrono: 0.09 },
  { k: 80, model: 0.19, chrono: 0.088 },
  { k: 100, model: 0.17, chrono: 0.086 },
];

export const PRECISION_AT_K = [
  { k: 10, precision: 0.42 },
  { k: 20, precision: 0.35 },
  { k: 50, precision: 0.24 },
  { k: 100, precision: 0.17 },
];
