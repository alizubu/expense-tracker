"use client";

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
      isCurrency: false,
    },
    {
      id: "avgDailySpend",
      label: "Avg Daily Spend",
      value: `${symbol}${avgDailySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      isCurrency: true,
    },
    {
      id: "largestExpense",
      label: "Largest Expense",
      value: `${symbol}${largestExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      isCurrency: true,
    },
    {
      id: "topCategory",
      label: "Top Category",
      value: topCategory,
      isCurrency: false,
      isCapitalize: true,
    },
    {
      id: "activeProfiles",
      label: "Active Profiles",
      value: profilesCount.toString(),
      isCurrency: false,
    },
  ];

  return (
    <div className="flex flex-col w-full h-auto lg:h-full bg-[var(--bg-surface)] p-[16px] overflow-hidden rounded-[16px] border border-[var(--border-hair)] transition-all duration-200">
      {/* Header */}
      <h2 className="text-[11px] font-ui text-[var(--text-muted)] uppercase tracking-[0.08em] mb-4 flex-shrink-0 flex items-center">
        QUICK STATS
      </h2>

      {/* List */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto hide-scrollbar gap-1">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className="flex justify-between items-center flex-shrink-0 py-2 border-b border-[var(--border-hair)] last:border-0"
          >
            {/* Label */}
            <div className="text-[13px] font-ui text-[var(--text-muted)]">
              {stat.label}
            </div>
            
            {/* Value */}
            <div className="text-right">
              <span 
                className={`text-[13px] text-[var(--text-primary)] font-mono ${stat.isCapitalize ? 'capitalize' : ''}`}
              >
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
