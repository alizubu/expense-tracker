"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, Moon, Sun, Menu, X } from "lucide-react";
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
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header className="sticky top-0 z-30 flex h-[48px] lg:h-[52px] items-center justify-between border-b border-white/[0.05] px-3 lg:px-6 bg-[rgba(10,10,15,0.85)] backdrop-blur-[12px]">
      
      {/* Search Overlay (Mobile) */}
      <div 
        className={cn(
          "absolute inset-0 z-40 bg-[#0d0d14] flex items-center px-3 transition-all duration-200 ease-out lg:hidden overflow-hidden",
          isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none"
        )}
      >
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 h-[16px] w-[16px] text-[#475569]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions..."
            className="h-[36px] w-full rounded-[10px] border border-white/[0.07] bg-white/[0.04] pl-10 pr-10 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] focus:outline-none"
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
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-white/[0.04] border border-white/[0.07] text-[#f8fafc] lg:hidden active:scale-[0.97]"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[14px] lg:text-[15px] font-semibold text-[#f8fafc]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search (Desktop) */}
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
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchExpanded(true)}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#94a3b8] hover:bg-white/[0.08] lg:hidden active:scale-[0.97]"
        >
          <Search size={18} />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hidden sm:flex h-[36px] w-[36px] lg:h-[32px] lg:w-[32px] items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] hover:bg-white/[0.08] transition-all active:scale-[0.97]"
          >
            {resolvedTheme === "dark" ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
          </button>
        )}
        
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[36px] lg:h-[34px] items-center justify-center rounded-[10px] bg-[#7c3aed] px-3 lg:px-4 text-[13px] font-medium text-white transition-all hover:bg-[#6d28d9] active:scale-[0.97] shadow-[0_0_16px_rgba(124,58,237,0.3)]"
        >
          <Plus className="lg:mr-1.5 h-[16px] w-[16px] lg:h-[14px] lg:w-[14px]" />
          <span className="hidden sm:inline">Add</span>
        </button>
        
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut());
          }}
          className="hidden lg:block text-[13px] font-medium text-[#475569] hover:text-[#94a3b8] transition-colors bg-transparent border-none outline-none ml-2"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
