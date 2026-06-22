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
    <header className={cn(
      "sticky top-0 z-40 flex h-[48px] lg:h-[50px] items-center justify-between border-b border-border/80 px-3 lg:px-6 bg-card/90 backdrop-blur-[16px]",
      pathname === "/transactions" ? "hidden lg:flex" : ""
    )}>
      
      {/* Search Overlay (Mobile) */}
      <div 
        className={cn(
          "absolute inset-0 z-40 bg-card flex items-center px-3 transition-all duration-200 ease-out lg:hidden overflow-hidden",
          isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none"
        )}
      >
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 h-[16px] w-[16px] text-text-muted" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions..."
            className="h-[36px] w-full rounded-xl border border-border bg-card-elevated pl-10 pr-10 text-[14px] text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent-dim"
          />
          <button 
            onClick={() => setIsSearchExpanded(false)}
            className="absolute right-2 p-1.5 rounded-full text-text-muted hover:bg-card-hover cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Left: Mobile Menu + Dynamic Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-xl bg-card-elevated border border-border text-text-primary lg:hidden active:scale-[0.97] cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[14px] font-semibold text-text-primary">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search (Desktop) */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="relative flex items-center w-[280px]">
          <Search className="absolute left-[10px] h-[13px] w-[13px] text-text-muted/60" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-[32px] w-full rounded-xl border border-border bg-card-elevated pl-[32px] pr-[40px] text-[12px] text-text-secondary placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] focus:text-text-primary transition-all"
          />
          <kbd className="absolute right-[6px] top-1/2 -translate-y-1/2 pointer-events-none bg-card-hover border border-border rounded-md px-1.5 py-0.5 text-[9px] font-medium text-text-muted/80">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchExpanded(true)}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-text-muted hover:bg-card-hover lg:hidden active:scale-[0.97] cursor-pointer"
        >
          <Search size={18} />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hidden sm:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-card-elevated border border-border text-text-secondary hover:bg-card-hover transition-all active:scale-[0.97] cursor-pointer"
          >
            {resolvedTheme === "dark" ? <Sun className="h-[14px] w-[14px]" /> : <Moon className="h-[14px] w-[14px]" />}
          </button>
        )}
        
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[32px] w-[32px] lg:w-auto items-center justify-center rounded-full lg:rounded-xl bg-accent lg:px-4 text-[12px] font-semibold text-white transition-all hover:brightness-115 active:scale-[0.97] shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          <Plus className="lg:mr-1.5 h-[16px] w-[16px] lg:h-[13px] lg:w-[13px]" />
          <span className="hidden lg:inline">Add</span>
        </button>
        
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/sign-in" }));
          }}
          className="hidden lg:flex h-[30px] w-[30px] items-center justify-center rounded-full bg-card-elevated border border-border text-text-secondary hover:text-expense hover:border-expense/30 transition-all cursor-pointer"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
