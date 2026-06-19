"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  BarChart2,
  Settings,
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
      { icon: BarChart2, label: "Analytics", route: "/analytics" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { icon: Settings, label: "Settings", route: "/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { selectedCurrency, isSidebarOpen, closeSidebar } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Close sidebar on route change
  React.useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Close sidebar on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  // Prevent body scroll when drawer is open on mobile
  React.useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const SidebarContent = (
    <>
      {/* Logo Area */}
      <div className="flex h-[56px] items-center px-4 border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
          </div>
          <span className="text-[14px] font-semibold text-[#f8fafc] tracking-[-0.02em]">
            ExpenseTracker
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-[70px]">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <div className="px-4 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#334155]">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
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
                        "flex h-9 items-center rounded-lg mx-2 px-3 text-[13px] font-medium transition-colors border-l-2 active:scale-[0.97] active:opacity-80",
                        isActive
                          ? "bg-[rgba(124,58,237,0.12)] text-[#a78bfa] border-accent"
                          : "text-[#64748b] border-transparent card-hover hover:bg-white/[0.04] hover:text-[#94a3b8]"
                      )}
                    >
                      <Icon className="h-[15px] w-[15px] mr-[10px]" strokeWidth={2} style={{ verticalAlign: "-2px" }} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Card (Bottom Absolute) */}
      <div className="absolute bottom-0 left-0 right-0 h-[60px] pb-safe px-3 border-t border-white/[0.05] bg-[#0d0d14] flex items-center gap-2.5">
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-[12px] font-bold">
          {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-medium text-[#f8fafc] truncate">
            {session?.user?.name || "User"}
          </span>
          <span className="text-[10px] text-[#475569] truncate">
            {session?.user?.email || "user@example.com"}
          </span>
        </div>
        {mounted && (
          <div className="flex-shrink-0 bg-white/[0.06] rounded-[20px] px-2 py-0.5">
            <span className="font-mono text-[10px] text-[#64748b]">
              {getCurrencySymbol(selectedCurrency)}
            </span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* MOBILE DRAWER BACKDROP (xs -> lg) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER (xs -> lg) */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex w-[260px] flex-col bg-[#0d0d14] border-r border-white/[0.05] transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {SidebarContent}
      </aside>

      {/* DESKTOP SIDEBAR (lg+) */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[220px] flex-col bg-[#0d0d14] border-r border-white/[0.05] lg:flex">
        {SidebarContent}
      </aside>
    </>
  );
}
