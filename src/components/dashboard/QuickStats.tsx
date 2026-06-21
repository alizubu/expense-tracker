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
    <div className="flex flex-col w-full h-auto md:h-full md:premium-card md:p-[16px] md:overflow-hidden">
      {/* Header */}
      <h2 className="hidden md:flex text-[10px] font-medium text-[#475569] uppercase tracking-[0.08em] mb-2 flex-shrink-0 h-[32px] items-center">
        Quick Stats
      </h2>

      {/* List */}
      <div className="flex flex-row overflow-x-auto hide-scrollbar gap-[8px] py-[4px] md:flex-col md:overflow-visible md:gap-0 md:py-0 md:flex-1 md:min-h-0 touch-pan-x">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="flex-shrink-0 w-[130px] h-[62px] rounded-[12px] p-[10px] flex flex-col justify-between border border-white/[0.06] md:border-x-0 md:border-t-0 md:border-b md:border-[rgba(255,255,255,0.04)] md:last:border-0 md:w-auto md:h-[40px] md:rounded-none md:p-0 md:flex-row md:items-center"
              style={{
                background: typeof window !== 'undefined' && window.innerWidth < 768 ? "linear-gradient(145deg, #111120, #0d0d18)" : "transparent"
              }}
            >
              <div className="md:hidden absolute inset-0 bg-[linear-gradient(145deg,#111120_0%,#0d0d18_100%)] rounded-[12px] -z-10" />
              
              {/* Top / Left */}
              <div className="flex items-center gap-[6px] md:gap-[10px] md:flex-1">
                <div 
                  className="flex items-center justify-center w-[16px] h-[16px] rounded-[4px] md:w-[28px] md:h-[28px] md:rounded-[8px] flex-shrink-0"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <Icon className="w-[10px] h-[10px] md:w-[13px] md:h-[13px]" color={stat.iconColor} />
                </div>
                <span className="text-[10px] md:text-[12px] text-[#64748b] truncate">
                  {stat.label}
                </span>
              </div>
              
              {/* Bottom / Right */}
              <div className="flex-shrink-0 text-left md:text-right md:w-[80px]">
                <span 
                  className={`text-[13px] font-semibold ${stat.isCurrency ? 'font-mono' : ''} ${stat.isCapitalize ? 'capitalize' : ''}`}
                  style={{ color: stat.textColor || '#f1f5f9' }}
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
