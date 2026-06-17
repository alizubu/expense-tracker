"use client";

import { Search, Plus, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Wallet } from "lucide-react";

export function Topbar() {
  const { sidebarCollapsed, openModal, toggleSidebar } = useUIStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-background-primary/80 px-4 backdrop-blur-xl lg:px-6",
        "lg:ml-[var(--sidebar-offset)]"
      )}
      style={{
        ["--sidebar-offset" as string]: sidebarCollapsed ? "64px" : "280px",
      }}
    >
      {/* Left — Mobile menu + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-text-muted hover:bg-white/[0.05] hover:text-text-secondary transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-purple/20">
            <Wallet className="h-3.5 w-3.5 text-brand-purple" />
          </div>
          <AnimatedGradientText className="text-base font-bold tracking-heading">
            ExpenseTracker
          </AnimatedGradientText>
        </div>

        {/* Desktop search */}
        <div className="hidden lg:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search transactions... (⌘K)"
              className="h-9 w-72 rounded-lg border border-white/[0.08] bg-background-card pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Mobile search */}
        <button className="rounded-lg p-2 text-text-muted hover:bg-white/[0.05] hover:text-text-secondary transition-colors lg:hidden">
          <Search className="h-5 w-5" />
        </button>

        {/* Quick Add */}
        <button
          onClick={() => openModal("addTransaction")}
          className="flex items-center gap-2 rounded-lg bg-brand-purple/15 px-3 py-2 text-sm font-medium text-brand-purple-light hover:bg-brand-purple/25 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut());
          }}
          className="ml-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
