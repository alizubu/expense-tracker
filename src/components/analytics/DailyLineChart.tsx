"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";

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

  const hasData = currentMonthTxns.length > 0;

  return (
    <Card className="p-6 w-full h-[350px] flex flex-col justify-between rounded-2xl shadow-sm border border-white/[0.06] bg-card hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-text-primary">Daily Spending</h3>
        <span className="text-[11px] text-text-muted bg-white/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-border/40">
          Cumulative Trend
        </span>
      </div>
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "var(--bg-surface)", 
                  borderColor: "var(--border-default)", 
                  borderRadius: "12px", 
                  color: "var(--text-primary)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "var(--text-primary)", fontSize: "12px" }}
                labelFormatter={(label) => `Day ${label}`}
                formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, "Cumulative"]}
              />
              <Line type="monotone" dataKey="cumulative" stroke="var(--brand-purple)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "var(--brand-purple)" }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent mb-3 border border-accent/10">
              <TrendingDown size={18} />
            </div>
            <span className="text-xs font-semibold text-text-primary">No data yet</span>
            <span className="text-[10px] text-text-muted mt-0.5">Cumulative spending chart will show here</span>
          </div>
        )}
      </div>
    </Card>
  );
}
