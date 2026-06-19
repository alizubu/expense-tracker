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
    <div className="flex flex-col w-full h-auto max-h-[280px] bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[16px] py-5 px-6 hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium text-[#475569] uppercase tracking-[0.08em]">
          Your Profiles
        </h2>
        <button 
          onClick={onAdd}
          className="text-[12px] font-medium text-[#7c3aed] bg-transparent border-none outline-none hover:text-[#a78bfa] transition-colors flex items-center gap-1 active:scale-[0.97]"
        >
          <LucideIcons.Plus size={16} className="sm:hidden" />
          <span className="hidden sm:inline">+ Add New</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col space-y-1 -mx-2 px-2">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <LucideIcons.Wallet className="h-[40px] w-[40px] text-[#1e293b] mb-2" />
            <span className="text-[13px] text-[#334155]">No data yet</span>
          </div>
        ) : (
          profiles.map((profile) => {
            const Icon = getIcon(profile.icon);
            const percentage = netBalance > 0 ? Math.max(0, Math.min(100, (profile.balance / netBalance) * 100)) : 0;
            
            return (
              <div 
                key={profile.id}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className="group flex flex-col justify-center h-[48px] md:h-[52px] rounded-[8px] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer px-2 transition-colors relative border-b border-[rgba(255,255,255,0.04)] last:border-0 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon + Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-[28px] w-[28px] md:h-[32px] md:w-[32px] items-center justify-center rounded-full bg-[rgba(124,58,237,0.12)] text-[#a78bfa]">
                      <Icon className="h-[12px] w-[12px] md:h-[14px] md:w-[14px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] md:text-[13px] font-medium text-[#f8fafc]">{profile.name}</span>
                      <span className="text-[10px] md:text-[11px] text-[#475569] capitalize">{profile.type.toLowerCase()}</span>
                    </div>
                  </div>

                  {/* Right: Balance + Percentage */}
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] md:text-[14px] font-semibold text-[#f8fafc]">
                      {symbol}{profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="hidden sm:inline text-[11px] text-[#475569]">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bottom Progress Bar */}
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1e293b] rounded-[1px] overflow-hidden opacity-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-[#7c3aed] rounded-[1px]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
