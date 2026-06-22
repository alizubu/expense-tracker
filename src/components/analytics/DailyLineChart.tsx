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
    <Card className="p-6 w-full h-[350px] flex flex-col justify-between rounded-2xl shadow-sm border border-white/[0.04] bg-surface-1 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Daily Spending</h3>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-full border border-white/[0.04]">
          Cumulative Trend
        </span>
      </div>
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "hsl(var(--surface-3))", 
                  borderColor: "hsl(var(--border))", 
                  borderRadius: "12px", 
                  color: "hsl(var(--foreground))",
                  fontSize: "12px",
                  fontWeight: 500
                }}
                itemStyle={{ color: "hsl(var(--foreground))", fontSize: "12px" }}
                labelFormatter={(label) => `Day ${label}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, "Cumulative"]}
              />
              <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--surface-1))", strokeWidth: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-muted-foreground mb-3 border border-white/[0.04]">
              <TrendingDown size={18} />
            </div>
            <span className="text-xs font-semibold text-foreground">No data yet</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Cumulative spending chart will show here</span>
          </div>
        )}
      </div>
    </Card>
  );
}
