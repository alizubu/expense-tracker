"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-sidebar",
          "lg:ml-[280px]",
          sidebarCollapsed && "lg:ml-16"
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 px-4 py-6 pb-24 lg:px-6 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
