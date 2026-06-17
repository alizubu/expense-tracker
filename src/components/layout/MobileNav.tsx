"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", route: "/" },
  { icon: ArrowLeftRight, label: "Transactions", route: "/transactions" },
  { icon: Wallet, label: "Profiles", route: "/profiles" },
  { icon: BarChart3, label: "Analytics", route: "/analytics" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-background-secondary/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);
          const Icon = item.icon;

          return (
            <Link
              key={item.route}
              href={item.route}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "text-brand-purple"
                  : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-brand-purple" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
