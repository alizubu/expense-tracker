"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { ChevronDown } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

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
    <div className="flex flex-col w-full h-full bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[16px] py-5 px-6 hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium text-[#475569] uppercase tracking-[0.08em]">
          Spending by Category
        </h2>
        <button className="flex items-center gap-1 text-[12px] text-[#94a3b8] hover:text-[#f8fafc] bg-transparent border-none outline-none transition-colors">
          This Month <ChevronDown size={12} />
        </button>
      </div>

      <div className="relative h-[160px] w-full flex justify-center items-center">
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={55}
                  outerRadius={75}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1b2e", borderColor: "rgba(139,92,246,0.3)", borderRadius: "8px", padding: "8px 12px", color: "#f8fafc", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "#f8fafc", fontSize: "12px" }}
                  formatter={(value: any) => [`${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase text-[#475569] font-medium tracking-[0.05em] mb-0.5">Spent</span>
              <span className="text-[18px] font-bold text-[#f8fafc]">{symbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="h-[40px] w-[40px] flex items-center justify-center text-[#1e293b] mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <span className="text-[13px] text-[#334155]">No data yet</span>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {data.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span className="text-[11px] text-[#94a3b8] truncate max-w-[80px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-[11px] font-bold text-[#f8fafc]">{symbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
          {data.length > 6 && (
            <div className="mt-2 text-center">
              <button className="text-[11px] text-[#7c3aed] hover:text-[#a78bfa] transition-colors">+{data.length - 6} more</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
