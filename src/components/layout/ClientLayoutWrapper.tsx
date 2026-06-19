"use client";

import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const { fetchProfiles } = useProfileStore();
  const { fetchTransactions } = useTransactionStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchProfiles();
      fetchTransactions();
    }
  }, [status, session, fetchProfiles, fetchTransactions]);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-sidebar",
        "lg:ml-[220px]",
        sidebarCollapsed && "lg:ml-16"
      )}
    >
      {children}
    </div>
  );
}
