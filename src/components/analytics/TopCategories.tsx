"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";
import { useMemo } from "react";
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
import { cn } from "@/lib/utils";

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
    <Card className="flex flex-col w-full h-[500px] p-6 lg:p-8 border-white/[0.04] bg-surface-1/40 backdrop-blur-2xl rounded-[24px] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(var(--primary),0.05)] transition-shadow duration-500">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

      <div className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10">
        <TypographyH3 className="text-[14px] font-bold text-foreground tracking-tight uppercase tracking-widest">
          Top Spending Areas
        </TypographyH3>
        <TypographySpan className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80 bg-surface-2/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.05] cursor-pointer hover:bg-surface-2/80 hover:text-foreground transition-all">
          This Month ▾
        </TypographySpan>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 flex flex-col justify-start relative z-10 pr-2">
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 rounded-[20px] bg-surface-2/40 border border-white/[0.03] flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
              <Tag className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <TypographySpan className="text-sm font-bold text-foreground tracking-tight">No expenses yet</TypographySpan>
            <TypographySpan className="text-[11px] font-medium text-muted-foreground/60 mt-1">Top spent categories will appear here</TypographySpan>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categoryData.map((cat, index) => {
              const categoryDef = getCategoryById(cat.id);
              const name = categoryDef?.label || cat.id;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const Icon = (Icons as any)[cat.iconName] || CircleDashed;

              return (
                <div 
                  key={cat.id} 
                  className="relative flex items-center p-4 rounded-[20px] bg-surface-2/20 border border-transparent hover:border-white/[0.04] hover:bg-surface-2/40 transition-all duration-300 group/cat cursor-pointer overflow-hidden"
                >
                  {/* Subtle Background Progress Fill */}
                  <div 
                    className="absolute left-0 top-0 h-full opacity-[0.03] group-hover/cat:opacity-[0.06] transition-all duration-1000 ease-out z-0 rounded-r-3xl"
                    style={{ width: `${cat.fillRatio}%`, backgroundColor: cat.color }}
                  />
                  
                  <div className="relative z-10 flex items-center w-full min-w-0 gap-4">
                    {/* Rank Indicator */}
                    <TypographySpan className="text-[12px] font-bold text-muted-foreground/30 w-5 flex-shrink-0 tabular-nums">
                      {(index + 1).toString().padStart(2, '0')}
                    </TypographySpan>

                    {/* Icon */}
                    <div 
                      className="flex h-11 w-11 rounded-[14px] items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover/cat:scale-110 shadow-inner"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color, boxShadow: `inset 0 0 0 1px ${cat.color}20` }} 
                    >
                      <Icon size={20} />
                    </div>

                    {/* Text Details (min-w-0 for truncation) */}
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <TypographySpan className="text-[14px] font-bold text-foreground truncate group-hover/cat:text-primary transition-colors tracking-tight">
                        {name}
                      </TypographySpan>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TypographySpan className="text-[11px] font-medium text-muted-foreground/60">
                          {cat.percentage.toFixed(1)}%
                        </TypographySpan>
                        {/* Sleek inline progress bar */}
                        <div className="h-1.5 flex-1 max-w-[60px] bg-surface-2/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${cat.fillRatio}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <TypographySpan className="text-[15px] font-bold text-foreground tabular-money flex-shrink-0 text-right min-w-[70px]">
                      {symbol}{cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TypographySpan>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
