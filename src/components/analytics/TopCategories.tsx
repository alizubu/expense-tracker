"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Utensils, 
  ShoppingCart, 
  Gamepad2, 
  Cpu, 
  Car, 
  AlertCircle, 
  Shirt, 
  Circle,
  LucideIcon
} from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";

function getCategoryTheme(categoryId: string): { Icon: LucideIcon, accent: string } {
  const mapping: Record<string, { Icon: LucideIcon, accent: string }> = {
    "food": { Icon: Utensils, accent: "#f59e0b" },
    "fastfood": { Icon: Utensils, accent: "#f97316" },
    "groceries": { Icon: ShoppingCart, accent: "#10b981" },
    "gaming": { Icon: Gamepad2, accent: "#7c3aed" },
    "electronics": { Icon: Cpu, accent: "#3b82f6" },
    "ride": { Icon: Car, accent: "#06b6d4" },
    "tax": { Icon: AlertCircle, accent: "#f43f5e" },
    "clothing": { Icon: Shirt, accent: "#ec4899" },
  };

  return mapping[categoryId.toLowerCase()] || { Icon: Circle, accent: "#64748b" };
}

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
    <div className="flex flex-col w-full h-full premium-card p-[16px] overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.055)] bg-[linear-gradient(145deg,#0f0f1e_0%,#0c0c18_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)] transition-all duration-200 card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0 h-[32px]">
        <h2 className="text-[10px] font-medium text-[#334155] uppercase tracking-[0.10em]">
          TOP SPENDING
        </h2>
        <span className="text-[10px] text-[#334155]">
          This month
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 flex flex-col pb-2">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-2">
              <Circle className="h-[16px] w-[16px] text-[#1e293b]" />
            </div>
            <span className="text-[12px] text-[#1e293b]">No expenses yet</span>
          </div>
        ) : (
          categoryData.map((cat, index) => {
            const { Icon, accent } = getCategoryTheme(cat.id);
            const categoryDef = getCategoryById(cat.id);
            const name = categoryDef?.label || cat.id;

            return (
              <div 
                key={cat.id} 
                className="flex flex-col justify-center h-[54px] py-[6px] px-1 rounded-[8px] hover:bg-[rgba(255,255,255,0.018)] transition-colors border-b border-[rgba(255,255,255,0.035)] last:border-b-0"
              >
                {/* Line 1 */}
                <div className="flex items-center gap-2 mb-[4px]">
                  <div 
                    className="flex h-[20px] w-[20px] rounded-[7px] items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}21` }} // 13% opacity roughly ~21 hex
                  >
                    <Icon size={11} color={accent} />
                  </div>
                  <span className="text-[12px] font-medium text-[#f1f5f9] flex-1 truncate">
                    {name}
                  </span>
                  <span className="text-[13px] font-semibold text-[#f1f5f9] font-amount flex-shrink-0 text-right">
                    {symbol}{cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                {/* Line 2 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[4px] bg-[rgba(255,255,255,0.055)] rounded-[2px] overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${cat.fillRatio}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                      className="h-full rounded-[2px]"
                      style={{ backgroundColor: accent }}
                    />
                  </div>
                  <span className="text-[10px] text-[#475569] min-w-[36px] text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
