"use client";

import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

interface ProfileCardProps {
  profile: any;
  netBalance: number;
}

export function ProfileCard({ profile, netBalance }: ProfileCardProps) {
  const Icon = getIcon(profile.icon);
  const percentage = netBalance > 0 ? (profile.balance / netBalance) * 100 : 0;

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="flex flex-col justify-between h-[140px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 hover:border-[var(--border-default)] transition-all duration-150"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)]">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[14px] font-medium text-[var(--text-primary)]">
            {profile.name}
          </span>
        </div>
        <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[14px] text-[var(--text-muted)]">৳</span>
          <NumberTicker
            value={profile.balance}
            className="font-mono text-[24px] font-semibold text-[var(--text-primary)] tracking-tight"
            decimalPlaces={0}
            duration={1.2}
          />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="h-1 w-full rounded-sm bg-[var(--border-subtle)] overflow-hidden">
          <div
            className="h-full rounded-sm"
            style={{
              width: `${Math.min(Math.max(percentage, 0), 100)}%`,
              background: "linear-gradient(to right, var(--accent), var(--accent-light))",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
