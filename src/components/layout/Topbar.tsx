"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";

export function Topbar() {
  const pathname = usePathname();
  const { openModal } = useUIStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-white/[0.05] px-6 bg-[rgba(10,10,15,0.85)] backdrop-blur-[12px]">
      {/* Left: Dynamic Title */}
      <div className="flex flex-col">
        <h1 className="text-[15px] font-semibold text-[#f8fafc]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="relative flex items-center w-[320px]">
          <Search className="absolute left-3 h-[14px] w-[14px] text-[#475569]" />
          <input
            type="text"
            placeholder="Search transactions... ⌘K"
            className="h-[34px] w-full rounded-[10px] border border-white/[0.07] bg-white/[0.04] pl-9 pr-3 text-[13px] text-[#94a3b8] placeholder:text-[#94a3b8] focus:border-[rgba(139,92,246,0.4)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] hover:bg-white/[0.08] transition-all"
          >
            {resolvedTheme === "dark" ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
          </button>
        )}
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[34px] items-center justify-center rounded-[10px] bg-[#7c3aed] px-4 text-[13px] font-medium text-white transition-all hover:bg-[#6d28d9] active:scale-[0.97] shadow-[0_0_16px_rgba(124,58,237,0.3)]"
        >
          <Plus className="mr-1.5 h-[14px] w-[14px]" /> Add
        </button>
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut());
          }}
          className="text-[13px] font-medium text-[#475569] hover:text-[#94a3b8] transition-colors bg-transparent border-none outline-none ml-2"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
