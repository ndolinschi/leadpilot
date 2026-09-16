"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target, MessageSquare, BarChart3, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/language-toggle";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { SUMMARY } from "@/lib/eval-metrics";

const plans = [
  { key: "starter" as const, price: 49, features: ["Up to 1k leads / mo", "Priority + channel scoring", "Template messages", "CSV import"] },
  { key: "growth" as const, price: 149, featured: true, features: ["Up to 10k leads / mo", "LLM message generation", "Explainability export", "Outcome feedback loop"] },
  { key: "scale" as const, price: 399, features: ["Unlimited scoring", "Custom model calibration", "SSO + audit log", "Dedicated success"] },
];

export default function LandingPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  const L = i18n.landing;
  const steps = [
    { title: L.step1, desc: L.step1d, icon: Target },
    { title: L.step2, desc: L.step2d, icon: BarChart3 },
    { title: L.step3, desc: L.step3d, icon: Zap },
    { title: L.step4, desc: L.step4d, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">{i18n.brand}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#product" className="hover:text-foreground">{i18n.nav.product}</a>
            <a href="#how" className="hover:text-foreground">{i18n.nav.how}</a>
            <a href="#metrics" className="hover:text-foreground">{i18n.nav.metrics}</a>
            <a href="#pricing" className="hover:text-foreground">{i18n.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle className="flex gap-1" />
            <Button size="sm" render={<Link href="/app" />}>{i18n.nav.demo}</Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
        <Badge variant="outline" className="mb-4 border-indigo-400/30 bg-indigo-500/10 text-indigo-200">
          ML · Channel · Message · Explainability
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">{L.heroTitle}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{L.heroSub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/app" />}>{L.ctaDemo}<ArrowRight className="size-4" /></Button>
          <Button size="lg" variant="outline" render={<a href="#how" />}>{L.ctaHow}</Button>
        </div>
      </section>

      <section id="product" className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Shield className="size-4 text-rose-300" />{L.problemTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">{L.problemBody}</CardContent>
        </Card>
        <Card className="border-indigo-400/20 bg-indigo-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-indigo-300" />{L.productTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">{L.productBody}</CardContent>
        </Card>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{L.howTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="border-border/60 bg-card/60">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <s.icon className="size-4" />
                </div>
                <CardTitle className="text-sm"><span className="mr-2 text-muted-foreground">{i + 1}.</span>{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{s.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="metrics" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{L.metricsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: L.metricAuc, value: SUMMARY.auc.toFixed(3) },
            { label: L.metricLift, value: `${SUMMARY.liftAt20.toFixed(2)}×` },
            { label: L.metricReply, value: `${SUMMARY.replyLift.toFixed(2)}×` },
          ].map((m) => (
            <Card key={m.label} className="border-border/60 bg-card/70 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-semibold tabular-nums text-indigo-200">{m.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{L.pricingTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.key} className={p.featured ? "border-indigo-400/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10" : "border-border/60 bg-card/60"}>
              <CardHeader>
                <CardTitle className="text-base">{p.key === "starter" ? L.starter : p.key === "growth" ? L.growth : L.scale}</CardTitle>
                <div className="text-3xl font-semibold">${p.price}<span className="text-sm font-normal text-muted-foreground">{L.perMonth}</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (<li key={f} className="flex gap-2"><span className="text-indigo-300">✓</span>{f}</li>))}
                </ul>
                <Button className="w-full" variant={p.featured ? "default" : "outline"} render={<Link href="/app" />}>{L.ctaDemo}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-center text-muted-foreground">{L.ctaFinal}</p>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">{L.footer}</footer>
    </div>
  );
}
