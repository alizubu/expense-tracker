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
  LogOut,
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
      <div className="flex h-[64px] items-center px-[20px] border-b border-[var(--border-hair)] flex-shrink-0 mt-[10px]">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-[28px] w-[28px] rounded-[8px] bg-[var(--accent-brass)] flex items-center justify-center shadow-[0_0_12px_rgba(201,162,39,0.2)]"
          >
            <div className="w-2.5 h-2.5 bg-[var(--bg-base)] rounded-[2px]" />
          </motion.div>
          <span className="text-[14px] font-semibold text-[var(--text-primary)] tracking-wide">
            ExpenseTracker
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar px-[14px] py-[20px]">
        {navGroups.map((group, groupIdx) => (
          <div key={group.label} className={groupIdx > 0 ? "mt-[24px]" : ""}>
            <div className="px-[10px] pb-[12px] text-[11px] font-ui uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {group.label}
            </div>
            <ul className="space-y-[4px]">
              {group.items.map((item) => {
                const isActive =
                  item.route === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.route);
                const Icon = item.icon;

                return (
                  <li key={item.route} className="relative">
                    {isActive && (
                      <div className="absolute left-[-14px] top-[10px] w-[3px] h-[18px] bg-[var(--accent-brass)] rounded-r-[3px] shadow-[0_0_8px_rgba(201,162,39,0.3)]" />
                    )}
                    <Link
                      href={item.route}
                      className={cn(
                        "flex h-[38px] items-center rounded-[8px] px-[12px] text-[13px] transition-all duration-200",
                        isActive
                          ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-medium"
                          : "bg-transparent text-[var(--text-muted)] font-normal hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon 
                        className={cn("h-[16px] w-[16px] mr-[12px] flex-shrink-0", isActive ? "text-[var(--accent-brass)]" : "text-[var(--text-muted)]")} 
                        strokeWidth={isActive ? 2.5 : 2} 
                      />
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
      <div className="sticky bottom-0 bg-[var(--bg-surface)] border-t border-[var(--border-hair)] px-[16px] h-[64px] flex items-center gap-[12px] flex-shrink-0 z-10">
        <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-raised)] text-[var(--text-primary)] text-[12px] font-semibold border border-[var(--border-hair)]">
          {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center h-full">
          <span className="text-[12px] font-medium text-[var(--text-primary)] truncate max-w-[120px]">
            {session?.user?.name || "User"}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px] mt-[1px]">
            {session?.user?.email || "user@example.com"}
          </span>
        </div>
        {mounted && (
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => {
                import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/sign-in" }));
              }}
              className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[var(--bg-raised)] border border-[var(--border-hair)] text-[var(--text-muted)] hover:text-[var(--accent-clay)] hover:border-[var(--accent-clay)] transition-all"
              title="Sign out"
            >
              <LogOut size={13} className="lucide-log-out" />
            </button>
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[260px] z-50 bg-[var(--bg-base)] border-r border-[var(--border-hair)] flex flex-col xl:hidden"
            >
              <button
                onClick={closeSidebar}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[8px] bg-[var(--bg-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={16} />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR (xl+) */}
      <aside className="hidden xl:flex w-[220px] h-screen flex-shrink-0 flex-col bg-[var(--bg-base)] border-r border-[var(--border-hair)] z-20">
        {SidebarContent}
      </aside>
    </>
  );
}
