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
  LucideIcon,
  Tag
} from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";

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
    <Card className="flex flex-col w-full h-[350px] p-4 md:p-6 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-text-primary">
          Top Spending
        </h3>
        <span className="text-[11px] text-text-muted bg-white/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-border/40">
          This Month
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 -mx-2 px-2 flex flex-col justify-start pb-2">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent mb-3 border border-accent/10">
              <Tag size={18} />
            </div>
            <span className="text-xs font-semibold text-text-primary">No expenses yet</span>
            <span className="text-[10px] text-text-muted mt-0.5">Top spent categories will show here</span>
          </div>
        ) : (
          categoryData.map((cat, index) => {
            const { Icon, accent } = getCategoryTheme(cat.id);
            const categoryDef = getCategoryById(cat.id);
            const name = categoryDef?.label || cat.id;

            return (
              <div 
                key={cat.id} 
                className="flex flex-col justify-center py-2 px-2 rounded-xl hover:bg-white/[0.02] dark:hover:bg-white/[0.02] hover:bg-black/[0.01] transition-colors border-b border-border/30 last:border-b-0"
              >
                {/* Line 1 */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div 
                    className="flex h-[22px] w-[22px] rounded-full items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    <Icon size={11} color={accent} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary flex-1 truncate">
                    {name}
                  </span>
                  <span className="text-xs font-bold text-text-primary font-mono flex-shrink-0">
                    {symbol}{cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                {/* Line 2 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[4px] bg-border/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.fillRatio}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted w-[32px] text-right font-medium">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
