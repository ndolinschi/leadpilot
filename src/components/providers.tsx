"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useLeadsStore } from "@/store/leads-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useLeadsStore((s) => s.setHydrated);

  useEffect(() => {
    // Always unlock UI quickly even if persist is slow/corrupt
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, [setHydrated]);

  return (
    <TooltipProvider>
      {children}
      <Toaster richColors position="top-right" />
    </TooltipProvider>
  );
}
