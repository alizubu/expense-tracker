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
    <div className="bg-[rgba(14,14,28,0.96)] border border-[rgba(124,58,237,0.2)] rounded-[10px] px-[12px] py-[8px] text-[12px] shadow-lg backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[#94a3b8]">{data.name}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-[#f1f5f9] font-amount">
            {symbol}{data.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-[#475569]">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";

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
    <div className="flex flex-col w-full h-auto lg:h-full premium-card p-[16px] overflow-visible lg:overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.055)] bg-[linear-gradient(145deg,#0f0f1e_0%,#0c0c18_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)] transition-all duration-200 card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 h-[32px]">
        <h2 className="text-[10px] font-medium text-[#334155] uppercase tracking-[0.10em]">
          SPENDING BY CATEGORY
        </h2>
        <span className="text-[12px] text-[#475569] cursor-pointer hover:text-[#94a3b8] transition-colors">
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
        <div className="flex flex-col flex-1 min-h-0">
          {/* Chart Area */}
          <div className="relative h-[150px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="none"
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1000}
                  startAngle={90}
                  endAngle={450}
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
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <span className="text-[9px] font-medium text-[#334155] uppercase tracking-widest mt-1">
                SPENT
              </span>
              <span className="text-[15px] font-bold text-[#f1f5f9] font-amount tracking-tight leading-none mt-[2px]">
                {symbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </motion.div>
          </div>

          {/* Legend Area */}
          <div className="overflow-visible flex-1 overflow-y-auto hide-scrollbar mt-2">
            <div className="grid grid-cols-2 gap-x-[12px] gap-y-[3px]">
              {chartData.slice(0, showAllLegend ? undefined : 6).map((item) => (
                <div key={item.name} className="flex items-center h-[22px] gap-[7px]">
                  <span className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[11px] text-[#94a3b8] truncate flex-1">{item.name}</span>
                  <span className="font-amount text-[11px] text-[#f1f5f9] flex-shrink-0 text-right">
                    {symbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
            {!showAllLegend && chartData.length > 6 && (
              <button 
                onClick={() => setShowAllLegend(true)}
                className="mt-[6px] text-[10px] text-[#7c3aed] hover:underline bg-transparent border-none outline-none cursor-pointer"
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
