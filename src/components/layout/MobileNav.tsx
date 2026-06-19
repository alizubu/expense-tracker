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
  { icon: LayoutDashboard, label: "Home", route: "/" },
  { icon: ArrowLeftRight, label: "Transactions", route: "/transactions" },
  { icon: null, label: "Add", route: "add" }, // Special center button
  { icon: Users, label: "Profiles", route: "/profiles" },
  { icon: BarChart2, label: "Analytics", route: "/analytics" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { openModal } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[60px] pb-safe bg-[rgba(13,13,20,0.95)] backdrop-blur-[16px] border-t border-white/[0.06] lg:hidden">
      <div className="flex items-center justify-between h-full px-2">
        {mobileNavItems.map((item, index) => {
          if (item.route === "add") {
            return (
              <div key="add-btn" className="flex-1 flex justify-center h-full relative">
                <button
                  onClick={() => openModal("addTransaction")}
                  className="absolute -top-[16px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#7c3aed] text-white active:scale-95 transition-transform"
                  style={{
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)",
                    animation: "navBtnPulse 2.5s ease-out infinite"
                  }}
                >
                  <Plus size={22} color="white" />
                </button>
                <style jsx>{`
                  @keyframes navBtnPulse {
                    0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.6); }
                    70%  { box-shadow: 0 0 0 10px rgba(124,58,237,0); }
                    100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
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
              className="flex-1 flex flex-col items-center justify-center h-full relative active:scale-[0.97] active:opacity-80 transition-transform"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute top-[4px] h-[3px] w-[3px] rounded-full bg-[#7c3aed]"
                />
              )}
              <div
                className={cn(
                  "flex items-center justify-center h-[32px] w-[32px] transition-colors rounded-full",
                  isActive ? "bg-[rgba(124,58,237,0.12)] text-[#a78bfa]" : "text-[#475569]"
                )}
              >
                <Icon size={20} />
              </div>
              <span 
                className={cn(
                  "text-[10px] mt-[3px] font-medium transition-colors",
                  isActive ? "text-[#a78bfa]" : "text-[#475569]"
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
