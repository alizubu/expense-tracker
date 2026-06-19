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

  return (
    <div className="flex flex-col w-full h-full bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[16px] py-5 px-6 hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200">
      <h2 className="text-[11px] font-medium text-[#475569] uppercase tracking-[0.08em] mb-2">
        Quick Stats
      </h2>
      
      <div className="flex flex-col">
        {/* Row 1 */}
        <div className="flex justify-between items-center h-[40px] border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02] rounded-md px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-2">
            <Activity size={14} color="#7c3aed" />
            <span className="text-[12px] text-[#94a3b8]">Transactions</span>
          </div>
          <span className="text-[13px] font-semibold text-[#f8fafc]">
            {transactionsCount}
          </span>
        </div>

        {/* Row 2 */}
        <div className="flex justify-between items-center h-[40px] border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02] rounded-md px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-2">
            <ArrowDownCircle size={14} color="#f43f5e" />
            <span className="text-[12px] text-[#94a3b8]">Avg Daily Spend</span>
          </div>
          <span className="text-[13px] font-semibold text-[#f8fafc]">
            {symbol}{avgDailySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Row 3 */}
        <div className="flex justify-between items-center h-[40px] border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02] rounded-md px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} color="#f59e0b" />
            <span className="text-[12px] text-[#94a3b8]">Largest Expense</span>
          </div>
          <span className="text-[13px] font-semibold text-[#f8fafc]">
            {symbol}{largestExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Row 4 */}
        <div className="flex justify-between items-center h-[40px] border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02] rounded-md px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-2">
            <Tag size={14} color="#10b981" />
            <span className="text-[12px] text-[#94a3b8]">Top Category</span>
          </div>
          <span className="text-[13px] font-semibold text-[#f8fafc]">
            {topCategory || "-"}
          </span>
        </div>

        {/* Row 5 */}
        <div className="flex justify-between items-center h-[40px] cursor-pointer hover:bg-white/[0.02] rounded-md px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-2">
            <Layers size={14} color="#3b82f6" />
            <span className="text-[12px] text-[#94a3b8]">Active Profiles</span>
          </div>
          <span className="text-[13px] font-semibold text-[#f8fafc]">
            {profilesCount}
          </span>
        </div>
      </div>
    </div>
  );
}
