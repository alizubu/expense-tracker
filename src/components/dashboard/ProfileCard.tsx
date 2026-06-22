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
    <div className="flex flex-col w-full h-auto lg:h-full premium-card p-[16px] overflow-visible lg:overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between h-[32px] mb-2 flex-shrink-0">
        <h2 className="text-[10px] font-medium text-[#475569] uppercase tracking-[0.08em]">
          Your Profiles
        </h2>
        <button 
          onClick={onAdd}
          className="text-[12px] font-medium text-[#7c3aed] bg-transparent border-none outline-none hover:underline flex items-center gap-[4px] active:scale-[0.97]"
        >
          <LucideIcons.Plus size={12} />
          <span className="hidden sm:inline">+ Add New</span>
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
              <motion.div 
                key={profile.id}
                initial={{ y: 4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className="group flex flex-col justify-center h-[44px] sm:h-[48px] rounded-[8px] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors relative border-b border-[rgba(255,255,255,0.04)] last:border-0 flex-shrink-0"
              >
                <div className="flex items-center gap-[10px] px-1">
                  {/* Left: Icon */}
                  <div 
                    className="flex h-[26px] w-[26px] sm:h-[32px] sm:w-[32px] flex-shrink-0 items-center justify-center rounded-[8px] sm:rounded-[10px]"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon size={15} color={colors.icon} />
                  </div>

                  {/* Center: Name + Type */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#f1f5f9] truncate">{profile.name}</span>
                    <span className="text-[11px] text-[#475569] truncate capitalize">{profile.type.toLowerCase()}</span>
                  </div>

                  {/* Right: Balance + Percentage */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[12px] sm:text-[13px] font-semibold text-[#f1f5f9] font-mono">
                      {symbol}{profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="hidden sm:block text-[10px] text-[#475569]">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bottom Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(255,255,255,0.05)] rounded-[1px] m-0 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-[1px]"
                    style={{ backgroundColor: colors.icon }}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
