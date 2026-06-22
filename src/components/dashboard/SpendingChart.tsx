"use client";

import { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById, getCategoryColor } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const symbol = getCurrencySymbol(useUIStore.getState().selectedCurrency);

  return (
    <div className="bg-surface-3 border border-white/[0.04] rounded-lg px-3 py-2 text-xs shadow-md">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="font-semibold text-foreground">{data.name}</span>
      </div>
      <p className="text-muted-foreground">
        {symbol}{data.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({data.percentage.toFixed(1)}%)
      </p>
    </div>
  );
}

export function SpendingChart() {
  const { transactions } = useTransactionStore();
  const { selectedMonth, selectedYear, selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [showAllLegend, setShowAllLegend] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const chartData = useMemo(() => {
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

    const total = Array.from(categoryMap.values()).reduce((s, v) => s + v, 0);

    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]);

    return sorted.map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      return {
        name: category?.label || categoryId,
        value: amount,
        color: getCategoryColor(categoryId),
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col w-full h-auto sm:h-full p-6 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Spending By Category
        </h2>
        <span className="text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground bg-surface-2 px-2 py-1 rounded-md transition-colors">
          This Month ▾
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-3 border border-white/[0.04]">
            <div className="w-4 h-4 border-2 border-muted-foreground rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">No data yet</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-1 min-h-0">
          <div className="relative h-[220px] flex-shrink-0 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 70 : 86}
                  outerRadius={isMobile ? 86 : 106}
                  strokeWidth={2}
                  stroke="hsl(var(--surface-1))"
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                Spent
              </span>
              <span className="text-3xl font-bold text-foreground font-mono tracking-tight leading-none mt-1">
                {symbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="overflow-visible sm:flex-1 sm:overflow-y-auto hide-scrollbar mt-6 pt-4 border-t border-white/[0.04]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {chartData.slice(0, showAllLegend ? undefined : 6).map((item) => (
                <div key={item.name} className="flex items-center group">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: item.color }} />
                  <span className="ml-3 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">{item.name}</span>
                  <span className="ml-2 font-mono font-semibold text-xs text-foreground flex-shrink-0 text-right">
                    {symbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
            {!showAllLegend && chartData.length > 6 && (
              <button 
                onClick={() => setShowAllLegend(true)}
                className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full text-center py-2 rounded-lg hover:bg-primary/5"
              >
                +{chartData.length - 6} more categories
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
