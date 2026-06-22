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
import { motion } from "framer-motion";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const colorOrder = [
  "var(--accent-brass)", "var(--accent-teal)", "var(--accent-clay)", "var(--accent-violet)", 
  "var(--accent-dim)", "var(--text-muted)", "var(--bg-raised)"
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const symbol = getCurrencySymbol(useUIStore.getState().selectedCurrency);

  return (
    <div className="bg-[var(--bg-raised)] border border-[var(--border-hair)] rounded-[8px] px-[12px] py-[8px] text-[12px] shadow-lg">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-ui text-[var(--text-muted)]">{data.name}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-medium text-[var(--text-primary)] font-mono">
            {symbol}{data.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
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
    <div className="flex flex-col w-full h-auto lg:h-full bg-[var(--bg-surface)] p-[16px] overflow-visible lg:overflow-hidden rounded-[16px] border border-[var(--border-hair)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h2 className="text-[11px] font-ui text-[var(--text-muted)] uppercase tracking-[0.08em]">
          SPENDING BY CATEGORY
        </h2>
        <span className="text-[12px] font-ui text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          This Month ▾
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-[40px] h-[40px] rounded-full bg-[var(--bg-raised)] flex items-center justify-center mb-2">
            <div className="w-[16px] h-[16px] border-2 border-[var(--text-muted)] rounded-full" />
          </div>
          <span className="text-[12px] text-[var(--text-muted)] font-ui">No data yet</span>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Chart Area - 50% Open Ring */}
          <div className="relative h-[160px] flex-shrink-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="100%" /* Shifted down for half circle */
                  innerRadius={110}
                  outerRadius={140}
                  paddingAngle={2}
                  stroke="none"
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1000}
                  startAngle={180}
                  endAngle={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-end pointer-events-none"
            >
              <span className="text-[10px] font-ui text-[var(--text-muted)] uppercase tracking-widest">
                TOTAL SPENT
              </span>
              <span className="text-[24px] font-medium text-[var(--text-primary)] font-mono tracking-tight leading-none mt-1">
                {symbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </motion.div>
          </div>

          {/* Legend Area */}
          <div className="overflow-visible flex-1 overflow-y-auto hide-scrollbar mt-6 border-t border-[var(--border-hair)] pt-4">
            <div className="grid grid-cols-1 gap-y-2">
              {chartData.slice(0, showAllLegend ? undefined : 4).map((item) => (
                <div key={item.name} className="flex justify-between items-center group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[13px] font-ui text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{item.name}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{item.percentage.toFixed(1)}%</span>
                    <span className="font-mono text-[13px] text-[var(--text-primary)] font-medium">
                      {symbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!showAllLegend && chartData.length > 4 && (
              <button 
                onClick={() => setShowAllLegend(true)}
                className="mt-3 text-[11px] font-ui text-[var(--text-muted)] hover:text-[var(--accent-brass)] bg-transparent border-none outline-none cursor-pointer w-full text-center py-1 transition-colors"
              >
                Show All Categories
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
