"use client";

import { ArrowRight, Target, MessageSquare, BarChart3, Shield, Zap, Check, LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
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
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <LayoutDashboard className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900">{i18n.brand}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-500 md:flex">
            <a href="#product" className="transition-colors hover:text-zinc-900">{i18n.nav.product}</a>
            <a href="#how" className="transition-colors hover:text-zinc-900">{i18n.nav.how}</a>
            <a href="#metrics" className="transition-colors hover:text-zinc-900">{i18n.nav.metrics}</a>
            <a href="#pricing" className="transition-colors hover:text-zinc-900">{i18n.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle className="flex gap-1" />
            <ButtonLink href="/app" size="sm">{i18n.nav.demo}</ButtonLink>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-zinc-50/50">
        <div className="hero-soft pointer-events-none absolute inset-0" aria-hidden />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
          <Badge variant="outline" className="animate-fade-up mb-5 border-zinc-200 bg-white text-zinc-600">
            ML · Channel · Message · Explainability
          </Badge>
          <h1 className="animate-fade-up-delay-1 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl md:leading-[1.08]">
            {L.heroTitle}
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-lg text-zinc-500 md:text-xl">
            {L.heroSub}
          </p>
          <div className="animate-fade-up-delay-3 mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/app" size="lg" className="inline-flex items-center gap-1.5">{L.ctaDemo}<ArrowRight className="size-4" /></ButtonLink>
            <a href="#how" className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50">{L.ctaHow}</a>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
              <Shield className="size-4 text-rose-600" />
              {L.problemTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed text-zinc-500">{L.problemBody}</CardContent>
        </Card>
        <Card className="border-zinc-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
              <LayoutDashboard className="size-4 text-blue-600" />
              {L.productTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed text-zinc-500">{L.productBody}</CardContent>
        </Card>
      </section>

      <section id="how" className="border-y border-zinc-100 bg-zinc-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{L.howTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Card key={s.title} className="border-zinc-200 bg-white shadow-sm transition-transform hover:-translate-y-0.5">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <s.icon className="size-4" />
                  </div>
                  <CardTitle className="text-sm text-zinc-900">
                    <span className="mr-2 text-zinc-400">{i + 1}.</span>
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-zinc-500">{s.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="metrics" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{L.metricsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: L.metricAuc, value: SUMMARY.auc.toFixed(3) },
            { label: L.metricLift, value: `${SUMMARY.liftAt20.toFixed(2)}×` },
            { label: L.metricReply, value: `${SUMMARY.replyLift.toFixed(2)}×` },
          ].map((m) => (
            <Card key={m.label} className="border-zinc-200 bg-white text-center shadow-sm">
              <CardContent className="pb-8 pt-8">
                <div className="text-4xl font-semibold tabular-nums text-blue-600">{m.value}</div>
                <div className="mt-2 text-sm text-zinc-500">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 pb-24">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{L.pricingTitle}</h2>
          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.key}
                className={
                  p.featured
                    ? "pricing-featured border-blue-200 bg-white"
                    : "border-zinc-200 bg-white shadow-sm"
                }
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base text-zinc-900">
                      {p.key === "starter" ? L.starter : p.key === "growth" ? L.growth : L.scale}
                    </CardTitle>
                    {p.featured && (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        {L.popular}
                      </Badge>
                    )}
                  </div>
                  <div className="text-4xl font-semibold tracking-tight text-zinc-900">
                    ${p.price}
                    <span className="text-sm font-normal text-zinc-500">{L.perMonth}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-5">
                  <ul className="space-y-3 text-sm text-zinc-500">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-blue-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href="/app"
                    className="mt-auto w-full"
                    variant={p.featured ? "default" : "outline"}
                    >
                    {L.ctaDemo}
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-12 text-center text-zinc-500">{L.ctaFinal}</p>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500">
        {L.footer}
      </footer>
    </div>
  );
}
