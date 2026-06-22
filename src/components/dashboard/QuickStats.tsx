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

import { motion } from "framer-motion";

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
    <div className="flex flex-col w-full h-auto lg:h-full premium-card p-[16px] overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.055)] bg-[linear-gradient(145deg,#0f0f1e_0%,#0c0c18_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)] transition-all duration-200 card-hover">
      {/* Header */}
      <h2 className="text-[10px] font-medium text-[#334155] uppercase tracking-[0.10em] mb-2 flex-shrink-0 h-[32px] flex items-center">
        QUICK STATS
      </h2>

      {/* List */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto hide-scrollbar">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="grid grid-cols-[28px_1fr_90px] gap-[14px] items-center flex-shrink-0 h-[44px] rounded-[8px] hover:bg-[rgba(255,255,255,0.018)] transition-colors duration-150 px-1 border-b border-[rgba(255,255,255,0.04)] last:border-0"
            >
              {/* Icon Chip */}
              <motion.div 
                whileHover={{ rotate: i % 2 === 0 ? 5 : -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[8px]"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Icon size={13} color={stat.iconColor} />
              </motion.div>
              
              {/* Label */}
              <div className="text-[12px] text-[#64748b] truncate">
                {stat.label}
              </div>
              
              {/* Value */}
              <div className="text-right">
                <span 
                  className={`text-[13px] font-semibold ${stat.isCurrency ? 'font-amount' : 'font-mono'} ${stat.isCapitalize ? 'capitalize' : ''}`}
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
