"use client";

import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const { fetchProfiles } = useProfileStore();
  const { fetchTransactions } = useTransactionStore();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfiles();
      fetchTransactions();
    }
  }, [isLoaded, user]);

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
