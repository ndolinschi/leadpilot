"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import {
  SUMMARY,
  ROC_POINTS,
  LIFT_CURVE,
  VS_BASELINE,
  PRECISION_AT_K,
} from "@/lib/eval-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricsPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  const M = i18n.metricsPage;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{M.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{M.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={M.auc} value={SUMMARY.auc.toFixed(3)} />
        <Stat label={M.lift} value={`${SUMMARY.liftAt20.toFixed(2)}×`} />
        <Stat
          label={M.baseline}
          value={`${(SUMMARY.modelTop20Conversion * 100).toFixed(1)}% vs ${(SUMMARY.baselineConversion * 100).toFixed(1)}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">ROC-style curve</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ROC_POINTS}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis
                  dataKey="fpr"
                  tickFormatter={(v) => Number(v).toFixed(1)}
                  stroke="oklch(0.7 0.02 265)"
                />
                <YAxis
                  dataKey="tpr"
                  tickFormatter={(v) => Number(v).toFixed(1)}
                  stroke="oklch(0.7 0.02 265)"
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.025 265)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tpr"
                  stroke="oklch(0.72 0.16 275)"
                  fill="oklch(0.72 0.16 275 / 0.25)"
                  name="TPR"
                />
                <Line
                  type="monotone"
                  dataKey="fpr"
                  stroke="oklch(0.6 0.02 265)"
                  strokeDasharray="4 4"
                  dot={false}
                  name="chance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Lift curve</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LIFT_CURVE}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="pct" stroke="oklch(0.7 0.02 265)" unit="%" />
                <YAxis stroke="oklch(0.7 0.02 265)" />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.025 265)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="lift"
                  stroke="oklch(0.75 0.14 160)"
                  strokeWidth={2}
                  name="Lift"
                />
                <Line
                  type="monotone"
                  dataKey="modelRate"
                  stroke="oklch(0.72 0.16 275)"
                  strokeWidth={2}
                  name="Model conv."
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">{M.baseline}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VS_BASELINE}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="k" stroke="oklch(0.7 0.02 265)" />
                <YAxis
                  stroke="oklch(0.7 0.02 265)"
                  tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                />
                <Tooltip
                  formatter={(v) =>
                    typeof v === "number" ? `${(v * 100).toFixed(1)}%` : String(v)
                  }
                  contentStyle={{
                    background: "oklch(0.2 0.025 265)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="model" fill="oklch(0.72 0.16 275)" name="LeadPilot" radius={4} />
                <Bar dataKey="chrono" fill="oklch(0.55 0.02 265)" name="Chronological" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">{M.precision}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PRECISION_AT_K}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="k" stroke="oklch(0.7 0.02 265)" />
                <YAxis
                  stroke="oklch(0.7 0.02 265)"
                  tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                />
                <Tooltip
                  formatter={(v) =>
                    typeof v === "number" ? `${(v * 100).toFixed(0)}%` : String(v)
                  }
                  contentStyle={{
                    background: "oklch(0.2 0.025 265)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="precision"
                  fill="oklch(0.78 0.14 85)"
                  name="Precision"
                  radius={4}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Holdout n={SUMMARY.nHoldout}. {SUMMARY.trainedOn}.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="pt-6">
        <div className="text-2xl font-semibold tabular-nums text-indigo-200">
          {value}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
