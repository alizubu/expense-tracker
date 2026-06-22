"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { LucideIcon } from "lucide-react";

interface HeroStatCardProps {
  title: string;
  amount: number;
  accentColor: string;
  icon?: LucideIcon;
  sparklineData?: { value: number }[];
  savingsRate?: number; // If provided, shows the vault dial
}

function VaultDial({ percentage, color }: { percentage: number; color: string }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center group">
      <svg width="48" height="48" className="-rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="var(--border-hair)"
          strokeWidth="4"
          fill="none"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-mono text-[var(--text-primary)]">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="absolute bottom-[-18px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[9px] font-ui text-[var(--text-muted)] tracking-wide">
        SAVINGS RATE
      </div>
    </div>
  );
}

export function HeroStatCard({
  title,
  amount,
  accentColor,
  icon: Icon,
  sparklineData,
  savingsRate,
}: HeroStatCardProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  return (
    <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-hair)] hover:border-[var(--border-hair)] transition-colors overflow-visible rounded-[12px] shadow-none flex flex-col">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-ui uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {title}
            </span>
          </div>
          <div className="flex items-baseline mt-1" style={{ color: accentColor }}>
            <span className="text-[28px] font-mono font-medium tracking-tight mr-1">
              {symbol}
            </span>
            <NumberTicker
              value={amount}
              decimalPlaces={0}
              className="text-[28px] font-mono font-medium tracking-tight"
            />
          </div>
        </div>

        {savingsRate !== undefined ? (
          <VaultDial percentage={savingsRate} color={accentColor} />
        ) : Icon ? (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon size={14} color={accentColor} />
          </div>
        ) : null}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-[40px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
