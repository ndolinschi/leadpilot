"use client";

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
} from "lucide-react";
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
  const isRu = lang === "ru";

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

  const pluginsList = [
    {
      name: isRu ? "Базовая CRM (Ядро)" : "Core CRM & Database",
      badge: L.pluginCoreLocked,
      badgeVariant: "locked" as const,
      icon: LayoutDashboard,
      pain: isRu ? "Данные клиентов теряются в разрозненных блокнотах и Excel." : "Lead data scattered across random notes and spreadsheets.",
      desc: isRu ? "Единая база контактов, справочник компаний и задачи с привязкой к сделке." : "Unified contact directory, company linkage, and tied task reminders.",
    },
    {
      name: isRu ? "Единый Inbox и Чат" : "Unified Inbox & Chat",
      badge: L.pluginActive,
      badgeVariant: "active" as const,
      icon: MessageSquare,
      pain: isRu ? "Операторы скачут между почтой, мессенджерами и вкладками CRM." : "Reps context-switch between email, messengers, and CRM tabs.",
      desc: isRu ? "Омниканальная переписка с авто-подсказками и генерацией ответов на базе AI." : "Omnichannel conversations with real-time AI composer and reply assist.",
    },
    {
      name: isRu ? "AI-скоринг и интерес" : "AI Scoring & Intent",
      badge: isRu ? "По умолчанию" : "Default On",
      badgeVariant: "active" as const,
      icon: Zap,
      pain: isRu ? "Очередь FIFO стынет; горячие лиды ждут за холодными." : "Chronological FIFO queues go cold; buyers wait behind tire-kickers.",
      desc: isRu ? "ML-оценка вероятности конверсии (0–100) и рекомендация лучшего канала." : "ML probability ranking (0–100) and highest-reply channel recommendation.",
    },
    {
      name: isRu ? "Каналы и захват" : "Channels & Ingestion",
      badge: isRu ? "CSV Активен · Соцсети Скоро" : "CSV Active · Social Soon",
      badgeVariant: "active" as const,
      icon: Upload,
      pain: isRu ? "Ручной перенос лидов из файлов и рекламы тормозит первый контакт." : "Manual lead intake from spreadsheets and ads stalls first-touch speed.",
      desc: isRu ? "Пакетный CSV-импорт сегодня; коннекторы Facebook, Viber и Telegram скоро." : "Bulk CSV import with on-the-fly scoring; Facebook, Viber, and Telegram next.",
    },
    {
      name: isRu ? "Автоматизация Workflow" : "Workflow Automation",
      badge: L.pluginComing,
      badgeVariant: "coming" as const,
      icon: Workflow,
      pain: isRu ? "Ручной роутинг задерживает горячих клиентов без ответа." : "Manual dispatch delays hot incoming leads without clear ownership.",
      desc: isRu ? "Авто-распределение по операторам, триггеры стадий и контроль SLA за 15 минут." : "Rules-based lead assignment, stage transitions, and 15-minute SLA timers.",
    },
    {
      name: isRu ? "Аутбаунд-кампании" : "Outbound Campaigns",
      badge: L.pluginComing,
      badgeVariant: "coming" as const,
      icon: Megaphone,
      pain: isRu ? "Ручные касания по одному не позволяют масштабировать охват." : "1-on-1 cold outreach does not scale across broad account lists.",
      desc: isRu ? "Многошаговые цепочки Email, LinkedIn и мессенджеров с умным автостопом." : "Multi-touch outbound sequences that automatically halt once a prospect replies.",
    },
  ];

  const plans = [
    {
      key: "starter" as const,
      price: 49,
      who: L.starterWho,
      pluginsText: L.starterPlugins,
      features: [L.fStarter1, L.fStarter2, L.fStarter3, L.fStarter4],
    },
    {
      key: "growth" as const,
      price: 149,
      featured: true,
      who: L.growthWho,
      pluginsText: L.growthPlugins,
      features: [L.fGrowth1, L.fGrowth2, L.fGrowth3, L.fGrowth4],
    },
    {
      key: "scale" as const,
      price: 399,
      who: L.scaleWho,
      pluginsText: L.scalePlugins,
      features: [L.fScale1, L.fScale2, L.fScale3, L.fScale4],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#266df0] text-white">
              <LayoutDashboard className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900">{i18n.brand}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-500 md:flex">
            <a href="#product" className="transition-colors hover:text-zinc-900">{i18n.nav.product}</a>
            <a href="#how" className="transition-colors hover:text-zinc-900">{i18n.nav.how}</a>
            <a href="#plugins" className="transition-colors hover:text-zinc-900">{i18n.nav.plugins}</a>
            <a href="#metrics" className="transition-colors hover:text-zinc-900">{i18n.nav.metrics}</a>
            <a href="#pricing" className="transition-colors hover:text-zinc-900">{i18n.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle className="flex gap-1" />
            <ButtonLink href="/app/inbox" size="sm">{i18n.nav.demo}</ButtonLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-50/50">
        <div className="hero-soft pointer-events-none absolute inset-0" aria-hidden />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
          <Badge variant="outline" className="animate-fade-up mb-5 border-blue-200 bg-blue-50/70 text-blue-700">
            {L.heroBadge}
          </Badge>
          <h1 className="animate-fade-up-delay-1 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl md:leading-[1.08]">
            {L.heroTitle}
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-lg text-zinc-500 md:text-xl leading-relaxed">
            {L.heroSub}
          </p>
          <div className="animate-fade-up-delay-3 mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/app/inbox" size="lg" className="inline-flex items-center gap-2 shadow-md shadow-blue-500/10">
              <MessageSquare className="size-4" />
              <span>{L.ctaDemo}</span>
              <ArrowRight className="size-4" />
            </ButtonLink>
            <a
              href="#how"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              {L.ctaHow}
            </a>
            <a
              href="#pricing"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-transparent bg-zinc-100 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70"
            >
              {i18n.nav.pricing}
            </a>
          </div>
        </div>
      </section>

      {/* Problem & Product Section */}
      <section id="product" className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-2">
        <Card className="border-zinc-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
              <Shield className="size-4 text-rose-600" />
              {L.problemTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed text-zinc-500 text-sm">{L.problemBody}</CardContent>
        </Card>
        <Card className="border-blue-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
              <LayoutDashboard className="size-4 text-blue-600" />
              {L.productTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed text-zinc-500 text-sm">{L.productBody}</CardContent>
        </Card>
      </section>

      {/* Section: How It Works (4 Steps naming plugins) */}
      <section id="how" className="border-y border-zinc-100 bg-zinc-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              {L.howTitle}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {L.howSubtitle}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <Card
                key={s.num}
                className="flex flex-col justify-between border-zinc-200 bg-white shadow-xs transition-transform hover:-translate-y-0.5"
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

      {/* Section: Plugin Platform (Shopify-app feel) */}
      <section id="plugins" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 border-blue-200 bg-blue-50 text-blue-700">
            {isRu ? "Модульная архитектура" : "App-Store Architecture"}
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            {L.pluginsTitle}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {L.pluginsSubtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pluginsList.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.name} className="border-zinc-200 bg-white shadow-xs transition-colors hover:border-blue-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="size-4" />
                    </div>
                    {p.badgeVariant === "locked" ? (
                      <Badge variant="outline" className="border-zinc-300 text-zinc-600 text-[10px]">
                        <Lock className="mr-1 size-2.5" />
                        {p.badge}
                      </Badge>
                    ) : p.badgeVariant === "coming" ? (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                        {p.badge}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px]">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="pt-2 text-base text-zinc-900 font-semibold">
                    {p.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-zinc-500 pt-0">
                  <p className="text-zinc-700">
                    <span className="font-semibold text-zinc-900">{i18n.plugins.pain}: </span>
                    {p.pain}
                  </p>
                  <p className="leading-relaxed text-zinc-500">{p.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section: Metrics */}
      <section id="metrics" className="border-y border-zinc-100 bg-zinc-50/80">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl text-center">
            {L.metricsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: L.metricAuc, value: SUMMARY.auc.toFixed(3) },
              { label: L.metricLift, value: `${SUMMARY.liftAt20.toFixed(2)}×` },
              { label: L.metricReply, value: `${SUMMARY.replyLift.toFixed(2)}×` },
            ].map((m) => (
              <Card key={m.label} className="border-zinc-200 bg-white text-center shadow-xs">
                <CardContent className="pb-8 pt-8">
                  <div className="text-4xl font-semibold tabular-nums text-blue-600">{m.value}</div>
                  <div className="mt-2 text-sm text-zinc-500">{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Louder Pricing */}
      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 pb-24">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              {L.pricingTitle}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {L.pricingSubtitle}
            </p>
          </div>

          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.key}
                className={
                  p.featured
                    ? "relative flex flex-col justify-between border-2 border-blue-600 bg-white shadow-md"
                    : "flex flex-col justify-between border-zinc-200 bg-white shadow-xs"
                }
              >
                <CardHeader className="space-y-3 pb-3">
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
                  <div className="text-4xl font-bold tracking-tight text-zinc-900">
                    ${p.price}
                    <span className="text-sm font-normal text-zinc-500">{L.perMonth}</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed min-h-[36px]">
                    {p.who}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4 pt-0">
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-2.5">
                    <p className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                      {isRu ? "Включенные плагины:" : "Included plugins:"}
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
