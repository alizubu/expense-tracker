"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  CircleDashed,
  Tag
} from "lucide-react";
import * as Icons from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById, getCategoryColor, getCategoryIconName } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";


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
        color: getCategoryColor(id),
        iconName: getCategoryIconName(id),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <Card className="flex flex-col w-full h-full p-4 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3 flex-shrink-0 h-[32px]">
        <TypographyH3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Top Spending
        </TypographyH3>
        <TypographySpan className="text-[11px] font-semibold text-muted-foreground bg-surface-2 px-2 py-1 rounded-md transition-colors cursor-pointer hover:text-foreground">
          This Month ▾
        </TypographySpan>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col justify-start pr-2 pb-2 space-y-1">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-white/[0.04] flex items-center justify-center mb-3">
              <Tag className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <TypographySpan className="text-sm font-medium text-muted-foreground">No expenses yet</TypographySpan>
            <TypographySpan className="text-xs text-muted-foreground mt-1">Top spent categories will show here</TypographySpan>
          </div>
        ) : (
          categoryData.map((cat, index) => {
            const categoryDef = getCategoryById(cat.id);
            const name = categoryDef?.label || cat.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Icon = (Icons as any)[cat.iconName] || CircleDashed;

            return (
              <div 
                key={cat.id} 
                className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-surface-2 transition-colors border border-transparent hover:border-white/[0.04] group"
              >
                <div 
                  className="flex h-8 w-8 rounded-lg items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${cat.color}1a`, color: cat.color }} 
                >
                  <Icon size={14} />
                </div>
                <TypographySpan className="text-[13px] font-semibold text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                  {name}
                </TypographySpan>
                <TypographySpan className="text-[13px] font-bold text-foreground font-mono flex-shrink-0 tabular-money">
                  {symbol}{cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
