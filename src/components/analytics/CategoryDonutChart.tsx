"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { PieChart } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { Card } from "@/components/ui/card";

const DONUT_COLORS = ["#7c3aed", "#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#ec4899", "#06b6d4"];

export function CategoryDonutChart() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const currentMonthTxns = transactions.filter(t => {
    const tDate = new Date(t.date);
    const now = new Date();
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear() && t.type === "EXPENSE";
  });

  const grouped = currentMonthTxns.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped)
    .map(([catId, amount]) => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
      return {
        name: cat?.label || catId,
        value: amount,
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalSpent = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-4 md:p-6 w-full h-[350px] flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-text-primary">
          Spending by Category
        </h3>
        <span className="text-[11px] text-text-muted bg-white/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-border/40">
          This Month
        </span>
      </div>

      <div className="flex-1 flex flex-row items-center justify-between gap-4 min-h-0 w-full">
        {data.length > 0 ? (
          <>
            {/* Chart Area */}
            <div className="relative h-[160px] w-[160px] flex-shrink-0 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data}
                    innerRadius="68%"
                    outerRadius="100%"
                    dataKey="value"
                    stroke="var(--bg-surface)"
                    strokeWidth={2}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-default)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    itemStyle={{ color: "var(--text-primary)", fontSize: "12px" }}
                    formatter={(value: any) => [`${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Amount"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase text-text-muted font-medium tracking-[0.05em] mb-0.5">Spent</span>
                <span className="text-base font-bold text-text-primary tracking-tight font-mono">
                  {symbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Legend Area */}
            <div className="flex-1 overflow-y-auto max-h-[180px] hide-scrollbar py-1">
              <div className="flex flex-col gap-2">
                {data.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-[11px] text-text-secondary truncate font-medium" title={item.name}>{item.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-text-primary font-mono flex-shrink-0">
                      {symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
                {data.length > 5 && (
                  <div className="text-right">
                    <span className="text-[9px] text-text-muted bg-white/[0.02] border border-border/40 px-1.5 py-0.5 rounded font-medium">
                      +{data.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full py-8">
            <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent mb-3 border border-accent/10">
              <PieChart size={18} />
            </div>
            <span className="text-xs font-semibold text-text-primary">No data yet</span>
            <span className="text-[10px] text-text-muted mt-0.5">Expenses will appear here</span>
          </div>
        )}
      </div>
    </Card>
  );
}
