import DevelopersPage from "@/app/app/developers/page";
import { LanguageToggle } from "@/components/language-toggle";
import { ButtonLink } from "@/components/button-link";
import { LayoutDashboard } from "lucide-react";

export default function MarketingDevelopersPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#266df0] text-white">
              <LayoutDashboard className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900">LeadPilot API</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle className="flex gap-1" />
            <ButtonLink href="/app/inbox" size="sm">Open Demo</ButtonLink>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <DevelopersPage />
      </main>
    </div>
  );
}
