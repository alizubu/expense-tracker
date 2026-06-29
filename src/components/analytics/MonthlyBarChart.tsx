"use client";
import { TypographyH3 } from "@/components/ui/typography";

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
    <Card className="p-6 w-full h-[350px] flex flex-col justify-between rounded-2xl shadow-sm border border-white/[0.04] bg-surface-1 transition-shadow hover:shadow-md">
      <TypographyH3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex-shrink-0">Monthly Overview</TypographyH3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
            <Tooltip
              cursor={{ fill: "hsl(var(--surface-2))", opacity: 0.5 }}
              contentStyle={{ backgroundColor: "hsl(var(--surface-3))", borderColor: "hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))", fontSize: "12px", fontWeight: 500 }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", opacity: 0.8 }} />
            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
