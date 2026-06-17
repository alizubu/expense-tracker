"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Target,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { getCurrencySymbol } from "@/lib/currencies";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/" },
  { icon: ArrowLeftRight, label: "Transactions", route: "/transactions" },
  { icon: Wallet, label: "Profiles", route: "/profiles" },
  { icon: BarChart3, label: "Analytics", route: "/analytics" },
  { icon: Target, label: "Budgets", route: "/budgets" },
  { icon: Clock, label: "Recurring", route: "/recurring" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, selectedCurrency, theme, setTheme } =
    useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/[0.08] bg-background-secondary transition-sidebar lg:flex",
        sidebarCollapsed ? "w-16" : "w-[280px]"
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/[0.08] px-4",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/20">
              <Wallet className="h-4 w-4 text-brand-purple" />
            </div>
            <AnimatedGradientText className="text-lg font-bold tracking-heading">
              ExpenseTracker
            </AnimatedGradientText>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/20">
            <Wallet className="h-4 w-4 text-brand-purple" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.route === "/"
                ? pathname === "/"
                : pathname.startsWith(item.route);
            const Icon = item.icon;

            return (
              <li key={item.route}>
                <Link
                  href={item.route}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-brand-purple/15 text-brand-purple-light"
                      : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-brand-purple"
                        : "text-text-muted group-hover:text-text-secondary"
                    )}
                  />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-purple" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/[0.08] p-3 space-y-2">
        {/* Currency & Theme Toggle */}
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-text-muted">
              Currency: {getCurrencySymbol(selectedCurrency)} {selectedCurrency}
            </span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-1.5 text-text-muted hover:bg-white/[0.05] hover:text-text-secondary transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* User info */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-purple-light flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            AR
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                Arif Rahman
              </p>
              <p className="text-xs text-text-muted truncate">
                arif@example.com
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/[0.05] hover:text-text-secondary transition-colors",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
