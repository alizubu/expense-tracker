"use client";
import { TypographySpan, TypographyP, TypographyH2 } from "@/components/ui/typography";
import { useMemo, useState, useEffect, useCallback } from "react";
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
import { BarChart3 } from "lucide-react";
import Link from "next/link";

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
    <div className="bg-surface-2/90 backdrop-blur-xl border border-white/[0.08] rounded-lg px-3 py-2 text-sm shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: data.color }} />
      <div className="flex items-center gap-2 mb-1 mt-0.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
        <TypographySpan className="font-bold text-foreground tracking-tight text-xs">{data.name}</TypographySpan>
      </div>
      <TypographyP className="text-muted-foreground font-medium text-xs">
        <span className="currency-symbol">{symbol}</span>{data.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} <span className="opacity-40 mx-0.5">•</span> <span className="text-foreground">{data.percentage.toFixed(1)}%</span>
      </TypographyP>
    </div>
  );
}

/** Animated horizontal bar for category breakdown */
function CategoryBar({ item, index, isActive, onHover, onLeave }: {
  item: ChartDataItem;
  index: number;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const symbol = getCurrencySymbol(useUIStore.getState().selectedCurrency);

  return (
    <div
      className={`flex flex-col gap-1.5 cursor-pointer transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
          <TypographySpan className="text-[12px] font-semibold text-foreground/80 tracking-tight">{item.name}</TypographySpan>
        </div>
        <TypographySpan className="font-bold text-[12px] text-foreground tabular-money">
          <span className="currency-symbol text-muted-foreground/40">{symbol}</span>{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </TypographySpan>
      </div>
      <div className="w-full h-1 bg-surface-2/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-bar-fill relative"
          style={{
            width: `${item.percentage}%`,
            backgroundColor: item.color,
            animationDelay: `${0.3 + index * 0.1}s`,
            animationFillMode: 'both',
          }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SpendingChart() {
  const { transactions } = useTransactionStore();
  const { selectedMonth, selectedYear, selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const handleBarHover = useCallback((index: number) => setActiveIndex(index), []);
  const handleBarLeave = useCallback(() => setActiveIndex(null), []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <TypographyH2 className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
          Spending Analytics
        </TypographyH2>
      </div>

      <Card className="flex flex-col flex-1 p-5 rounded-xl shadow-sm border border-white/[0.04] bg-surface-1/40 backdrop-blur-2xl transition-all relative overflow-hidden">
        {/* Glow behind chart */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/8 rounded-full blur-[60px] pointer-events-none" />

        {chartData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-14 h-14 rounded-xl bg-surface-2/40 border border-white/[0.03] flex items-center justify-center mb-3 ring-1 ring-white/5">
              <BarChart3 className="w-5 h-5 text-muted-foreground/30" />
            </div>
            <TypographySpan className="text-sm font-semibold text-muted-foreground">No data available</TypographySpan>
            <TypographySpan className="text-xs text-muted-foreground/40 mt-1">Add expenses to see analytics</TypographySpan>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* Donut Chart */}
            <div className="relative h-[200px] flex-shrink-0 mt-2 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 72 : 82}
                    outerRadius={isMobile ? 76 : 86}
                    strokeWidth={0}
                    cornerRadius={8}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        className="outline-none transition-opacity duration-200"
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                        style={{ filter: activeIndex === index ? `drop-shadow(0px 0px 6px ${entry.color}60)` : undefined }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <TypographySpan className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mb-0.5">
                  Total Spent
                </TypographySpan>
                <TypographySpan className="text-2xl font-bold text-foreground tabular-money tracking-tighter leading-none">
                  <span className="currency-symbol text-lg text-muted-foreground/50">{symbol}</span>{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
            </div>

            {/* Category Bars (replaces legend + TopCategories) */}
            <div className="flex-1 pt-4 border-t border-white/[0.04] relative">
              <div className="space-y-3">
                {chartData.slice(0, 4).map((item, index) => (
                  <CategoryBar
                    key={item.name}
                    item={item}
                    index={index}
                    isActive={activeIndex === null || activeIndex === index}
                    onHover={() => handleBarHover(index)}
                    onLeave={handleBarLeave}
                  />
                ))}
              </div>
              {chartData.length > 4 && (
                <Link
                  href="/analytics"
                  className="mt-4 text-[10px] font-bold text-muted-foreground/50 hover:text-primary transition-colors w-full text-center py-2 rounded-lg bg-surface-2/20 hover:bg-surface-2/40 tracking-wider uppercase border border-white/[0.02] block"
                >
                  View All {chartData.length} Categories →
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
