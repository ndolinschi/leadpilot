"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { useAuthOptional } from "@/components/auth/auth-provider";
import { useLeadsStore } from "@/store/leads-store";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageToggle } from "@/components/language-toggle";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/app";
  const auth = useAuthOptional();
  const configured = isSupabaseConfigured();
  const lang = useLeadsStore((s) => s.settings.language);
  const isRu = lang === "ru";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (auth?.session && auth.workspace) {
      router.replace(next);
    }
  }, [auth?.session, auth?.workspace, next, router]);

  const siteOrigin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function onMagicLink(e: FormEvent) {
    e.preventDefault();
    const client = createBrowserSupabaseClient();
    if (!client) {
      toast.error(isRu ? "Supabase не настроен" : "Supabase is not configured");
      return;
    }
    setBusy(true);
    try {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setMagicSent(true);
      toast.success(isRu ? "Проверьте почту — ссылка отправлена" : "Check your email for the magic link");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send magic link");
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    const client = createBrowserSupabaseClient();
    if (!client) {
      toast.error(isRu ? "Supabase не настроен" : "Supabase is not configured");
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success(isRu ? "Аккаунт создан" : "Account created");
          router.replace(next);
        } else {
          toast.success(isRu ? "Подтвердите email" : "Check your email to confirm your account");
        }
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success(isRu ? "Вход выполнен" : "Signed in");
        router.replace(next);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <Card className="w-full max-w-md border-zinc-200 shadow-sm mx-auto">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>{isRu ? "Вход недоступен" : "Sign in unavailable"}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isRu
              ? "Задайте NEXT_PUBLIC_SUPABASE_URL и ANON_KEY. Демо-выборку можно открыть без входа."
              : "Set NEXT_PUBLIC_SUPABASE_URL and ANON_KEY. You can still explore the labeled Demo sample."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <ButtonLink href="/app" className="w-full h-11 bg-[#266df0] hover:bg-[#1f5bd1]">
            {isRu ? "Открыть демо" : "Open Demo sample"}
          </ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-zinc-200/80 bg-white shadow-sm mx-auto">
      <CardHeader className="space-y-1 px-4 sm:px-6 pt-5 sm:pt-6">
        <CardTitle className="text-xl tracking-tight">
          {isRu ? "С возвращением" : "Welcome back"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">
          {isRu
            ? "Войдите, чтобы создать реальное рабочее пространство. Без входа — только демо-выборка."
            : "Sign in to create your real workspace. Anonymous visitors keep the labeled Demo sample."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6">
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "magic" | "password")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 h-10">
            <TabsTrigger value="magic" className="gap-1.5 text-xs sm:text-sm">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{isRu ? "Magic link" : "Magic link"}</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-1.5 text-xs sm:text-sm">
              <KeyRound className="size-3.5 shrink-0" />
              <span className="truncate">{isRu ? "Пароль" : "Password"}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="magic" className="mt-0">
            {magicSent ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 sm:px-4 py-3 text-sm text-emerald-900">
                {isRu ? "Ссылка отправлена на" : "Magic link sent to"}{" "}
                <strong className="break-all">{email}</strong>.
              </div>
            ) : (
              <form onSubmit={onMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    autoComplete="email"
                    required
                    inputMode="email"
                    placeholder="you@company.md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-base sm:text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy || !email.trim()}
                  className="w-full h-11 bg-[#266df0] hover:bg-[#1f5bd1]"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : isRu ? "Отправить ссылку" : "Send magic link"}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <form onSubmit={onPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pw-email">Email</Label>
                <Input
                  id="pw-email"
                  type="email"
                  autoComplete="email"
                  required
                  inputMode="email"
                  placeholder="you@company.md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-password">{isRu ? "Пароль" : "Password"}</Label>
                <Input
                  id="pw-password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-base sm:text-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={busy || !email.trim() || password.length < 6}
                className="w-full h-11 bg-[#266df0] hover:bg-[#1f5bd1]"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSignUp ? (
                  isRu ? "Создать аккаунт" : "Create account"
                ) : (
                  isRu ? "Войти" : "Sign in"
                )}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-800 py-1"
                onClick={() => setIsSignUp((v) => !v)}
              >
                {isSignUp
                  ? isRu
                    ? "Уже есть аккаунт? Войти"
                    : "Already have an account? Sign in"
                  : isRu
                    ? "Нужен аккаунт? Создать"
                    : "Need an account? Create one"}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const isRu = lang === "ru";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-zinc-50">
      <header className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 safe-area-pt">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 min-w-0"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#266df0] text-white">
            <LayoutDashboard className="size-4" />
          </span>
          <span className="truncate">LeadPilot</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageToggle className="flex gap-1" />
          <ButtonLink href="/app" variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            {isRu ? "Демо" : "Demo"}
          </ButtonLink>
        </div>
      </header>

      <main className="flex flex-1 items-start sm:items-center justify-center px-3 sm:px-4 pb-10 pt-4 sm:pt-0 sm:pb-16">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-sm text-zinc-500 py-12">
              <Loader2 className="size-4 animate-spin" />
              {isRu ? "Загрузка…" : "Loading…"}
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
