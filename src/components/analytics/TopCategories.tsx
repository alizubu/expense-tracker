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

function getCategoryTheme(categoryId: string): { Icon: LucideIcon, accent: string, bg: string } {
  const mapping: Record<string, { Icon: LucideIcon, accent: string, bg: string }> = {
    "food": { Icon: Utensils, accent: "text-amber-500", bg: "bg-amber-500/10" },
    "fastfood": { Icon: Utensils, accent: "text-orange-500", bg: "bg-orange-500/10" },
    "groceries": { Icon: ShoppingCart, accent: "text-emerald-500", bg: "bg-emerald-500/10" },
    "gaming": { Icon: Gamepad2, accent: "text-violet-500", bg: "bg-violet-500/10" },
    "electronics": { Icon: Cpu, accent: "text-blue-500", bg: "bg-blue-500/10" },
    "ride": { Icon: Car, accent: "text-cyan-500", bg: "bg-cyan-500/10" },
    "tax": { Icon: AlertCircle, accent: "text-rose-500", bg: "bg-rose-500/10" },
    "clothing": { Icon: Shirt, accent: "text-pink-500", bg: "bg-pink-500/10" },
  };

  return mapping[categoryId.toLowerCase()] || { Icon: Circle, accent: "text-slate-500", bg: "bg-slate-500/10" };
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
    <Card className="flex flex-col w-full h-auto min-h-[350px] p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Top Spending
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
          This Month
        </span>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 flex flex-col justify-start pb-2 space-y-2">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Tag className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">No expenses yet</span>
            <span className="text-xs text-muted-foreground mt-1">Top spent categories will show here</span>
          </div>
        ) : (
          categoryData.map((cat, index) => {
            const { Icon, accent, bg } = getCategoryTheme(cat.id);
            const categoryDef = getCategoryById(cat.id);
            const name = categoryDef?.label || cat.id;

            return (
              <div 
                key={cat.id} 
                className="flex flex-col justify-center py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-white/[0.04]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`flex h-10 w-10 rounded-lg items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={18} className={accent} />
                  </div>
                  <span className="text-sm font-semibold text-foreground flex-1 truncate">
                    {name}
                  </span>
                  <span className="text-sm font-bold text-foreground font-mono flex-shrink-0">
                    {symbol}{cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 pl-[52px]">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.fillRatio}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                      className={`h-full rounded-full bg-current ${accent}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right font-medium font-mono">
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
