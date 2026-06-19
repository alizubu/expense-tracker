"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

const CATEGORY_COLORS: Record<string, string> = {
  Gaming: "#7c3aed",
  Groceries: "#10b981",
  Food: "#10b981",
  Drinks: "#10b981",
  Taxi: "#f59e0b",
  Transport: "#f59e0b",
  Gifts: "#ec4899",
  Rideshare: "#3b82f6",
  Default: "#94a3b8"
};

export function TopCategories() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const currentMonthTxns = transactions.filter(t => {
    const tDate = new Date(t.date);
    const now = new Date();
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear() && t.type === "EXPENSE";
  });

  const grouped = currentMonthTxns.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped)
    .map(([catId, amount]) => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
      const label = cat?.label || catId;
      return {
        id: catId,
        name: label,
        value: amount,
        iconName: cat?.icon || "CircleDot",
        color: CATEGORY_COLORS[label] || CATEGORY_COLORS.Default
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const maxAmount = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const totalSpent = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col w-full bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[16px] py-5 px-6 hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium text-[#475569] uppercase tracking-[0.08em]">
          Top Spending
        </h2>
        <span className="text-[11px] text-[#475569]">
          This month
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center h-[280px]">
          <div className="h-[40px] w-[40px] flex items-center justify-center text-[#1e293b] mb-2">
            <LucideIcons.BarChart2 className="w-6 h-6" />
          </div>
          <p className="text-[13px] text-[#334155]">No data yet</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          {data.map((item, index) => {
            const Icon = getIcon(item.iconName);
            const percentage = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
            const barWidth = maxAmount > 0 ? (item.value / maxAmount) * 100 : 0;

            return (
              <div 
                key={item.id}
                className={cn(
                  "group flex items-center h-[44px] md:h-[40px] hover:bg-[rgba(255,255,255,0.015)] rounded-[8px] px-2 -mx-2 transition-all cursor-pointer active:scale-[0.98]",
                  index >= 5 && "hidden sm:flex"
                )}
              >
                {/* Left: Icon */}
                <div 
                  className="hidden sm:flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full mr-3"
                  style={{ backgroundColor: `${item.color}1E` }} // 12% opacity roughly
                >
                  <Icon className="h-[11px] w-[11px]" style={{ color: item.color }} />
                </div>

                {/* Center: Name + Bar */}
                <div className="flex-1 min-w-0 mr-4">
                  <span className="text-[12px] md:text-[13px] font-medium text-[#f8fafc] truncate block">{item.name}</span>
                  <div className="h-[3px] w-full bg-[rgba(255,255,255,0.06)] rounded-[2px] mt-[4px] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-[2px]"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[12px] md:text-[13px] font-semibold md:font-bold text-[#f8fafc]">
                    {symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="hidden sm:block text-[10px] md:text-[11px] text-[#475569]">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
