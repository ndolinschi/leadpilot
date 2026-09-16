"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useLeadsStore } from "@/store/leads-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useLeadsStore((s) => s.setHydrated);
  const hydrated = useLeadsStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      const t = setTimeout(() => setHydrated(true), 0);
      return () => clearTimeout(t);
    }
  }, [hydrated, setHydrated]);

  return (
    <TooltipProvider>
      {children}
      <Toaster richColors position="top-right" />
    </TooltipProvider>
  );
}
