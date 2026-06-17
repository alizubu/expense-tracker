"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { MagicCard } from "@/components/magicui/magic-card";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function CategoryDonutChart() {
  const { transactions } = useTransactionStore();

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
        color: cat?.color || "#94A3B8"
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <MagicCard className="p-4 md:p-6 w-full h-[350px]">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(22, 22, 30, 0.8)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }}
            itemStyle={{ color: "#F8FAFC" }}
            formatter={(value: any) => [`$${value.toLocaleString()}`, "Amount"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </MagicCard>
  );
}
