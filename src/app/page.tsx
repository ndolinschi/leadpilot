"use client";

import { useState } from "react";
import {
  ArrowRight,
  MessageSquare,
  Shield,
  Zap,
  Check,
  LayoutDashboard,
  Upload,
  Kanban,
  Workflow,
  Megaphone,
  Lock,
  Menu,
  Store,
  Code2,
  Bot,
  Send,
  Building2,
  Activity,
  CreditCard,
} from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/language-toggle";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { SUMMARY } from "@/lib/eval-metrics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  const L = i18n.landing;
  const isRu = lang === "ru";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const steps = [
    {
      num: 1,
      name: L.step1Name,
      plugin: L.step1Plugin,
      desc: L.step1Desc,
      icon: Upload,
    },
    {
      num: 2,
      name: L.step2Name,
      plugin: L.step2Plugin,
      desc: L.step2Desc,
      icon: Zap,
    },
    {
      num: 3,
      name: L.step3Name,
      plugin: L.step3Plugin,
      desc: L.step3Desc,
      icon: MessageSquare,
    },
    {
      num: 4,
      name: L.step4Name,
      plugin: L.step4Plugin,
      desc: L.step4Desc,
      icon: Kanban,
    },
  ];

  const modulesList = [
    {
      name: isRu ? "Каналы и захват лидов" : "Channels & Ingestion",
      badge: isRu ? "CSV + Viber + Telegram" : "CSV + Viber + Telegram",
      badgeVariant: "active" as const,
      icon: Upload,
      pain: isRu
        ? "Клиники и агентства тонут в разрозненных заявках из Facebook, Viber и звонках."
        : "Clinics and agencies drown in fragmented Facebook forms, Viber pings, and missed calls.",
      desc: isRu
        ? "Единый захват из CSV, Telegram-ботов, Viber Business API и Meta Lead Ads в общую очередь."
        : "Unified webhook intake for CSV exports, Telegram bots, Viber API, and Facebook Lead Ads.",
    },
    {
      name: isRu ? "ML-скоринг интереса" : "ML Priority & Intent Scoring",
      badge: isRu ? "По умолчанию" : "Default On",
      badgeVariant: "active" as const,
      icon: Zap,
      pain: isRu
        ? "Очередь FIFO стынет; платёжеспособные клиенты ждут часами позади нецелевых."
        : "Chronological FIFO queues go cold; high-ticket buyers wait behind tire-kickers.",
      desc: isRu
        ? "Мгновенное ранжирование (0–100) по вероятности покупки и подбор лучшего канала для ответа."
        : "Calibrated logistic conversion scoring (0–100) and highest-reply channel recommendation.",
    },
    {
      name: isRu ? "Единые диалоги с AI-помощником" : "Conversations & AI Composer",
      badge: L.moduleActive,
      badgeVariant: "active" as const,
      icon: MessageSquare,
      pain: isRu
        ? "Операторы скачут между 4 окнами мессенджеров, путают контекст и теряют историю."
        : "Operators juggle 4 messenger tabs, lose patient context, and drop follow-ups.",
      desc: isRu
        ? "Омниканальный чат с авто-подсказками ответов, черновиками и быстрым выходом на сделку."
        : "Omnichannel chat with instant contextual AI drafting and objection-handling scripts.",
    },
    {
      name: isRu ? "Сделки и мгновенные вердикты" : "Deals & Outcome Verdicts",
      badge: isRu ? "Ядро" : "Core Desk",
      badgeVariant: "locked" as const,
      icon: Kanban,
      pain: isRu
        ? "Руководство не знает честный статус: исходы звонков держатся в голове оператора."
        : "Management lacks honest visibility: call verdicts stay locked in reps' memory.",
      desc: isRu
        ? "Фиксация вердикта: Выигран / Проигран / Без ответа в один клик с авто-обучением алгоритма."
        : "One-click Won / Lost / No-reply logging that feeds training data to the ML engine.",
    },
    {
      name: isRu ? "Публичный REST API и вебхуки" : "Public REST API & Webhooks",
      badge: "v1 Ready",
      badgeVariant: "active" as const,
      icon: Code2,
      pain: isRu
        ? "Внешние сайты и телефония не могут напрямую передавать лидов в колл-центр."
        : "External websites, PBX telephony, and ERPs struggle to pipe leads to the desk.",
      desc: isRu
        ? "Bearer API-ключи, OpenAPI 3.0, эндпоинты /api/v1/leads, /score, /messages и вебхуки."
        : "Bearer lp_... auth, OpenAPI 3.0, /api/v1/leads, /score, /messages, and Telegram/Viber webhooks.",
    },
    {
      name: isRu ? "Автоматизация и маршрутизация" : "Workflow & SLA Routing",
      badge: isRu ? "В разработке" : "Preview",
      badgeVariant: "coming" as const,
      icon: Workflow,
      pain: isRu
        ? "Горячие лиды висят без ответа дольше 15 минут в пиковые часы."
        : "Hot incoming leads linger unassigned beyond 15-minute response SLAs.",
      desc: isRu
        ? "Авто-распределение по дежурным операторам, триггеры эскалации и контроль времени ответа."
        : "Rules-based lead assignment, stage escalation triggers, and response SLA clocks.",
    },
  ];

  const plans = [
    {
      key: "starter" as const,
      price: L.starterPrice,
      mdl: L.starterMdl,
      who: L.starterWho,
      pluginsText: L.starterPlugins,
      features: [L.fStarter1, L.fStarter2, L.fStarter3, L.fStarter4],
    },
    {
      key: "growth" as const,
      price: L.growthPrice,
      mdl: L.growthMdl,
      featured: true,
      who: L.growthWho,
      pluginsText: L.growthPlugins,
      features: [L.fGrowth1, L.fGrowth2, L.fGrowth3, L.fGrowth4],
    },
    {
      key: "scale" as const,
      price: L.scalePrice,
      mdl: L.scaleMdl,
      who: L.scaleWho,
      pluginsText: L.scalePlugins,
      features: [L.fScale1, L.fScale2, L.fScale3, L.fScale4],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#266df0] text-white shadow-2xs">
              <LayoutDashboard className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900">{i18n.brand}</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 text-sm text-zinc-500 md:flex">
            <a href="#product" className="transition-colors hover:text-zinc-900">{i18n.nav.product}</a>
            <a href="#how" className="transition-colors hover:text-zinc-900">{i18n.nav.how}</a>
            <a href="#modules" className="transition-colors hover:text-zinc-900">{i18n.nav.modules}</a>
            <a href="#metrics" className="transition-colors hover:text-zinc-900">{i18n.nav.metrics}</a>
            <a href="#pricing" className="transition-colors hover:text-zinc-900">{i18n.nav.pricing}</a>
            <ButtonLink href="/app/developers" variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900">
              API
            </ButtonLink>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle className="flex gap-1" />
            <ButtonLink href="/app/inbox" size="sm" className="hidden sm:inline-flex">
              {i18n.nav.demo}
            </ButtonLink>

            {/* Mobile Hamburger Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Toggle Navigation" />}>
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
                <div>
                  <SheetHeader className="pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#266df0] text-white">
                        <LayoutDashboard className="size-3.5" />
                      </div>
                      <SheetTitle className="text-base font-semibold">{i18n.brand}</SheetTitle>
                    </div>
                  </SheetHeader>

                  <nav className="flex flex-col gap-3 py-6 text-sm">
                    <a
                      href="#product"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1 text-zinc-700 font-medium hover:text-[#266df0]"
                    >
                      {i18n.nav.product}
                    </a>
                    <a
                      href="#how"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1 text-zinc-700 font-medium hover:text-[#266df0]"
                    >
                      {i18n.nav.how}
                    </a>
                    <a
                      href="#modules"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1 text-zinc-700 font-medium hover:text-[#266df0]"
                    >
                      {i18n.nav.modules}
                    </a>
                    <a
                      href="#metrics"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1 text-zinc-700 font-medium hover:text-[#266df0]"
                    >
                      {i18n.nav.metrics}
                    </a>
                    <a
                      href="#pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1 text-zinc-700 font-medium hover:text-[#266df0]"
                    >
                      {i18n.nav.pricing}
                    </a>
                    <ButtonLink
                      href="/app/developers"
                      variant="outline"
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-2 inline-flex items-center justify-center gap-1.5"
                    >
                      <Code2 className="size-3.5" />
                      <span>{i18n.nav.developers}</span>
                    </ButtonLink>
                  </nav>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <ButtonLink
                    href="/app/inbox"
                    size="default"
                    className="w-full justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {L.ctaDemo}
                  </ButtonLink>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-50/50">
        <div className="hero-soft pointer-events-none absolute inset-0" aria-hidden />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 md:pb-24 md:pt-20">
          <Badge variant="outline" className="animate-fade-up mb-4 border-blue-200 bg-blue-50/80 text-blue-700 text-xs font-medium">
            {L.heroBadge}
          </Badge>
          <h1 className="animate-fade-up-delay-1 max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-6xl md:leading-[1.08]">
            {L.heroTitle}
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg md:text-xl leading-relaxed">
            {L.heroSub}
          </p>
          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/app/inbox" size="lg" className="inline-flex items-center gap-2 shadow-md shadow-blue-500/10">
              <MessageSquare className="size-4" />
              <span>{L.ctaDemo}</span>
              <ArrowRight className="size-4" />
            </ButtonLink>
            <a
              href="#how"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              {L.ctaHow}
            </a>
            <a
              href="#pricing"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-transparent bg-zinc-100 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70"
            >
              {i18n.nav.pricing}
            </a>
          </div>

          {/* Moldova Framing Pill */}
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">
              {isRu ? "Оптимизировано для:" : "Built for:"}
            </span>
            <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600">
              {isRu ? "Digital-агентства" : "Digital Agencies"}
            </Badge>
            <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600">
              {isRu ? "Медицинские клиники" : "Health Clinics"}
            </Badge>
            <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600">
              {isRu ? "Банки и микрофинансы" : "FinTech & Lending"}
            </Badge>
            <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600">
              {isRu ? "E-commerce поддержка" : "E-Commerce Support"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Problem & Product Section */}
      <section id="product" className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
              <Shield className="size-4 text-rose-600" />
              {L.problemTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed text-zinc-600 text-sm">{L.problemBody}</CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/20 shadow-2xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
              <LayoutDashboard className="size-4 text-blue-600" />
              {L.productTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed text-zinc-600 text-sm">{L.productBody}</CardContent>
        </Card>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how" className="border-y border-zinc-100 bg-zinc-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {L.howTitle}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              {L.howSubtitle}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <Card
                key={s.num}
                className="flex flex-col justify-between border-zinc-200 bg-white shadow-2xs transition-transform hover:-translate-y-0.5"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <s.icon className="size-4" />
                    </div>
                    <Badge variant="outline" className="border-zinc-200 text-zinc-500 text-[10px]">
                      Step {s.num}
                    </Badge>
                  </div>
                  <CardTitle className="pt-2 text-base text-zinc-900 font-semibold">
                    {s.num}. {s.name}
                  </CardTitle>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {s.plugin}
                  </p>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-zinc-500 pt-2">
                  {s.desc}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <ButtonLink href="/app/inbox" size="sm" className="inline-flex items-center gap-1.5">
              <span>{L.ctaDemo}</span>
              <ArrowRight className="size-3.5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Section: Modules & Connector Marketplace */}
      <section id="modules" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 border-blue-200 bg-blue-50 text-blue-700">
            {isRu ? "Модульная архитектура" : "Modular Desk Architecture"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {L.modulesTitle}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
            {L.modulesSubtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulesList.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.name} className="border-zinc-200 bg-white shadow-2xs transition-colors hover:border-blue-300 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="size-4" />
                    </div>
                    {m.badgeVariant === "locked" ? (
                      <Badge variant="outline" className="border-zinc-300 text-zinc-600 text-[10px]">
                        <Lock className="mr-1 size-2.5" />
                        {m.badge}
                      </Badge>
                    ) : m.badgeVariant === "coming" ? (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                        {m.badge}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white text-[10px] hover:bg-emerald-600">
                        {m.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="pt-2 text-base text-zinc-900 font-semibold">
                    {m.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-zinc-500 pt-0">
                  <p className="text-zinc-700">
                    <span className="font-semibold text-zinc-900">{i18n.plugins.pain}: </span>
                    {m.pain}
                  </p>
                  <p className="leading-relaxed text-zinc-600">{m.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <ButtonLink href="/app/marketplace" variant="outline" size="sm" className="inline-flex items-center gap-1.5">
            <Store className="size-4 text-blue-600" />
            <span>{isRu ? "Открыть Маркетплейс коннекторов" : "Browse All Connectors"}</span>
          </ButtonLink>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metrics" className="border-y border-zinc-100 bg-zinc-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl text-center">
            {L.metricsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: L.metricAuc, value: SUMMARY.auc.toFixed(3) },
              { label: L.metricLift, value: `${SUMMARY.liftAt20.toFixed(2)}×` },
              { label: L.metricReply, value: `${SUMMARY.replyLift.toFixed(2)}×` },
            ].map((m) => (
              <Card key={m.label} className="border-zinc-200 bg-white text-center shadow-2xs">
                <CardContent className="pb-8 pt-8">
                  <div className="text-4xl font-semibold tabular-nums text-blue-600">{m.value}</div>
                  <div className="mt-2 text-sm text-zinc-500">{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with MDL Rates */}
      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 pb-24">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {L.pricingTitle}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              {L.pricingSubtitle}
            </p>
            <p className="mt-1 text-xs text-blue-700 font-medium">
              {L.rateComment}
            </p>
          </div>

          <div className="grid items-stretch gap-5 grid-cols-1 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.key}
                className={
                  p.featured
                    ? "relative flex flex-col justify-between border-2 border-blue-600 bg-white shadow-md"
                    : "flex flex-col justify-between border-zinc-200 bg-white shadow-2xs"
                }
              >
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base text-zinc-900">
                      {p.key === "starter" ? L.starter : p.key === "growth" ? L.growth : L.scale}
                    </CardTitle>
                    {p.featured && (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600 text-[10px]">
                        {L.popular}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-4xl font-bold tracking-tight text-zinc-900">
                      ${p.price}
                      <span className="text-sm font-normal text-zinc-500">{L.perMonth}</span>
                    </div>
                    <div className="text-xs font-semibold text-blue-700 mt-0.5">
                      {p.mdl} {L.perMonth}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed min-h-[44px]">
                    {p.who}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4 pt-0">
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-2.5">
                    <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                      {isRu ? "Включенные модули:" : "Included modules:"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                      {p.pluginsText}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-600 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <ButtonLink
                    href="/app/inbox"
                    className="mt-auto w-full font-medium"
                    variant={p.featured ? "default" : "outline"}
                  >
                    {L.ctaDemo}
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Free Demo Line */}
          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 text-center">
            <p className="text-sm font-medium text-blue-950">
              {L.freeDemoNote}
            </p>
            <div className="mt-3">
              <ButtonLink href="/app/inbox" size="sm" className="inline-flex items-center gap-1.5">
                <span>{L.ctaFinal}</span>
                <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50/50 py-8 text-center text-sm text-zinc-500">
        <p>{L.footer}</p>
      </footer>
    </div>
  );
}
