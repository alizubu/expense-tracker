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
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
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
  { label: "Settings", icon: Settings, href: "/settings", activePaths: ["/settings"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen border-r border-border bg-card transition-all duration-300 ease-in-out relative",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-semibold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span>ExpenseTracker</span>}
        </div>
      </div>

      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {routes.map((route) => {
          const isActive = route.activePaths.some(p => pathname === p || pathname.startsWith(p + "/"));
          
          return (
            <Link key={route.href} href={route.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <route.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!sidebarCollapsed && <span>{route.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-border mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("w-full h-auto p-2 justify-start hover:bg-secondary", sidebarCollapsed && "justify-center")}>
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex flex-col items-start ml-3 overflow-hidden text-left">
                  <span className="text-sm font-medium truncate w-full">{session?.user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{session?.user?.email}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 w-8 h-8 rounded-full border border-border bg-card shadow-sm z-10 hover:bg-secondary"
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    </aside>
  );
}
