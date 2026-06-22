"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const { openModal, openSidebar } = useUIStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const getPageTitle = () => {
    if (pathname === "/") return "Overview";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 flex h-[56px] lg:h-[64px] items-center justify-between border-b border-white/[0.03] px-4 lg:px-8 bg-[rgba(7,7,14,0.7)] backdrop-blur-[20px]",
      pathname === "/transactions" ? "hidden lg:flex" : ""
    )}>
      
      {/* Search Overlay (Mobile) */}
      <div 
        className={cn(
          "absolute inset-0 z-40 bg-[#07070e] flex items-center px-4 transition-all duration-200 ease-out lg:hidden overflow-hidden",
          isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none"
        )}
      >
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 h-[16px] w-[16px] text-[#475569]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions..."
            className="h-[40px] w-full rounded-[12px] border border-white/[0.05] bg-white/[0.03] pl-10 pr-10 text-[14px] text-[#f8fafc] placeholder:text-[#475569] focus:outline-none focus:border-[rgba(124,58,237,0.4)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all"
          />
          <button 
            onClick={() => setIsSearchExpanded(false)}
            className="absolute right-2 p-1.5 rounded-full text-[#94a3b8] hover:bg-white/[0.08]"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Left: Mobile Menu + Dynamic Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white/[0.03] border border-white/[0.05] text-[#f8fafc] lg:hidden active:scale-[0.97] hover:bg-white/[0.05] transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[14px] font-semibold text-[#f1f5f9] tracking-[0.05em]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search (Desktop) */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="relative flex items-center w-[320px]">
          <Search className="absolute left-[12px] h-[14px] w-[14px] text-[#475569]" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-[36px] w-full rounded-[12px] border border-white/[0.05] bg-white/[0.03] pl-[36px] pr-[44px] text-[13px] text-[#64748b] placeholder-[#475569] focus:border-[rgba(124,58,237,0.4)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] focus:text-[#f1f5f9] transition-all"
          />
          <kbd className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none bg-white/[0.04] border border-white/[0.06] rounded-[4px] px-[6px] py-[2px] text-[10px] font-medium text-[#475569]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchExpanded(true)}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] text-[#94a3b8] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] lg:hidden active:scale-[0.97]"
        >
          <Search size={16} />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hidden sm:flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white/[0.03] border border-white/[0.05] text-[#94a3b8] hover:bg-white/[0.08] hover:text-[#f1f5f9] transition-all active:scale-[0.97]"
          >
            {resolvedTheme === "dark" ? <Sun className="h-[16px] w-[16px]" /> : <Moon className="h-[16px] w-[16px]" />}
          </button>
        )}
        
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[36px] w-[36px] lg:w-auto items-center justify-center rounded-[10px] lg:rounded-[10px] bg-[#7c3aed] lg:px-[16px] text-[13px] font-medium text-white transition-all hover:bg-[#6d28d9] active:scale-[0.97] shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)]"
        >
          <Plus className="lg:mr-2 h-[18px] w-[18px] lg:h-[16px] lg:w-[16px]" />
          <span className="hidden lg:inline">Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
