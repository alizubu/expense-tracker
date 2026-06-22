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
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const colorOrder = [
  "#7c3aed", "#10b981", "#f43f5e", "#3b82f6", 
  "#f59e0b", "#ec4899", "#06b6d4", "#84cc16"
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const symbol = getCurrencySymbol(useUIStore.getState().selectedCurrency);

  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="font-semibold text-text-primary">{data.name}</span>
      </div>
      <p className="text-text-secondary">
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

    return sorted.map(([categoryId, amount], index) => {
      const category = getCategoryById(categoryId);
      return {
        name: category?.label || categoryId,
        value: amount,
        color: colorOrder[index % colorOrder.length],
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col w-full h-auto sm:h-full border border-border bg-card shadow-sm p-4 rounded-2xl overflow-visible sm:overflow-hidden hover:border-accent/10 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h2 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.08em]">
          Spending By Category
        </h2>
        <span className="text-[11px] font-semibold text-text-muted cursor-pointer select-none">
          This Month ▾
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="w-[40px] h-[40px] rounded-xl bg-card-elevated flex items-center justify-center mb-2">
            <div className="w-[16px] h-[16px] border border-border rounded-full animate-pulse" />
          </div>
          <span className="text-xs text-text-muted">No data yet</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-1 min-h-0">
          {/* Chart Area */}
          <div className="relative h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 54 : 48}
                  outerRadius={isMobile ? 72 : 66}
                  strokeWidth={2}
                  stroke="currentColor"
                  className="text-card"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-widest mt-1">
                Spent
              </span>
              <span className="text-[16px] font-bold text-text-primary font-mono tracking-tight leading-none">
                {symbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Legend Area */}
          <div className="overflow-visible sm:flex-1 sm:overflow-y-auto hide-scrollbar mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[16px] gap-y-[4px]">
              {chartData.slice(0, showAllLegend ? undefined : 6).map((item) => (
                <div key={item.name} className="flex items-center h-[22px]">
                  <span className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="ml-[6px] text-[11px] text-text-secondary truncate flex-1">{item.name}</span>
                  <span className="ml-[4px] font-mono font-bold text-[11px] text-text-primary flex-shrink-0 text-right">
                    {symbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
            {!showAllLegend && chartData.length > 6 && (
              <button 
                onClick={() => setShowAllLegend(true)}
                className="mt-[6px] text-[10px] font-semibold text-accent hover:text-brand-purple-light hover:underline bg-transparent border-none outline-none cursor-pointer"
              >
                +{chartData.length - 6} more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
