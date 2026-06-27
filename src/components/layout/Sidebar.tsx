"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  LogOut,
  MoreVertical,
  TrendingUp,
  Moon,
  Sun,
  Monitor,
  Shield,
  User,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", activePaths: ["/"] },
  { label: "Transactions", icon: ArrowRightLeft, href: "/transactions", activePaths: ["/transactions"] },
  { label: "Profiles", icon: Users, href: "/profiles", activePaths: ["/profiles"] },
  { label: "Analytics", icon: BarChart3, href: "/analytics", activePaths: ["/analytics"] },
  { label: "Profile", icon: UserCircle, href: "/profile", activePaths: ["/profile"] },
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
        "hidden lg:flex flex-col h-screen border-r border-white/[0.04] bg-surface-0 transition-all duration-300 ease-in-out relative",
        sidebarCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3 text-foreground font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span>ExpenseTracker</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-4 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
        {routes.map((route) => {
          const isActive = route.activePaths.some(p => pathname === p || pathname.startsWith(p + "/"));
          
          return (
            <Link key={route.href} href={route.href}>
              <div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
                <route.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!sidebarCollapsed && <span>{route.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Monthly Net Widget (hidden if collapsed) */}
      {!sidebarCollapsed && (
        <div className="px-6 py-6 mt-auto">
          <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.04] shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Monthly Net</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">$</span>
              <span className="text-xl font-semibold tabular-money text-foreground">4,250.00</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% this month</span>
            </div>
          </div>
        </div>
      )}

      {/* User Card */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
              "w-full flex items-center gap-3 p-2 rounded-2xl border border-white/[0.04] bg-surface-1 hover:bg-surface-2 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
              sidebarCollapsed ? "justify-center" : "justify-between"
            )}>
              <div className="flex items-center gap-3 truncate">
                <div className="relative">
                  <Avatar className="w-9 h-9 shrink-0 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface-1 rounded-full" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col items-start truncate text-left">
                    <span className="text-sm font-semibold truncate text-foreground">{session?.user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate">{session?.user?.email || "Pro Plan"}</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <MoreVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mr-1" />
              )}
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-56 mb-2 rounded-xl border border-white/[0.04] bg-surface-1/90 backdrop-blur-xl shadow-xl p-1.5">
            <DropdownMenuLabel className="font-semibold px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                <p className="text-[11px] leading-none text-muted-foreground">{session?.user?.email || "Pro Plan"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.04]" />
            <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer rounded-lg px-2 py-1.5 focus:bg-surface-2">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/profile?edit=true")} className="cursor-pointer rounded-lg px-2 py-1.5 focus:bg-surface-2">
              <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer rounded-lg px-2 py-1.5 focus:bg-surface-2">
              <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/[0.04]" />
            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pt-1.5 pb-1">Theme</DropdownMenuLabel>
            <div className="flex px-1.5 pb-1.5 gap-1">
              <button 
                onClick={(e) => { e.preventDefault(); setTheme('light'); }} 
                className={cn("flex-1 flex justify-center py-1.5 rounded-lg hover:bg-surface-2 transition-colors", theme === 'light' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-muted-foreground')}
                title="Light"
              >
                <Sun className="w-[14px] h-[14px]" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); setTheme('dark'); }} 
                className={cn("flex-1 flex justify-center py-1.5 rounded-lg hover:bg-surface-2 transition-colors", theme === 'dark' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-muted-foreground')}
                title="Dark"
              >
                <Moon className="w-[14px] h-[14px]" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); setTheme('system'); }} 
                className={cn("flex-1 flex justify-center py-1.5 rounded-lg hover:bg-surface-2 transition-colors", theme === 'system' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-muted-foreground')}
                title="System"
              >
                <Monitor className="w-[14px] h-[14px]" />
              </button>
            </div>
            
            <DropdownMenuSeparator className="bg-white/[0.04]" />
            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer rounded-lg px-2 py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3.5 top-8 w-7 h-7 rounded-full border border-white/[0.06] bg-surface-1 shadow-sm z-10 hover:bg-surface-2 transition-all"
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </Button>
    </aside>
  );
}
