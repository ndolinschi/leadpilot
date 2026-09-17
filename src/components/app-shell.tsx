"use client";

import { ButtonLink } from "@/components/button-link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  LineChart,
  Upload,
  Settings,
  Store,
  Code2,
  GitBranch,
  Megaphone,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { useAuthOptional } from "@/components/auth/auth-provider";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  mergePlugins,
  isPluginEnabled,
  type PluginId,
} from "@/lib/plugins";

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const lang = useLeadsStore((s) => s.settings.language);
  const pluginsRaw = useLeadsStore((s) => s.settings.plugins);
  const plugins = useMemo(() => mergePlugins(pluginsRaw), [pluginsRaw]);
  const threads = useLeadsStore((s) => s.threads);
  const unread = useMemo(
    () => threads.reduce((n, th) => n + (th.unread || 0), 0),
    [threads]
  );
  const i18n = t(lang);
  const isRu = lang === "ru";
  const auth = useAuthOptional();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function navigate(href: string) {
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push(href);
  }

  // Redirect if current route belongs to a disabled plugin
  useEffect(() => {
    const map: { prefix: string; id: PluginId }[] = [
      { prefix: "/app/inbox", id: "inbox" },
      { prefix: "/app/chat", id: "inbox" },
      { prefix: "/app/leads", id: "leads" },
      { prefix: "/app/companies", id: "companies" },
      { prefix: "/app/deals", id: "deals" },
      { prefix: "/app/tasks", id: "tasks" },
      { prefix: "/app/metrics", id: "metrics" },
      { prefix: "/app/import", id: "import" },
      { prefix: "/app/workflow", id: "workflow" },
      { prefix: "/app/campaign", id: "campaign" },
    ];
    for (const m of map) {
      if (pathname.startsWith(m.prefix) && !isPluginEnabled(plugins, m.id)) {
        router.replace("/app");
        break;
      }
    }
  }, [pathname, plugins, router]);

  return (
    <>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => navigate("/")}
                tooltip={i18n.brand}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#266df0] text-white shadow-2xs">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{i18n.brand}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isRu ? "Обработка клиентов" : "Client Operations Desk"}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* Primary Operator Queue */}
          <SidebarGroup>
            <SidebarGroupLabel>{isRu ? "Очередь" : "Queue"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/app", true)}
                    tooltip={i18n.nav.dashboard}
                    onClick={() => navigate("/app")}
                  >
                    <LayoutDashboard />
                    <span>{i18n.nav.dashboard}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Operations: Leads, Conversations, Deals, Tasks, Companies */}
          <SidebarGroup>
            <SidebarGroupLabel>{isRu ? "Обработка" : "Operations"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isPluginEnabled(plugins, "leads") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/leads")}
                      tooltip={i18n.nav.leads}
                      onClick={() => navigate("/app/leads")}
                    >
                      <Users />
                      <span>{i18n.nav.leads}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {isPluginEnabled(plugins, "inbox") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/inbox") || isActive("/app/chat")}
                      tooltip={i18n.nav.inbox}
                      onClick={() => navigate("/app/inbox")}
                    >
                      <Inbox />
                      <span>{i18n.nav.inbox}</span>
                    </SidebarMenuButton>
                    {unread > 0 && (
                      <SidebarMenuBadge>
                        <Badge
                          variant="default"
                          className="h-5 min-w-5 justify-center px-1 text-[10px] bg-blue-600 text-white"
                        >
                          {unread}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )}

                {isPluginEnabled(plugins, "deals") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/deals")}
                      tooltip={i18n.nav.deals}
                      onClick={() => navigate("/app/deals")}
                    >
                      <Kanban />
                      <span>{i18n.nav.deals}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {isPluginEnabled(plugins, "tasks") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/tasks")}
                      tooltip={i18n.nav.tasks}
                      onClick={() => navigate("/app/tasks")}
                    >
                      <CheckSquare />
                      <span>{i18n.nav.tasks}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {isPluginEnabled(plugins, "companies") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/companies")}
                      tooltip={i18n.nav.companies}
                      onClick={() => navigate("/app/companies")}
                    >
                      <Building2 />
                      <span>{i18n.nav.companies}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {isPluginEnabled(plugins, "workflow") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/workflow")}
                      tooltip={i18n.nav.workflow}
                      onClick={() => navigate("/app/workflow")}
                    >
                      <GitBranch />
                      <span>{i18n.nav.workflow}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {isPluginEnabled(plugins, "campaign") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/campaign")}
                      tooltip={i18n.nav.campaign}
                      onClick={() => navigate("/app/campaign")}
                    >
                      <Megaphone />
                      <span>{i18n.nav.campaign}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Modules & Connectors */}
          <SidebarGroup>
            <SidebarGroupLabel>{isRu ? "Модули и каналы" : "Connectors & Modules"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isPluginEnabled(plugins, "import") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/import")}
                      tooltip={i18n.nav.import}
                      onClick={() => navigate("/app/import")}
                    >
                      <Upload />
                      <span>{i18n.nav.import}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/app/marketplace")}
                    tooltip={i18n.nav.marketplace}
                    onClick={() => navigate("/app/marketplace")}
                  >
                    <Store />
                    <span>{i18n.nav.marketplace}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/app/developers")}
                    tooltip={i18n.nav.developers}
                    onClick={() => navigate("/app/developers")}
                  >
                    <Code2 />
                    <span>{i18n.nav.developers}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isPluginEnabled(plugins, "metrics") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/app/metrics")}
                      tooltip={i18n.nav.metrics}
                      onClick={() => navigate("/app/metrics")}
                    >
                      <LineChart />
                      <span>{i18n.nav.metrics}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/app/settings")}
                    tooltip={i18n.nav.settings}
                    onClick={() => navigate("/app/settings")}
                  >
                    <Settings />
                    <span>{i18n.nav.settings}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />
          <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
            <LanguageToggle className="flex gap-1" />
            <ButtonLink href="/" variant="outline" size="sm">
              {i18n.nav.backMarketing}
            </ButtonLink>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-12 sm:h-14 shrink-0 items-center justify-between gap-1.5 sm:gap-2 border-b border-border bg-white/90 px-2 sm:px-4 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger />
            <span className="font-semibold text-sm truncate text-zinc-900 md:hidden">
              {i18n.brand}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {auth?.usingSupabase && auth.workspace ? (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-medium max-w-[10rem] truncate">
                {auth.workspace.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-medium">
                {isRu ? "Демо-выборка" : "Demo sample"}
              </Badge>
            )}
            {!auth?.session && (
              <ButtonLink href="/login" variant="outline" size="sm" className="h-8 px-2.5 text-xs sm:text-sm sm:px-3">
                {isRu ? "Войти" : "Sign in"}
              </ButtonLink>
            )}
            <LanguageToggle className="flex gap-1" />
          </div>
        </header>
        <main className="flex-1 bg-white p-3 sm:p-5 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
