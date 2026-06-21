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
  X,
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
      <div className="flex h-[52px] items-center px-[14px] border-b border-white/[0.05] flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-[26px] w-[26px] rounded-[7px] bg-[#7c3aed] flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-sm" />
          </div>
          <span className="text-[13px] font-semibold text-[#f1f5f9]">
            ExpenseTracker
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar p-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-2 pt-4 pb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#1e293b]">
              {group.label}
            </div>
            <ul className="space-y-[1px]">
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
                        "flex h-[34px] items-center rounded-lg px-[10px] text-[13px] font-normal transition-colors",
                        isActive
                          ? "bg-[rgba(124,58,237,0.10)] text-[#a78bfa] font-medium border-l-[2px] border-[#7c3aed] pl-[8px] shadow-[inset_1px_0_0_rgba(124,58,237,0.2)]"
                          : "bg-transparent text-[#475569] hover:bg-white/[0.04] hover:text-[#94a3b8]"
                      )}
                    >
                      <Icon className="h-[15px] w-[15px] mr-2 flex-shrink-0" strokeWidth={2} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Card */}
      <div className="sticky bottom-0 bg-[#0a0a12] border-t border-white/[0.05] px-[10px] h-[52px] flex items-center gap-[10px] flex-shrink-0">
        <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white text-[11px] font-semibold">
          {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-medium text-[#f1f5f9] truncate max-w-[110px]">
            {session?.user?.name || "User"}
          </span>
          <span className="text-[10px] text-[#334155] truncate max-w-[110px]">
            {session?.user?.email || "user@example.com"}
          </span>
        </div>
        {mounted && (
          <div className="flex-shrink-0 bg-white/[0.05] rounded-full px-2 py-0.5 h-[18px] flex items-center">
            <span className="text-[10px] text-[#475569]">
              {getCurrencySymbol(selectedCurrency)}
            </span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* MOBILE DRAWER (xs -> lg) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[240px] z-50 bg-[#0a0a12] border-r border-white/5 flex flex-col lg:hidden"
            >
              <button
                onClick={closeSidebar}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR (lg+) */}
      <aside className="hidden lg:flex w-[200px] h-screen flex-shrink-0 flex-col bg-[#0a0a12] border-r border-white/[0.05]">
        {SidebarContent}
      </aside>
    </>
  );
}
