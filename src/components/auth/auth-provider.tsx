"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
  preferSupabaseRepo,
} from "@/lib/supabase";
import {
  ensureWorkspaceForUser,
  type WorkspaceInfo,
} from "@/lib/auth/bootstrap";
import { createDeskRepository } from "@/lib/repo";
import { useLeadsStore } from "@/store/leads-store";

type AuthContextValue = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  user: User | null;
  workspace: WorkspaceInfo | null;
  usingSupabase: boolean;
  bootstrapError: string | null;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const updateSettings = useLeadsStore((s) => s.updateSettings);

  const runBootstrap = useCallback(
    async (active: Session | null) => {
      if (!active) {
        setWorkspace(null);
        setBootstrapError(null);
        return;
      }
      const client = createBrowserSupabaseClient();
      if (!client) return;
      try {
        const ws = await ensureWorkspaceForUser(client, {
          email: active.user.email,
        });
        setWorkspace(ws);
        setBootstrapError(null);
        updateSettings({ companyName: ws.name });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Workspace bootstrap failed";
        setBootstrapError(message);
        console.error("[auth] bootstrap", err);
      }
    },
    [updateSettings]
  );

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    const client = createBrowserSupabaseClient();
    if (!client) {
      setReady(true);
      return;
    }

    let cancelled = false;

    client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      void runBootstrap(data.session).finally(() => {
        if (!cancelled) setReady(true);
      });
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void runBootstrap(next);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured, runBootstrap]);

  const signOut = useCallback(async () => {
    const client = createBrowserSupabaseClient();
    if (client) await client.auth.signOut();
    setSession(null);
    setWorkspace(null);
  }, []);

  const refreshWorkspace = useCallback(async () => {
    await runBootstrap(session);
  }, [runBootstrap, session]);

  const client = createBrowserSupabaseClient();
  const usingSupabase = preferSupabaseRepo({
    hasSession: Boolean(session),
    workspaceId: workspace?.id,
    client,
  });

  useEffect(() => {
    if (!usingSupabase || !workspace || !client) return;
    createDeskRepository({ client, workspaceId: workspace.id });
  }, [usingSupabase, workspace, client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      session,
      user: session?.user ?? null,
      workspace,
      usingSupabase,
      bootstrapError,
      signOut,
      refreshWorkspace,
    }),
    [
      ready,
      configured,
      session,
      workspace,
      usingSupabase,
      bootstrapError,
      signOut,
      refreshWorkspace,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext);
}
