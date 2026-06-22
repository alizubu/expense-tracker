"use client";

import { Activity, ArrowDownCircle, AlertCircle, Tag, Layers } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";

interface QuickStatsProps {
  transactionsCount: number;
  avgDailySpend: number;
  largestExpense: number;
  topCategory: string;
  profilesCount: number;
}

export function QuickStats({
  transactionsCount,
  avgDailySpend,
  largestExpense,
  topCategory,
  profilesCount,
}: QuickStatsProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const stats = [
    {
      id: "transactions",
      label: "Transactions",
      value: transactionsCount.toString(),
      icon: Activity,
      iconColor: "#a78bfa",
      iconBg: "rgba(124,58,237,0.12)",
      isCurrency: false,
    },
    {
      id: "avgDailySpend",
      label: "Avg Daily Spend",
      value: `${symbol}${avgDailySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: ArrowDownCircle,
      iconColor: "#f43f5e",
      iconBg: "rgba(243,67,94,0.12)",
      isCurrency: true,
    },
    {
      id: "largestExpense",
      label: "Largest Expense",
      value: `${symbol}${largestExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: AlertCircle,
      iconColor: "#f59e0b",
      iconBg: "rgba(245,158,11,0.12)",
      isCurrency: true,
    },
    {
      id: "topCategory",
      label: "Top Category",
      value: topCategory,
      icon: Tag,
      iconColor: "#10b981",
      iconBg: "rgba(16,185,129,0.12)",
      isCurrency: false,
      isCapitalize: true,
      textColor: "#a78bfa",
    },
    {
      id: "activeProfiles",
      label: "Active Profiles",
      value: profilesCount.toString(),
      icon: Layers,
      iconColor: "#3b82f6",
      iconBg: "rgba(59,130,246,0.12)",
      isCurrency: false,
    },
  ];

  return (
    <div className="flex flex-col w-full h-auto md:h-full border border-border bg-card shadow-sm p-4 rounded-2xl md:overflow-hidden hover:border-accent/10 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <h2 className="hidden md:flex text-[10px] font-semibold text-text-secondary uppercase tracking-[0.08em] mb-2 flex-shrink-0 h-[32px] items-center">
        Quick Stats
      </h2>

      {/* List */}
      <div className="flex flex-row overflow-x-auto hide-scrollbar gap-[8px] py-[4px] md:flex-col md:overflow-visible md:gap-0 md:py-0 md:flex-1 md:min-h-0 touch-pan-x">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="flex-shrink-0 w-[130px] h-[62px] rounded-2xl p-3 flex flex-col justify-between border border-border bg-card-elevated/50 md:bg-transparent md:border-x-0 md:border-t-0 md:border-b md:border-border/40 md:last:border-0 md:w-auto md:h-[40px] md:rounded-none md:p-0 md:flex-row md:items-center"
            >
              {/* Top / Left */}
              <div className="flex items-center gap-[6px] md:gap-[10px] md:flex-1">
                <div 
                  className="flex items-center justify-center w-[16px] h-[16px] rounded-[4px] md:w-[28px] md:h-[28px] md:rounded-[8px] flex-shrink-0"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <Icon className="w-[10px] h-[10px] md:w-[13px] md:h-[13px]" color={stat.iconColor} />
                </div>
                <span className="text-[10px] md:text-[12px] text-text-secondary truncate font-medium">
                  {stat.label}
                </span>
              </div>
              
              {/* Bottom / Right */}
              <div className="flex-shrink-0 text-left md:text-right md:w-[80px]">
                <span 
                  className={`text-[13px] font-bold ${stat.isCurrency ? 'font-mono' : ''} ${stat.isCapitalize ? 'capitalize' : ''} text-text-primary`}
                  style={stat.textColor ? { color: stat.textColor } : undefined}
                >
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
