"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { MagicCard } from "@/components/magicui/magic-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function MonthlyBarChart() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  // Process data for the last 6 months
  const data = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthTxns = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
    });

    const income = monthTxns.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxns.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

    return {
      name: d.toLocaleDateString("en-US", { month: "short" }),
      Income: income,
      Expense: expense,
    };
  }).reverse();

  return (
    <MagicCard className="p-4 md:p-6 w-full h-[350px]">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Overview</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ backgroundColor: "rgba(22, 22, 30, 0.8)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }}
              itemStyle={{ color: "#F8FAFC" }}
              formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </MagicCard>
  );
}
