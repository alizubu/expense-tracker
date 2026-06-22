"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";

export function TopCategories() {
  const { transactions } = useTransactionStore();
  const { selectedMonth, selectedYear, selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const categoryData = useMemo(() => {
    const monthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        d.getMonth() + 1 === selectedMonth &&
        d.getFullYear() === selectedYear
      );
    });

    const categoryMap = new Map<string, number>();
    monthExpenses.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    const maxAmount = Math.max(...Array.from(categoryMap.values()), 1);

    return Array.from(categoryMap.entries())
      .map(([id, amount]) => ({
        id,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        fillRatio: (amount / maxAmount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="flex flex-col w-full h-full bg-[var(--bg-surface)] p-[16px] overflow-hidden rounded-[16px] border border-[var(--border-hair)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h2 className="text-[11px] font-ui text-[var(--text-muted)] uppercase tracking-[0.08em]">
          TOP SPENDING
        </h2>
        <span className="text-[11px] font-ui text-[var(--text-muted)]">
          This month
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 flex flex-col gap-3 pb-2">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-[12px] text-[var(--text-muted)] font-ui">No expenses yet</span>
          </div>
        ) : (
          categoryData.map((cat, index) => {
            const categoryDef = getCategoryById(cat.id);
            const name = categoryDef?.label || cat.id;

            return (
              <div key={cat.id} className="relative flex items-center h-[36px] w-full group">
                {/* Background Pill */}
                <div className="absolute inset-y-0 left-0 bg-[var(--bg-raised)] rounded-[6px] border border-[var(--border-hair)] overflow-hidden group-hover:border-[var(--accent-brass)] transition-colors w-full">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${cat.fillRatio}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                    className="h-full bg-[var(--accent-dim)] opacity-20"
                  />
                </div>

                {/* Inline Content */}
                <div className="relative flex justify-between items-center w-full px-3 z-10 pointer-events-none">
                  <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                    {name}
                  </span>
                  <div className="flex items-baseline gap-3 flex-shrink-0">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {cat.percentage.toFixed(1)}%
                    </span>
                    <span className="text-[13px] font-medium text-[var(--text-primary)] font-mono">
                      {symbol}{cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
