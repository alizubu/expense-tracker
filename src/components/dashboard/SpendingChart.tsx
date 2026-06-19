"use client";

import { useMemo } from "react";
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

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="glass-tooltip px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="text-sm font-medium text-text-primary">{data.name}</span>
      </div>
      <p className="text-xs text-text-secondary">
        {useUIStore.getState().selectedCurrency === "BDT" ? "৳" : "$"}{" "}
        {data.value.toLocaleString("en-US")} ({data.percentage.toFixed(1)}%)
      </p>
    </div>
  );
}

export function SpendingChart() {
  const { transactions } = useTransactionStore();
  const { selectedMonth, selectedYear, selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const chartData = useMemo(() => {
    // Filter this month's expenses
    const monthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        d.getMonth() + 1 === selectedMonth &&
        d.getFullYear() === selectedYear
      );
    });

    // Group by category
    const categoryMap = new Map<string, number>();
    monthExpenses.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    const total = Array.from(categoryMap.values()).reduce((s, v) => s + v, 0);

    // Sort by amount and take top 8
    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return sorted.map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      return {
        name: category?.label || categoryId,
        value: amount,
        color: category?.color || "#64748B",
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });
  }, [transactions, selectedMonth, selectedYear]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No expense data this month
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-col">
        {chartData.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center gap-2 py-[6px] border-b border-[var(--border-subtle)] last:border-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="flex-1 text-[13px] text-[var(--text-secondary)]">{item.name}</span>
            <span className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">
              {symbol} {item.value.toLocaleString("en-US")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
