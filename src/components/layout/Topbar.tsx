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
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header className="sticky top-0 z-40 flex h-[50px] items-center justify-between border-b border-white/[0.05] px-3 lg:px-6 bg-[rgba(8,8,15,0.92)] backdrop-blur-[16px]">
      
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
        <h1 className="text-[14px] font-semibold text-[#f1f5f9]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search (Desktop) */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="relative flex items-center w-[280px]">
          <Search className="absolute left-[10px] h-[13px] w-[13px] text-[#334155]" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-[32px] w-full rounded-[8px] border border-white/[0.07] bg-white/[0.04] pl-[32px] pr-[40px] text-[12px] text-[#64748b] focus:border-[rgba(124,58,237,0.45)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(124,58,237,0.10)] focus:text-[#f1f5f9] transition-all"
          />
          <kbd className="absolute right-[6px] top-1/2 -translate-y-1/2 pointer-events-none bg-white/[0.06] border border-white/[0.08] rounded-[4px] px-[5px] py-[1px] text-[10px] font-medium text-[#334155]">
            ⌘K
          </kbd>
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
            className="hidden sm:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] hover:bg-white/[0.08] transition-all active:scale-[0.97]"
          >
            {resolvedTheme === "dark" ? <Sun className="h-[14px] w-[14px]" /> : <Moon className="h-[14px] w-[14px]" />}
          </button>
        )}
        
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[32px] items-center justify-center rounded-[8px] bg-[#7c3aed] px-[14px] text-[12px] font-medium text-white transition-all hover:bg-[#6d28d9] active:scale-[0.97] shadow-[0_0_14px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.45)]"
        >
          <Plus className="mr-1.5 h-[13px] w-[13px]" />
          <span>Add</span>
        </button>
        
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut());
          }}
          className="hidden lg:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] text-[#475569] hover:text-[#f43f5e] hover:border-[rgba(243,67,94,0.3)] transition-all"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
