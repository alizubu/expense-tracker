"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { MagicCard } from "@/components/magicui/magic-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DailyLineChart() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  const currentMonthTxns = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear() && t.type === "EXPENSE";
  });

  let cumulative = 0;
  const data = Array.from({ length: daysInMonth }).map((_, i) => {
    const day = i + 1;
    const dayTxns = currentMonthTxns.filter(t => new Date(t.date).getDate() === day);
    const daySpent = dayTxns.reduce((sum, t) => sum + t.amount, 0);
    cumulative += daySpent;
    
    // Only show data up to today if it's the current month
    if (day > now.getDate()) {
      return { day: day.toString(), spent: null, cumulative: null };
    }
    return { day: day.toString(), spent: daySpent, cumulative };
  });

  return (
    <MagicCard className="p-4 md:p-6 w-full h-[350px]">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Daily Spending</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(22, 22, 30, 0.8)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }}
              itemStyle={{ color: "#F8FAFC" }}
              labelFormatter={(label) => `Day ${label}`}
              formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, "Cumulative"]}
            />
            <Line type="monotone" dataKey="cumulative" stroke="#7C3AED" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#7C3AED" }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </MagicCard>
  );
}
