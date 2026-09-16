"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target, MessageSquare, BarChart3, Shield, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/language-toggle";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { SUMMARY } from "@/lib/eval-metrics";

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
  const plans = [
    { key: "starter" as const, price: 49, features: [L.fStarter1, L.fStarter2, L.fStarter3, L.fStarter4] },
    { key: "growth" as const, price: 149, featured: true, features: [L.fGrowth1, L.fGrowth2, L.fGrowth3, L.fGrowth4] },
    { key: "scale" as const, price: 399, features: [L.fScale1, L.fScale2, L.fScale3, L.fScale4] },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 glow-subtle">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">{i18n.brand}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#product" className="transition-colors hover:text-foreground">{i18n.nav.product}</a>
            <a href="#how" className="transition-colors hover:text-foreground">{i18n.nav.how}</a>
            <a href="#metrics" className="transition-colors hover:text-foreground">{i18n.nav.metrics}</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">{i18n.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle className="flex gap-1" />
            <Button size="sm" render={<Link href="/app" />}>{i18n.nav.demo}</Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
          <Badge variant="outline" className="animate-fade-up mb-5 border-indigo-400/30 bg-indigo-500/10 text-indigo-200">
            ML · Channel · Message · Explainability
          </Badge>
          <h1 className="animate-fade-up-delay-1 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.08]">
            {L.heroTitle}
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {L.heroSub}
          </p>
          <div className="animate-fade-up-delay-3 mt-9 flex flex-wrap gap-3">
            <Button size="lg" className="glow-primary" render={<Link href="/app" />}>
              {L.ctaDemo}
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#how" />}>
              {L.ctaHow}
            </Button>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-2">
        <Card className="border-border/60 bg-card/70 transition-shadow hover:glow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-rose-300" />
              {L.problemTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">{L.problemBody}</CardContent>
        </Card>
        <Card className="border-indigo-400/20 bg-indigo-500/5 transition-shadow hover:glow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-indigo-300" />
              {L.productTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">{L.productBody}</CardContent>
        </Card>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight md:text-3xl">{L.howTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="border-border/60 bg-card/60 transition-transform hover:-translate-y-0.5 hover:border-indigo-400/25">
              <CardHeader className="pb-2">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.icon className="size-4" />
                </div>
                <CardTitle className="text-sm">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">{s.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="metrics" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight md:text-3xl">{L.metricsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: L.metricAuc, value: SUMMARY.auc.toFixed(3) },
            { label: L.metricLift, value: `${SUMMARY.liftAt20.toFixed(2)}×` },
            { label: L.metricReply, value: `${SUMMARY.replyLift.toFixed(2)}×` },
          ].map((m) => (
            <Card key={m.label} className="border-border/60 bg-card/70 text-center glow-card">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl font-semibold tabular-nums text-indigo-200">{m.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight md:text-3xl">{L.pricingTitle}</h2>
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.key}
              className={
                p.featured
                  ? "pricing-featured border-indigo-400/40 bg-indigo-500/10"
                  : "border-border/60 bg-card/60"
              }
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {p.key === "starter" ? L.starter : p.key === "growth" ? L.growth : L.scale}
                  </CardTitle>
                  {p.featured && (
                    <Badge className="bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/30">
                      {L.popular}
                    </Badge>
                  )}
                </div>
                <div className="text-4xl font-semibold tracking-tight">
                  ${p.price}
                  <span className="text-sm font-normal text-muted-foreground">{L.perMonth}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-5">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-indigo-300" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-auto w-full"
                  variant={p.featured ? "default" : "outline"}
                  render={<Link href="/app" />}
                >
                  {L.ctaDemo}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-12 text-center text-muted-foreground">{L.ctaFinal}</p>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        {L.footer}
      </footer>
    </div>
  );
}
