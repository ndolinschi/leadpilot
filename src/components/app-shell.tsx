"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Upload, LineChart, Settings, Sparkles, PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "/app", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/app/import", icon: Upload, key: "import" as const },
  { href: "/app/metrics", icon: LineChart, key: "metrics" as const },
  { href: "/app/settings", icon: Settings, key: "settings" as const },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, icon: Icon, key }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        const label =
          key === "dashboard" ? i18n.nav.dashboard :
          key === "import" ? i18n.nav.import :
          key === "metrics" ? i18n.nav.metrics : i18n.nav.settings;
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-primary/15 text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 p-4 md:flex">
          <Link href="/" className="mb-6 flex items-center gap-2 px-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">{i18n.brand}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Demo</div>
            </div>
          </Link>
          <NavLinks />
          <div className="mt-auto space-y-3">
            <Separator />
            <LanguageToggle className="flex gap-1" />
            <Button variant="outline" size="sm" className="w-full" render={<Link href="/" />}>
              {i18n.nav.backMarketing}
            </Button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <PanelLeft className="size-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <SheetHeader className="mb-4"><SheetTitle>{i18n.brand}</SheetTitle></SheetHeader>
                  <NavLinks onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <span className="font-semibold">{i18n.brand}</span>
            </div>
            <LanguageToggle className="flex gap-1" />
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
