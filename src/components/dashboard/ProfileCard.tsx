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
    <div className="flex flex-col w-full h-auto lg:h-full bg-[var(--bg-surface)] p-[16px] overflow-visible lg:overflow-hidden rounded-[16px] border border-[var(--border-hair)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between h-[32px] mb-2 flex-shrink-0">
        <h2 className="text-[11px] font-ui text-[var(--text-muted)] uppercase tracking-[0.08em]">
          YOUR PROFILES
        </h2>
        <button 
          onClick={onAdd}
          className="h-8 px-2 rounded-[8px] text-[12px] font-medium text-[var(--accent-brass)] hover:bg-[var(--bg-raised)] active:scale-[0.98] transition-all flex items-center gap-2 border-none"
        >
          <LucideIcons.Plus size={12} /> Add New
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col lg:flex-1 lg:overflow-y-auto hide-scrollbar lg:min-h-0 gap-2">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LucideIcons.Wallet className="h-[32px] w-[32px] text-[var(--text-muted)] mb-2" />
            <span className="text-[12px] text-[var(--text-muted)]">No data yet</span>
          </div>
        ) : (
          profiles.map((profile, i) => {
            const Icon = getIcon(profile.icon);
            const percentage = netBalance > 0 ? Math.max(0, Math.min(100, (profile.balance / netBalance) * 100)) : 0;
            
            return (
              <div 
                key={profile.id}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className="group flex flex-col justify-center py-2 rounded-[8px] hover:bg-[var(--bg-raised)] cursor-pointer transition-colors duration-150 border border-transparent hover:border-[var(--border-hair)] px-2"
              >
                <div className="grid grid-cols-[28px_1fr_auto] gap-[12px] items-center mb-2">
                  {/* Left: Icon */}
                  <motion.div 
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[6px] bg-[var(--bg-raised)] border border-[var(--border-hair)] group-hover:border-[var(--accent-brass)] transition-colors"
                  >
                    <Icon size={14} color="var(--accent-brass)" />
                  </motion.div>

                  {/* Center: Name + Type */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">{profile.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate capitalize font-ui">{profile.type.toLowerCase()}</span>
                  </div>

                  {/* Right: Balance */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[13px] font-medium text-[var(--text-primary)] font-mono">
                      {symbol}{profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bottom Progress Bar */}
                <div className="h-[2px] w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                    className="h-full bg-[var(--accent-brass)] rounded-full"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Total Row */}
      {profiles.length > 0 && (
        <div className="h-[36px] mt-2 border-t border-[var(--border-hair)] flex justify-between items-center px-1 flex-shrink-0">
          <span className="text-[11px] text-[var(--text-muted)] font-ui uppercase tracking-[0.05em]">Total</span>
          <span className="text-[14px] font-medium text-[var(--text-primary)] font-mono">
            {symbol}{netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      )}
    </div>
  );
}
