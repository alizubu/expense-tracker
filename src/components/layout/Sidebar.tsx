"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", route: "/" },
      { icon: ArrowLeftRight, label: "Transactions", route: "/transactions" },
      { icon: Users, label: "Profiles", route: "/profiles" },
    ],
  },
  {
    label: "Manage",
    items: [
      { icon: BarChart3, label: "Analytics", route: "/analytics" },
      { icon: Target, label: "Budgets", route: "/budgets" },
      { icon: RefreshCw, label: "Recurring", route: "/recurring" },
    ],
  },
  {
    label: "System",
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
      className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col bg-[#FFFFFF] lg:flex"
      style={{ boxShadow: "1px 0 0 0 rgba(0,0,0,0.07)" }}
    >
      {/* Logo Area */}
      <div className="flex h-[64px] items-center px-6">
        <Link href="/" className="flex items-center gap-[8px]">
          <div className="h-2 w-2 rounded-[4px] bg-[#7C3AED]" />
          <span className="text-[14px] font-semibold text-[#111111]">
            ExpenseTracker
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        <div className="flex flex-col">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mt-[20px] mb-[8px] px-4 text-[10px] font-semibold tracking-[0.08em] text-[#9CA3AF]">
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
                      <Link
                        href={item.route}
                        className={cn(
                          "flex h-[36px] items-center mx-2 px-3 text-[13px] transition-all duration-150",
                          isActive
                            ? "bg-[rgba(124,58,237,0.08)] text-[#7C3AED] font-medium border-l-2 border-[#7C3AED] rounded-r-lg"
                            : "text-[#6B7280] bg-transparent hover:bg-[#F7F7F5] hover:text-[#111111] rounded-lg"
                        )}
                      >
                        <Icon className="h-4 w-4 mr-[10px]" strokeWidth={2} />
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
      <div className="p-[8px] mt-auto">
        <div className="flex items-center gap-3 rounded-[10px] bg-[#F7F7F5] border border-[rgba(0,0,0,0.07)] p-[12px]">
          <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(124,58,237,0.1)] text-[#7C3AED] text-xs font-bold">
            {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-medium text-[#111111] truncate">
              {session?.user?.name || "User"}
            </span>
            <span className="text-[11px] text-[#9CA3AF] truncate">
              {session?.user?.email || "user@example.com"}
            </span>
          </div>
          {mounted && (
            <div className="flex-shrink-0 bg-[#FFFFFF] rounded-[20px] px-[7px] py-[2px] border border-[rgba(0,0,0,0.08)]">
              <span className="font-mono text-[10px] text-[#111111]">
                {getCurrencySymbol(selectedCurrency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
