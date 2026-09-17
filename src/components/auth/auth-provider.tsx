"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import {
  createDeskRepository,
  setActiveDeskRepository,
  hydrateStoreFromRepository,
  resetStoreToDemoSample,
} from "@/lib/repo";
import { useLeadsStore } from "@/store/leads-store";

type AuthContextValue = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  user: User | null;
  workspace: WorkspaceInfo | null;
  usingSupabase: boolean;
  bootstrapError: string | null;
  deskReady: boolean;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [deskReady, setDeskReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const updateSettings = useLeadsStore((s) => s.updateSettings);
  const hydrateToken = useRef(0);

  const bindAndHydrate = useCallback(
    async (active: Session | null, ws: WorkspaceInfo | null) => {
      const token = ++hydrateToken.current;
      const client = createBrowserSupabaseClient();
      const canUse =
        Boolean(active && ws && client) &&
        preferSupabaseRepo({
          hasSession: Boolean(active),
          workspaceId: ws?.id,
          client,
        });

      if (!canUse || !client || !ws) {
        setActiveDeskRepository(null);
        if (!active) {
          // Keep demo sample for anonymous visitors
          useLeadsStore.setState({ dataBackend: "local" });
        }
        if (token === hydrateToken.current) setDeskReady(true);
        return;
      }

      const repo = createDeskRepository({ client, workspaceId: ws.id });
      setActiveDeskRepository(repo);
      try {
        await hydrateStoreFromRepository(repo, {
          workspaceName: ws.name,
          preserveLanguage: useLeadsStore.getState().settings.language,
        });
        updateSettings({ companyName: ws.name });
      } catch (err) {
        console.error("[auth] hydrate desk", err);
        setBootstrapError(
          err instanceof Error ? err.message : "Failed to load workspace desk"
        );
      } finally {
        if (token === hydrateToken.current) setDeskReady(true);
      }
    },
    [updateSettings]
  );

  const runBootstrap = useCallback(
    async (active: Session | null) => {
      if (!active) {
        setWorkspace(null);
        setBootstrapError(null);
        setActiveDeskRepository(null);
        setDeskReady(true);
        return;
      }
      const client = createBrowserSupabaseClient();
      if (!client) return;
      setDeskReady(false);
      try {
        const ws = await ensureWorkspaceForUser(client, {
          email: active.user.email,
        });
        setWorkspace(ws);
        setBootstrapError(null);
        await bindAndHydrate(active, ws);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Workspace bootstrap failed";
        setBootstrapError(message);
        console.error("[auth] bootstrap", err);
        setDeskReady(true);
      }
    },
    [bindAndHydrate]
  );

  useEffect(() => {
    if (!configured) {
      setReady(true);
      setDeskReady(true);
      return;
    }
    const client = createBrowserSupabaseClient();
    if (!client) {
      setReady(true);
      setDeskReady(true);
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
    setActiveDeskRepository(null);
    resetStoreToDemoSample();
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

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      session,
      user: session?.user ?? null,
      workspace,
      usingSupabase,
      bootstrapError,
      deskReady,
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
      deskReady,
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
