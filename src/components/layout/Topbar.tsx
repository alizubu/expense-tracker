"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, Moon, Sun, Menu, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { Button, Input } from "@heroui/react";

export function Topbar() {
  const pathname = usePathname();
  const { openModal, openSidebar } = useUIStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => setMounted(true), []);

  const getPageTitle = () => {
    if (pathname === "/") return "Overview";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 flex h-[56px] lg:h-[64px] items-center justify-between border-b border-[var(--border-hair)] px-4 lg:px-8 bg-[rgba(19,22,29,0.7)] backdrop-blur-[20px]",
      pathname === "/transactions" ? "hidden lg:flex" : ""
    )}>
      
      {/* Search Overlay (Mobile) */}
      <div 
        className={cn(
          "absolute inset-0 z-40 bg-[var(--bg-base)] flex items-center px-4 transition-all duration-200 ease-out lg:hidden overflow-hidden",
          isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none"
        )}
      >
        <div className="relative flex-1 flex items-center gap-2">
          <Input
            autoFocus={isSearchExpanded}
            placeholder="Search transactions..."
            startContent={<Search className="text-[var(--text-muted)] w-4 h-4" />}
            classNames={{
              inputWrapper: "bg-[var(--bg-surface)] border border-[var(--border-hair)] hover:bg-[var(--bg-raised)] focus-within:!bg-[var(--bg-raised)] focus-within:!border-[var(--accent-brass)]",
              input: "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            }}
            fullWidth
          />
          <Button 
            isIconOnly 
            variant="light" 
            onPress={() => setIsSearchExpanded(false)}
            className="text-[var(--text-muted)]"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Left: Mobile Menu + Dynamic Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-hair)] text-[var(--text-primary)] lg:hidden active:scale-[0.97] hover:bg-[var(--bg-raised)] transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[16px] font-semibold text-[var(--text-primary)] font-ui tracking-wide">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search (Desktop) */}
      <div className="hidden lg:flex flex-1 justify-center max-w-[320px] mx-auto">
        <Input
          placeholder="Search transactions..."
          startContent={<Search className="text-[var(--text-muted)] w-4 h-4" />}
          endContent={<kbd className="bg-[var(--bg-base)] border border-[var(--border-hair)] rounded-[4px] px-[6px] py-[2px] text-[10px] font-medium text-[var(--text-muted)]">⌘K</kbd>}
          classNames={{
            inputWrapper: "bg-[var(--bg-surface)] border border-[var(--border-hair)] hover:bg-[var(--bg-raised)] focus-within:!bg-[var(--bg-raised)] focus-within:!border-[var(--accent-brass)] shadow-sm",
            input: "text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          }}
          size="sm"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchExpanded(true)}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-hair)] hover:bg-[var(--bg-raised)] lg:hidden active:scale-[0.97]"
        >
          <Search size={16} />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hidden sm:flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-hair)] text-[var(--text-muted)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] transition-all active:scale-[0.97]"
          >
            {resolvedTheme === "dark" ? <Sun className="h-[16px] w-[16px]" /> : <Moon className="h-[16px] w-[16px]" />}
          </button>
        )}
        
        <Button
          color="primary"
          onPress={() => openModal("addTransaction")}
          startContent={<Plus className="w-4 h-4" />}
          className="font-medium shadow-md shadow-[var(--accent-dim)]"
          size="md"
        >
          <span className="hidden lg:inline">Add Transaction</span>
        </Button>
      </div>
    </header>
  );
}
