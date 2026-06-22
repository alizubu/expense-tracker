"use client";

import { Search, Plus, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const { openModal } = useUIStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass h-16 flex items-center px-6 justify-between lg:justify-end gap-4 lg:gap-6 border-b border-white/[0.04] transition-all">
      <div className="flex lg:hidden items-center text-primary font-semibold text-lg tracking-tight">
        ExpenseTracker
      </div>

      <div className="hidden lg:flex items-center flex-1 max-w-md relative group">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <Input 
            placeholder="Search transactions (⌘K)..." 
            className="pl-9 bg-surface-1 border-white/[0.04] hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-primary h-9 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-surface-2 rounded-full"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button onClick={() => openModal("add-transaction")} className="shadow-sm h-9 rounded-lg font-medium">
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="inline sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}
