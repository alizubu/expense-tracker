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
    <div className="flex flex-col w-full h-full premium-card p-[16px] overflow-hidden">
      {/* Header */}
      <h2 className="text-[10px] font-medium text-[#475569] uppercase tracking-[0.08em] mb-2 flex-shrink-0 h-[32px] flex items-center">
        Quick Stats
      </h2>

      {/* List */}
      <div className="flex-1 flex flex-col min-h-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="flex items-center h-[40px] border-b border-[rgba(255,255,255,0.04)] last:border-0"
            >
              {/* Left: Icon Dot */}
              <div 
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[8px] flex-shrink-0"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Icon size={13} color={stat.iconColor} />
              </div>
              
              {/* Center: Label */}
              <div className="flex-1 ml-[10px]">
                <span className="text-[12px] text-[#64748b]">
                  {stat.label}
                </span>
              </div>
              
              {/* Right: Value */}
              <div className="flex-shrink-0 w-[80px] text-right">
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
