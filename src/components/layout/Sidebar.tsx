"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  BarChart3,
  Target,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", route: "/" },
      { icon: ArrowLeftRight, label: "Transactions", route: "/transactions" },
      { icon: Users, label: "Profiles", route: "/profiles" },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { icon: BarChart3, label: "Analytics", route: "/analytics" },
      { icon: Target, label: "Budgets", route: "/budgets" },
      { icon: RefreshCw, label: "Recurring", route: "/recurring" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { icon: Settings2, label: "Settings", route: "/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { selectedCurrency } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col bg-[var(--bg-surface)] lg:flex"
      style={{ boxShadow: "1px 0 0 0 var(--border-subtle)" }}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-[4px] bg-[var(--accent)]" />
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            ExpenseTracker
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="flex flex-col gap-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                {group.label}
              </div>
              <ul className="space-y-1 relative">
                {group.items.map((item) => {
                  const isActive =
                    item.route === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.route);
                  const Icon = item.icon;

                  return (
                    <li key={item.route} className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute left-0 top-0 h-full w-[2px] bg-[var(--accent)] rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Link
                        href={item.route}
                        className={cn(
                          "flex h-10 items-center gap-2 rounded-r-lg px-3 text-[13px] font-medium transition-all duration-150 relative z-10",
                          isActive
                            ? "bg-[rgba(124,58,237,0.12)] text-[var(--accent-light)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] rounded-l-lg"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* User Card */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)] text-xs font-bold">
            {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
              {session?.user?.name || "User"}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] truncate">
              {session?.user?.email || "user@example.com"}
            </span>
          </div>
          {mounted && (
            <div className="flex-shrink-0 bg-[var(--bg-surface)] rounded-full px-2 py-0.5 border border-[var(--border-subtle)]">
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                {getCurrencySymbol(selectedCurrency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
