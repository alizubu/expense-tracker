"use client";
import { TypographySpan, TypographyH3, TypographyP } from "@/components/ui/typography";
import { useTransactionStore } from "@/store/useTransactionStore";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { PieChart } from "lucide-react";
import { getCategoryById, getCategoryColor, EXPENSE_CATEGORIES } from "@/lib/categories";
import { Card } from "@/components/ui/card";
import { useMemo, useState, useEffect } from "react";

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
    <div className="bg-surface-2/90 backdrop-blur-xl border border-white/[0.08] rounded-[16px] px-4 py-3 text-sm shadow-xl relative overflow-hidden z-50">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: data.color }} />
      <div className="flex items-center gap-3 mb-1 mt-1">
        <TypographySpan className="font-bold text-foreground tracking-tight">{data.name}</TypographySpan>
      </div>
      <TypographyP className="text-[13px] text-muted-foreground font-medium tabular-nums">
        {symbol}{data.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="opacity-50 mx-1">•</span> <span className="text-foreground">{data.percentage.toFixed(1)}%</span>
      </TypographyP>
    </div>
  );
}

export function CategoryDonutChart() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const chartData = useMemo(() => {
    const currentMonthTxns = transactions.filter(t => {
      const tDate = new Date(t.date);
      const now = new Date();
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear() && t.type === "EXPENSE";
    });

    const categoryMap = new Map<string, number>();
    currentMonthTxns.forEach((t) => {
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
  }, [transactions]);

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-5 md:p-6 w-full h-full min-h-[400px] flex flex-col justify-between border-white/[0.04] bg-surface-1/40 backdrop-blur-2xl rounded-[24px] relative overflow-hidden group">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

      <div className="flex items-center justify-between mb-4 flex-shrink-0 relative z-10">
        <TypographyH3 className="text-[14px] font-bold text-foreground tracking-tight">
          Category Distribution
        </TypographyH3>
        <TypographySpan className="text-[10px] font-bold text-muted-foreground/80 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.05] uppercase tracking-widest">
          This Month
        </TypographySpan>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start min-h-0 w-full relative z-10">
        {chartData.length > 0 ? (
          <>
            {/* Chart Area */}
            <div className="relative h-[220px] w-full flex-shrink-0 mt-2 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 80 : 90}
                    outerRadius={isMobile ? 84 : 94}
                    strokeWidth={0}
                    cornerRadius={10}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} className="drop-shadow-sm hover:opacity-80 transition-opacity outline-none" style={{ filter: `drop-shadow(0px 0px 6px ${entry.color}40)` }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <TypographySpan className="text-[10px] uppercase text-muted-foreground/60 font-bold tracking-[0.2em] mb-1">Spent</TypographySpan>
                <TypographySpan className="text-3xl font-bold text-foreground tracking-tighter tabular-money leading-none drop-shadow-sm">
                  {symbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
            </div>

            {/* Legend Area */}
            <div className="w-full flex-1 overflow-y-auto hide-scrollbar">
              <div className="flex flex-col gap-3">
                {chartData.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5 group/item">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: item.color, boxShadow: `inset 0 0 0 1px ${item.color}40` }} />
                        <TypographySpan className="text-[12px] font-medium text-foreground group-hover/item:text-primary transition-colors">{item.name}</TypographySpan>
                      </div>
                      <TypographySpan className="text-[13px] font-bold text-foreground tabular-money">
                        {symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TypographySpan>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-surface-2/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
                {chartData.length > 4 && (
                  <div className="mt-2 flex justify-center">
                    <TypographySpan className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest bg-surface-2/30 px-3 py-1.5 rounded-full border border-white/[0.03]">
                      +{chartData.length - 4} more
                    </TypographySpan>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full py-10">
            <div className="w-16 h-16 rounded-[20px] bg-surface-2/40 border border-white/[0.03] flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
              <PieChart className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <TypographySpan className="text-sm font-bold text-foreground tracking-tight">No data yet</TypographySpan>
            <TypographySpan className="text-[11px] font-medium text-muted-foreground/60 mt-1">Expenses will appear here</TypographySpan>
          </div>
        )}
      </div>
    </Card>
  );
}
