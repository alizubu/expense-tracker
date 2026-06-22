"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

function getProfileColors(type: string) {
  switch (type.toLowerCase()) {
    case "cash":
      return { bg: "rgba(16,185,129,0.15)", icon: "#10b981" };
    case "bank":
    case "bank account":
      return { bg: "rgba(59,130,246,0.15)", icon: "#3b82f6" };
    case "wallet":
      return { bg: "rgba(124,58,237,0.15)", icon: "#a78bfa" };
    case "moneybag":
      return { bg: "rgba(245,158,11,0.15)", icon: "#f59e0b" };
    default:
      return { bg: "rgba(100,116,139,0.15)", icon: "#64748b" };
  }
}

interface ProfileListCardProps {
  profiles: any[];
  netBalance: number;
  onAdd: () => void;
}

export function ProfileCard({ profiles, netBalance, onAdd }: ProfileListCardProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const router = useRouter();

  return (
    <div className="flex flex-col w-full h-auto lg:h-full premium-card p-[16px] overflow-visible lg:overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.055)] bg-[linear-gradient(145deg,#0f0f1e_0%,#0c0c18_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)] transition-all duration-200 card-hover">
      {/* Header */}
      <div className="flex items-center justify-between h-[32px] mb-2 flex-shrink-0">
        <h2 className="text-[10px] font-medium text-[#334155] uppercase tracking-[0.10em]">
          YOUR PROFILES
        </h2>
        <button 
          onClick={onAdd}
          className="text-[12px] font-medium text-[#7c3aed] bg-transparent border-none outline-none hover:underline flex items-center gap-[4px] active:scale-[0.97]"
        >
          <LucideIcons.Plus size={12} />
          <span>+ Add New</span>
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col lg:flex-1 lg:overflow-y-auto hide-scrollbar lg:min-h-0">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LucideIcons.Wallet className="h-[32px] w-[32px] text-[#1e293b] mb-2" />
            <span className="text-[12px] text-[#1e293b]">No data yet</span>
          </div>
        ) : (
          profiles.map((profile, i) => {
            const Icon = getIcon(profile.icon);
            const percentage = netBalance > 0 ? Math.max(0, Math.min(100, (profile.balance / netBalance) * 100)) : 0;
            const colors = getProfileColors(profile.type);
            
            return (
              <div 
                key={profile.id}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className="group flex flex-col justify-center h-[52px] rounded-[10px] hover:bg-[rgba(255,255,255,0.018)] cursor-pointer transition-colors duration-150 relative border-b border-[rgba(255,255,255,0.035)] last:border-0 flex-shrink-0"
              >
                <div className="grid grid-cols-[34px_1fr_auto] gap-[12px] items-center px-1">
                  {/* Left: Icon */}
                  <motion.div 
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon size={16} color={colors.icon} />
                  </motion.div>

                  {/* Center: Name + Type */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-[#f1f5f9] truncate">{profile.name}</span>
                    <span className="text-[11px] text-[#475569] truncate capitalize">{profile.type.toLowerCase()}</span>
                  </div>

                  {/* Right: Balance + Percentage */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[13px] font-semibold text-[#f1f5f9] font-amount">
                      {symbol}{profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-[#475569]">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bottom Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(255,255,255,0.05)] rounded-[1px] m-0 overflow-hidden mb-[4px]">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    style={{ backgroundColor: colors.icon, width: `${percentage}%`, transformOrigin: "left" }}
                    className="h-full rounded-[1px]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Total Row */}
      {profiles.length > 0 && (
        <div className="h-[36px] mt-2 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-center px-1 flex-shrink-0">
          <span className="text-[11px] text-[#334155] font-medium uppercase tracking-[0.05em]">Total</span>
          <span className="text-[13px] font-semibold text-[#f1f5f9] font-amount">
            {symbol}{netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      )}
    </div>
  );
}
