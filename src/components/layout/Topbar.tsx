"use client";

import { usePathname } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

export function Topbar() {
  const pathname = usePathname();
  const { openModal } = useUIStore();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-[var(--border-subtle)] px-6"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: Dynamic Title */}
      <div className="flex flex-col">
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">
          {getPageTitle()}
        </h1>
        {pathname.split("/").length > 2 && (
          <span className="text-[13px] text-[var(--text-muted)]">
            Overview / {getPageTitle()}
          </span>
        )}
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="relative flex items-center w-[320px]">
          <Search className="absolute left-3 h-[14px] w-[14px] text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search transactions...  ⌘K"
            className="h-[36px] w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] pl-9 pr-4 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[34px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-[14px] text-[13px] font-medium text-white transition-all hover:bg-[#6D28D9] hover:scale-95"
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </button>
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut());
          }}
          className="flex h-[34px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] px-[14px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
