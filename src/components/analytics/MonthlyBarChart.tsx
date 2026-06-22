"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";
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
    <Card className="p-6 w-full h-[350px] flex flex-col justify-between rounded-2xl shadow-sm border border-white/[0.06] bg-card">
      <h3 className="text-sm font-semibold text-text-primary mb-4 flex-shrink-0">Monthly Overview</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
            <Tooltip
              cursor={{ fill: "var(--bg-hover)", opacity: 0.2 }}
              contentStyle={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)", borderRadius: "12px", color: "var(--text-primary)" }}
              itemStyle={{ color: "var(--text-primary)" }}
              formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Expense" fill="var(--red)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
