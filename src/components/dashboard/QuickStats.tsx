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
  profilesCount
}: QuickStatsProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const stats = [
    { id: 1, icon: Activity, color: "#7c3aed", label: "Transactions", value: transactionsCount.toString() },
    { id: 2, icon: ArrowDownCircle, color: "#f43f5e", label: "Avg Daily Spend", value: `${symbol}${avgDailySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { id: 3, icon: AlertCircle, color: "#f59e0b", label: "Largest Expense", value: `${symbol}${largestExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { id: 4, icon: Tag, color: "#10b981", label: "Top Category", value: topCategory || "-" },
    { id: 5, icon: Layers, color: "#3b82f6", label: "Active Profiles", value: profilesCount.toString() },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[16px] py-4 px-4 md:py-5 md:px-6 hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200">
      <h2 className="text-[11px] font-medium text-[#475569] uppercase tracking-[0.08em] mb-3 md:mb-2">
        Quick Stats
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-y-4 gap-x-3 sm:gap-0 sm:flex sm:flex-col flex-1">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className={`flex flex-col sm:flex-row sm:justify-between items-start sm:items-center sm:h-[40px] sm:border-b sm:border-white/[0.04] cursor-pointer sm:hover:bg-white/[0.02] sm:rounded-md sm:px-2 sm:-mx-2 transition-colors ${index === 4 ? "sm:border-b-0 col-span-2 sm:col-span-1" : ""}`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-0">
                <Icon size={14} color={stat.color} className="sm:h-[14px] sm:w-[14px]" />
                <span className="text-[10px] sm:text-[12px] text-[#94a3b8]">{stat.label}</span>
              </div>
              <span className="text-[16px] sm:text-[13px] font-semibold text-[#f8fafc]">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
