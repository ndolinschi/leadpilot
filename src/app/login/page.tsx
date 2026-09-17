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

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/app";
  const auth = useAuthOptional();
  const configured = isSupabaseConfigured();

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
      toast.error("Supabase is not configured");
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
      toast.success("Check your email for the magic link");
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
      toast.error("Supabase is not configured");
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
          toast.success("Account created");
          router.replace(next);
        } else {
          toast.success("Check your email to confirm your account");
        }
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Signed in");
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
      <Card className="w-full max-w-md border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>Sign in unavailable</CardTitle>
          <CardDescription>
            Set <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
            enable Auth. You can still explore the labeled Demo sample without
            signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonLink href="/app" className="w-full bg-[#266df0] hover:bg-[#1f5bd1]">Open Demo sample</ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-zinc-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Sign in to create your real workspace. Anonymous visitors keep the
          labeled Demo sample.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "magic" | "password")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="magic" className="gap-1.5">
              <Mail className="size-3.5" />
              Magic link
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-1.5">
              <KeyRound className="size-3.5" />
              Email & password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="magic" className="mt-0">
            {magicSent ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Magic link sent to <strong>{email}</strong>. Open it on this
                device to finish signing in.
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
                    placeholder="you@company.md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy || !email.trim()}
                  className="w-full h-10 bg-[#266df0] hover:bg-[#1f5bd1]"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Send magic link"
                  )}
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
                  placeholder="you@company.md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-password">Password</Label>
                <Input
                  id="pw-password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={busy || !email.trim() || password.length < 6}
                className="w-full h-10 bg-[#266df0] hover:bg-[#1f5bd1]"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
                onClick={() => setIsSignUp((v) => !v)}
              >
                {isSignUp
                  ? "Already have an account? Sign in"
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
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#266df0] text-white">
            <LayoutDashboard className="size-4" />
          </span>
          LeadPilot
        </Link>
        <ButtonLink href="/app" variant="ghost" size="sm">Demo sample</ButtonLink>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
