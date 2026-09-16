"use client";

import { Button } from "@/components/ui/button";
import { useLeadsStore } from "@/store/leads-store";

export function LanguageToggle({ className }: { className?: string }) {
  const language = useLeadsStore((s) => s.settings.language);
  const updateSettings = useLeadsStore((s) => s.updateSettings);
  return (
    <div className={className}>
      <Button variant={language === "en" ? "default" : "ghost"} size="sm" onClick={() => updateSettings({ language: "en" })}>EN</Button>
      <Button variant={language === "ru" ? "default" : "ghost"} size="sm" onClick={() => updateSettings({ language: "ru" })}>RU</Button>
    </div>
  );
}
