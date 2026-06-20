"use client";

import { useMemo, useState } from "react";
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
    <div className="bg-[#1a1830] border border-[rgba(124,58,237,0.25)] rounded-[8px] px-[10px] py-[6px] text-[12px] shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="font-medium text-[#f1f5f9]">{data.name}</span>
      </div>
      <p className="text-[#94a3b8]">
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
    <div className="flex flex-col w-full h-full premium-card p-[16px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h2 className="text-[10px] font-medium text-[#475569] uppercase tracking-[0.08em]">
          Spending By Category
        </h2>
        <span className="text-[11px] text-[#64748b] cursor-pointer">
          This Month ▾
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-[40px] h-[40px] rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-2">
            <div className="w-[16px] h-[16px] border-2 border-[#1e293b] rounded-full" />
          </div>
          <span className="text-[12px] text-[#1e293b]">No data yet</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chart Area */}
          <div className="relative h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={66}
                  strokeWidth={2}
                  stroke="#0f0f1a"
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
              <span className="text-[9px] font-medium text-[#475569] uppercase tracking-widest mt-1">
                Spent
              </span>
              <span className="text-[16px] font-bold text-[#f1f5f9] font-mono tracking-tight leading-none">
                {symbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Legend Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar mt-4">
            <div className="grid grid-cols-2 gap-x-[16px] gap-y-[4px]">
              {chartData.slice(0, showAllLegend ? undefined : 6).map((item) => (
                <div key={item.name} className="flex items-center h-[22px]">
                  <span className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="ml-[6px] text-[11px] text-[#94a3b8] truncate flex-1">{item.name}</span>
                  <span className="ml-[4px] font-mono text-[11px] text-[#f1f5f9] flex-shrink-0 text-right">
                    {symbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
            {!showAllLegend && chartData.length > 6 && (
              <button 
                onClick={() => setShowAllLegend(true)}
                className="mt-[6px] text-[10px] text-[#7c3aed] hover:underline bg-transparent border-none outline-none"
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
