"use client";
import { TypographySpan } from "@/components/ui/typography";
import { Search, Plus, Moon, Sun, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, Monitor } from "lucide-react";
import { TypographyP } from "@/components/ui/typography";

export function Topbar() {
  const { openModal } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full h-16 sm:h-20 flex items-center px-4 sm:px-6 justify-between lg:justify-end gap-3 sm:gap-4 lg:gap-6 bg-background/60 backdrop-blur-2xl border-b border-white/[0.03] transition-all">
      <div className="flex lg:hidden items-center text-foreground font-bold text-lg tracking-tight gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
        <TypographySpan>ExpenseTracker</TypographySpan>
      </div>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center w-full max-w-lg px-4">
        <div className="relative w-full flex items-center group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 rounded-full blur-md transition-opacity duration-500" />
          <Search className="absolute left-4 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
          <Input 
            placeholder="Search transactions (⌘K)..." 
            className="pl-11 rounded-full bg-surface-1/50 backdrop-blur-md border border-white/[0.04] hover:bg-surface-2/60 focus-visible:bg-surface-1 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-10 shadow-sm transition-all relative z-10 w-full text-sm font-medium"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1 opacity-50 z-10 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded-md bg-surface-3 border border-white/[0.05] text-[10px] font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-surface-3 border border-white/[0.05] text-[10px] font-mono">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hidden sm:flex w-10 h-10 rounded-full border border-white/[0.04] bg-surface-1/40 hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all shadow-sm"
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <TypographySpan className="sr-only">Toggle theme</TypographySpan>
        </Button>
        
        {/* Mobile User Profile */}
        <div className="flex lg:hidden relative z-10">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none border-none p-0 bg-transparent cursor-pointer">
              <div className="relative shrink-0 transition-transform active:scale-95">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 border border-white/[0.1] shadow-inner">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs sm:text-sm font-bold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-[24px] border border-white/[0.05] bg-surface-1/90 backdrop-blur-3xl shadow-2xl p-2 z-50">
              <div className="font-semibold px-3 py-2 flex items-center gap-3 mb-1">
                <Avatar className="w-10 h-10 shrink-0 border border-white/[0.1]">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <TypographyP className="text-sm font-bold tracking-tight text-foreground">{session?.user?.name || "User"}</TypographyP>
                  <TypographyP className="text-[11px] text-muted-foreground/80">{session?.user?.email || "Pro Plan"}</TypographyP>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/[0.04] mb-2 mx-2" />
              <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-surface-2 transition-colors">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                <TypographySpan className="font-medium">Profile</TypographySpan>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-surface-2 transition-colors">
                <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                <TypographySpan className="font-medium">Settings</TypographySpan>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/[0.04] my-2 mx-2" />
              <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-3 pt-1 pb-2">Theme</div>
              <div className="flex px-2 pb-2 gap-1.5">
                <button 
                  onClick={(e) => { e.preventDefault(); setTheme('light'); }} 
                  className={cn("flex-1 flex justify-center py-2.5 rounded-[14px] hover:bg-surface-2 transition-all", theme === 'light' ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm' : 'text-muted-foreground')}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setTheme('dark'); }} 
                  className={cn("flex-1 flex justify-center py-2.5 rounded-[14px] hover:bg-surface-2 transition-all", theme === 'dark' ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm' : 'text-muted-foreground')}
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setTheme('system'); }} 
                  className={cn("flex-1 flex justify-center py-2.5 rounded-[14px] hover:bg-surface-2 transition-all", theme === 'system' ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm' : 'text-muted-foreground')}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
              
              <DropdownMenuSeparator className="bg-white/[0.04] my-2 mx-2" />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer rounded-xl px-3 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors group">
                <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                <TypographySpan className="font-medium">Log out</TypographySpan>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button 
          onClick={() => openModal("addTransaction")} 
          className="group relative flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-5 rounded-full font-bold text-xs sm:text-sm text-primary-foreground transition-all shadow-[0_4px_20px_rgba(var(--primary),0.3)] hover:shadow-[0_4px_25px_rgba(var(--primary),0.5)] hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
          <TypographySpan className="hidden sm:inline relative z-10 tracking-wide">Add Transaction</TypographySpan>
          <TypographySpan className="inline sm:hidden relative z-10 tracking-wide">Add</TypographySpan>
        </button>
      </div>
    </header>
  );
}
