"use client";

import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-sidebar",
        "lg:ml-[280px]",
        sidebarCollapsed && "lg:ml-16"
      )}
    >
      {children}
    </div>
  );
}
