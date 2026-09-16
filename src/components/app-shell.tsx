"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sparkles,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
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

const mainLinks = [
  { href: "/app", icon: LayoutDashboard, key: "dashboard" as const, exact: true },
  { href: "/app/inbox", icon: Inbox, key: "inbox" as const },
  { href: "/app/leads", icon: Users, key: "leads" as const },
  { href: "/app/companies", icon: Building2, key: "companies" as const },
  { href: "/app/deals", icon: Kanban, key: "deals" as const },
  { href: "/app/tasks", icon: CheckSquare, key: "tasks" as const },
];

const secondaryLinks = [
  { href: "/app/metrics", icon: LineChart, key: "metrics" as const },
  { href: "/app/import", icon: Upload, key: "import" as const },
  { href: "/app/settings", icon: Settings, key: "settings" as const },
];

function navLabel(
  i18n: ReturnType<typeof t>,
  key: (typeof mainLinks)[number]["key"] | (typeof secondaryLinks)[number]["key"]
) {
  switch (key) {
    case "dashboard":
      return i18n.nav.dashboard;
    case "inbox":
      return i18n.nav.inbox;
    case "leads":
      return i18n.nav.leads;
    case "companies":
      return i18n.nav.companies;
    case "deals":
      return i18n.nav.deals;
    case "tasks":
      return i18n.nav.tasks;
    case "metrics":
      return i18n.nav.metrics;
    case "import":
      return i18n.nav.import;
    case "settings":
      return i18n.nav.settings;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lang = useLeadsStore((s) => s.settings.language);
  const unread = useLeadsStore((s) =>
    s.threads.reduce((n, th) => n + (th.unread || 0), 0)
  );
  const i18n = t(lang);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link href="/" />}
                tooltip={i18n.brand}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{i18n.brand}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    CRM · ML Demo
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>CRM</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainLinks.map(({ href, icon: Icon, key, exact }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={isActive(href, exact)}
                      tooltip={navLabel(i18n, key)}
                      render={<Link href={href} />}
                    >
                      <Icon />
                      <span>{navLabel(i18n, key)}</span>
                    </SidebarMenuButton>
                    {key === "inbox" && unread > 0 ? (
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryLinks.map(({ href, icon: Icon, key }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={isActive(href)}
                      tooltip={navLabel(i18n, key)}
                      render={<Link href={href} />}
                    >
                      <Icon />
                      <span>{navLabel(i18n, key)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
            <LanguageToggle className="flex gap-1" />
            <Button variant="outline" size="sm" render={<Link href="/" />}>
              {i18n.nav.backMarketing}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex-1" />
          <LanguageToggle className="flex gap-1 md:hidden" />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
