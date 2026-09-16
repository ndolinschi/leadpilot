"use client";

import Link from "next/link";
import { useLeadsStore } from "@/store/leads-store";
import { isPluginEnabled, mergePlugins, type PluginId } from "@/lib/plugins";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export function usePluginEnabled(id: PluginId): boolean {
  return useLeadsStore((s) => isPluginEnabled(mergePlugins(s.settings.plugins), id));
}

export function PluginGate({
  id,
  children,
}: {
  id: PluginId;
  children: React.ReactNode;
}) {
  const enabled = usePluginEnabled(id);
  const lang = useLeadsStore((s) => s.settings.language);
  const i18n = t(lang);

  if (!enabled) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
        <p className="text-lg font-semibold tracking-tight">
          {i18n.plugins.disabledTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          {i18n.plugins.disabledBody}
        </p>
        <Button render={<Link href="/app/settings" />}>
          {i18n.nav.settings}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
