"use client";
import { TypographySpan, TypographyH4, TypographyP } from "@/components/ui/typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  LayoutDashboard, ArrowRightLeft, Users, BarChart3, Settings,
  ChevronLeft, ChevronRight, Wallet, LogOut, MoreVertical,
  TrendingUp, Moon, Sun, Monitor, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", activePaths: ["/"] },
  { label: "Transactions", icon: ArrowRightLeft, href: "/transactions", activePaths: ["/transactions"] },
  { label: "Wallets", icon: Users, href: "/profiles", activePaths: ["/profiles"] },
  { label: "Analytics", icon: BarChart3, href: "/analytics", activePaths: ["/analytics"] },
  { label: "Settings", icon: Settings, href: "/settings", activePaths: ["/settings"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col m-4 h-[calc(100vh-32px)] rounded-[32px] border border-white/[0.03] bg-surface-1/40 backdrop-blur-3xl shadow-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative z-20 overflow-hidden",
        sidebarCollapsed ? "w-[90px]" : "w-[280px]"
      )}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Brand Header */}
      <div className={cn("flex h-24 items-center flex-shrink-0", sidebarCollapsed ? "justify-center px-0" : "px-7")}>
        <div className={cn("flex items-center text-foreground font-bold text-xl tracking-tight transition-all duration-300", sidebarCollapsed ? "justify-center w-full" : "gap-3")}>
          <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 ring-1 ring-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Wallet className="w-5 h-5 relative z-10" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <TypographySpan className="leading-tight">Expense</TypographySpan>
              <TypographySpan className="text-primary leading-tight">Tracker</TypographySpan>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className={cn("flex-1 py-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar relative z-10", sidebarCollapsed ? "px-3" : "px-5")}>
        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 px-3">
          {!sidebarCollapsed ? "Menu" : "—"}
        </div>
        {routes.map((route) => {
          const isActive = route.activePaths.some(p => pathname === p || pathname.startsWith(p + "/"));
          
          return (
            <Link key={route.href} href={route.href} title={sidebarCollapsed ? route.label : undefined}>
              <div
                className={cn(
                  "relative flex items-center rounded-[20px] transition-all duration-300 group overflow-hidden",
                  sidebarCollapsed ? "justify-center py-4" : "gap-4 px-4 py-3.5",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                )}
                <div className={cn(
                  "flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  sidebarCollapsed && !isActive && "text-muted-foreground/80 group-hover:text-foreground"
                )}>
                  <route.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground")} />
                </div>
                {!sidebarCollapsed && <TypographySpan className={cn("font-medium tracking-wide", isActive ? "font-semibold" : "")}>{route.label}</TypographySpan>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Monthly Net Widget (hidden if collapsed) */}
      {!sidebarCollapsed && (
        <div className="px-5 py-6 mt-auto relative z-10">
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-surface-2/40 to-surface-1/40 backdrop-blur-xl border border-white/[0.05] shadow-lg relative overflow-hidden group hover:border-primary/20 transition-colors duration-500">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            
            <TypographyH4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">Monthly Net</TypographyH4>
            <div className="flex items-baseline gap-1">
              <TypographySpan className="text-sm text-muted-foreground/80 font-medium">$</TypographySpan>
              <TypographySpan className="text-2xl font-bold tabular-money tracking-tighter text-foreground drop-shadow-sm">4,250.00</TypographySpan>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
              <TypographySpan>+12.5% vs last</TypographySpan>
            </div>
          </div>
        </div>
      )}

      {/* User Card */}
      <div className={cn("p-4 mb-2 relative z-10", sidebarCollapsed && "px-2 flex justify-center mt-auto")}>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full rounded-[24px] outline-none border-none p-0 bg-transparent text-left cursor-pointer group">
            <div 
              className={cn(
              "flex items-center gap-3 p-2 rounded-[24px] border border-white/[0.04] bg-surface-2/40 hover:bg-surface-2 backdrop-blur-md transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer w-full group-hover:border-white/[0.08]",
              sidebarCollapsed ? "justify-center w-14 h-14" : "justify-between"
            )}>
              <div className="flex items-center gap-3 truncate">
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 shrink-0 border border-white/[0.1] shadow-inner">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col items-start truncate text-left">
                    <TypographySpan className="text-sm font-bold tracking-tight truncate text-foreground group-hover:text-primary transition-colors">{session?.user?.name || "User"}</TypographySpan>
                    <TypographySpan className="text-[11px] font-medium text-muted-foreground/80 truncate">{session?.user?.email || "Pro Plan"}</TypographySpan>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="w-8 h-8 rounded-full bg-white/[0.02] flex items-center justify-center mr-1">
                  <MoreVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={16} className="w-64 mb-4 rounded-[24px] border border-white/[0.05] bg-surface-1/80 backdrop-blur-3xl shadow-2xl p-2">
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

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3.5 top-10 w-7 h-7 rounded-full border border-white/[0.08] bg-surface-2 shadow-md z-30 hover:bg-surface-3 transition-all hover:scale-110"
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
        )}
      </Button>
    </aside>
  );
}
