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
  type LucideIcon,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
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
} from "@/components/ui/sidebar";
import {
  mergePlugins,
  navPlugins,
  isPluginEnabled,
  type PluginId,
} from "@/lib/plugins";

const ICONS: Record<string, LucideIcon> = {
  inbox: Inbox,
  leads: Users,
  companies: Building2,
  deals: Kanban,
  tasks: CheckSquare,
  metrics: LineChart,
  import: Upload,
};

function pluginNavLabel(
  i18n: ReturnType<typeof t>,
  key: "leads" | "inbox" | "deals" | "companies" | "tasks" | "metrics" | "import"
) {
  return i18n.nav[key];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = useLeadsStore((s) => s.settings.language);
  const pluginsRaw = useLeadsStore((s) => s.settings.plugins);
  const plugins = useMemo(() => mergePlugins(pluginsRaw), [pluginsRaw]);
  const threads = useLeadsStore((s) => s.threads);
  const unread = useMemo(
    () => threads.reduce((n, th) => n + (th.unread || 0), 0),
    [threads]
  );
  const i18n = t(lang);

  const crmNav = navPlugins(plugins).filter((p) => p.group === "crm");
  const systemNav = navPlugins(plugins).filter((p) => p.group === "system");

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
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
    ];
    for (const m of map) {
      if (pathname.startsWith(m.prefix) && !isPluginEnabled(plugins, m.id)) {
        router.replace("/app");
        break;
      }
    }
  }, [pathname, plugins, router]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => router.push("/")}
                tooltip={i18n.brand}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#266df0] text-white">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{i18n.brand}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    CRM · plugins
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/app", true)}
                    tooltip={i18n.nav.dashboard}
                    onClick={() => router.push("/app")}
                  >
                    <LayoutDashboard />
                    <span>{i18n.nav.dashboard}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {crmNav.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>CRM</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {crmNav.map((p) => {
                    const Icon = ICONS[p.id] || Users;
                    const label = pluginNavLabel(i18n, p.navKey!);
                    return (
                      <SidebarMenuItem key={p.id}>
                        <SidebarMenuButton
                          isActive={isActive(p.href!)}
                          tooltip={label}
                          onClick={() => router.push(p.href!)}
                        >
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                        {p.id === "inbox" && unread > 0 ? (
                          <SidebarMenuBadge>
                            <Badge
                              variant="default"
                              className="h-5 min-w-5 justify-center px-1 text-[10px]"
                            >
                              {unread}
                            </Badge>
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemNav.map((p) => {
                  const Icon = ICONS[p.id] || Upload;
                  const label = pluginNavLabel(i18n, p.navKey!);
                  return (
                    <SidebarMenuItem key={p.id}>
                      <SidebarMenuButton
                        isActive={isActive(p.href!)}
                        tooltip={label}
                        onClick={() => router.push(p.href!)}
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/app/settings")}
                    tooltip={i18n.nav.settings}
                    onClick={() => router.push("/app/settings")}
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
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-white/90 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex-1" />
          <LanguageToggle className="flex gap-1 md:hidden" />
        </header>
        <main className="flex-1 bg-white p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
