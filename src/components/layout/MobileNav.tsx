"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Users,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/" },
  { icon: ArrowLeftRight, label: "Transactions", route: "/transactions" },
  { icon: null, label: "Add", route: "add" }, // Special center button
  { icon: Users, label: "Profiles", route: "/profiles" },
  { icon: BarChart2, label: "Analytics", route: "/analytics" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { openModal } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[60px] pb-safe bg-[rgba(10,10,18,0.96)] backdrop-blur-[20px] border-t border-white/[0.06] lg:hidden">
      <div className="grid grid-cols-5 items-center h-[60px]">
        {mobileNavItems.map((item) => {
          if (item.route === "add") {
            return (
              <div key="add-btn" className="flex justify-center relative">
                <button
                  onClick={() => openModal("addTransaction")}
                  className="absolute -top-[14px] flex h-[50px] w-[50px] items-center justify-center rounded-full text-white active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    animation: "navPulse 2.5s ease-out infinite"
                  }}
                >
                  <Plus size={22} color="white" />
                </button>
                <style jsx>{`
                  @keyframes navPulse {
                    0%   { box-shadow: 0 0 0 4px rgba(10,10,18,1), 0 0 0 4px rgba(124,58,237,0.5); }
                    70%  { box-shadow: 0 0 0 4px rgba(10,10,18,1), 0 0 0 14px rgba(124,58,237,0); }
                    100% { box-shadow: 0 0 0 4px rgba(10,10,18,1), 0 0 0 4px rgba(124,58,237,0); }
                  }
                `}</style>
              </div>
            );
          }

          const isActive = item.route === "/"
            ? pathname === "/"
            : pathname.startsWith(item.route);
            
          const Icon = item.icon!;

          return (
            <Link
              key={item.route}
              href={item.route}
              className="flex flex-col items-center gap-[3px] relative active:scale-[0.97] active:opacity-80 transition-transform"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[2px] h-[3px] w-[3px] rounded-full bg-[#7c3aed]"
                />
              )}
              <div
                className={cn(
                  "flex items-center justify-center h-[32px] w-[32px] transition-colors rounded-full",
                  isActive ? "bg-[rgba(124,58,237,0.12)] text-[#a78bfa]" : "text-[#334155]"
                )}
              >
                <Icon size={20} />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-[#a78bfa]" : "text-[#334155]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
