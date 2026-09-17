"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { useLeadsStore } from "@/store/leads-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useLeadsStore((s) => s.setHydrated);

  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, [setHydrated]);

  return (
    <AuthProvider>
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AuthProvider>
  );
}
