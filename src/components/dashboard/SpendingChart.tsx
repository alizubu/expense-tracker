"use client";
import { TypographySpan, TypographyP, TypographyH2 } from "@/components/ui/typography";
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
import { ChevronDown, BarChart3 } from "lucide-react";

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
    <div className="bg-surface-2/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 text-sm shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: data.color }} />
      <div className="flex items-center gap-3 mb-2 mt-1">
        <TypographySpan className="font-bold text-foreground tracking-tight">{data.name}</TypographySpan>
      </div>
      <TypographyP className="text-muted-foreground font-medium">
        {symbol}{data.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} <span className="opacity-50 mx-1">•</span> <span className="text-foreground">{data.percentage.toFixed(1)}%</span>
      </TypographyP>
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
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <TypographyH2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Spending Analytics
        </TypographyH2>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-foreground bg-surface-2/60 hover:bg-surface-2 px-3 py-1.5 rounded-full transition-all border border-white/[0.04]">
          THIS MONTH <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <Card className="flex flex-col flex-1 p-6 sm:p-8 rounded-[24px] shadow-sm border border-white/[0.03] bg-surface-1/40 backdrop-blur-2xl transition-all relative overflow-hidden">
        {/* Glow behind chart */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        {chartData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 rounded-full bg-surface-2/40 border border-white/[0.03] flex items-center justify-center mb-4 ring-1 ring-white/5">
              <BarChart3 className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <TypographySpan className="text-sm font-semibold text-muted-foreground">No data available</TypographySpan>
            <TypographySpan className="text-xs text-muted-foreground/50 mt-1">Add expenses to see analytics</TypographySpan>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="relative h-[240px] flex-shrink-0 mt-4 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 82 : 98}
                    outerRadius={isMobile ? 86 : 102}
                    strokeWidth={0}
                    cornerRadius={10}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} className="drop-shadow-sm hover:opacity-80 transition-opacity outline-none" style={{ filter: `drop-shadow(0px 0px 4px ${entry.color}40)` }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <TypographySpan className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">
                  Total Spent
                </TypographySpan>
                <TypographySpan className="text-4xl font-bold text-foreground tabular-money tracking-tighter leading-none">
                  {symbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
            </div>

            <div className="flex-1 mt-6 pt-6 border-t border-gradient-to-r from-transparent via-white/[0.05] to-transparent relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
              <div className="space-y-4">
                {chartData.slice(0, showAllLegend ? undefined : 4).map((item) => (
                  <div key={item.name} className="flex flex-col gap-1.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <TypographySpan className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</TypographySpan>
                      </div>
                      <TypographySpan className="font-bold text-xs text-foreground tabular-money">
                        {symbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </TypographySpan>
                    </div>
                    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                      >
                        <div className="absolute inset-0 bg-white/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!showAllLegend && chartData.length > 4 && (
                <button 
                  onClick={() => setShowAllLegend(true)}
                  className="mt-6 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors w-full text-center py-2.5 rounded-xl bg-surface-2/30 hover:bg-surface-2/60 tracking-wider uppercase border border-white/[0.02]"
                >
                  View All Categories ({chartData.length})
                </button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
