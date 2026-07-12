"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
    
    if (day > now.getDate()) {
      return { day: day.toString(), spent: null, cumulative: null };
    }
    return { day: day.toString(), spent: daySpent, cumulative };
  });

  const hasData = currentMonthTxns.length > 0;

  return (
    <Card className="p-5 md:p-6 w-full h-[400px] flex flex-col justify-between border-white/[0.04] bg-surface-1/40 backdrop-blur-2xl rounded-[24px] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(var(--primary),0.05)] transition-shadow duration-500">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

      <div className="flex items-center justify-between mb-6 flex-shrink-0 relative z-10">
        <TypographyH3 className="text-[14px] font-bold text-foreground tracking-tight">Daily Spending Trend</TypographyH3>
        <TypographySpan className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80 bg-surface-2/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.05]">
          Cumulative
        </TypographySpan>
      </div>
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative z-10 -ml-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.15} vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${symbol}${val}`} 
                dx={-10}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "rgba(var(--surface-2), 0.9)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(255, 255, 255, 0.08)", 
                  borderRadius: "16px", 
                  color: "hsl(var(--foreground))",
                  fontSize: "13px",
                  fontWeight: 600,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}
                itemStyle={{ color: "hsl(var(--foreground))", fontSize: "14px", fontWeight: "bold" }}
                labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                labelFormatter={(label) => `Day ${label}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${symbol}${value.toLocaleString()}`, "Cumulative"]}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCumulative)" 
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--surface-1))", strokeWidth: 2 }} 
                connectNulls 
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 w-full ml-4">
            <div className="w-16 h-16 rounded-[20px] bg-surface-2/40 border border-white/[0.03] flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
              <TrendingDown className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <TypographySpan className="text-sm font-bold text-foreground tracking-tight">No data yet</TypographySpan>
            <TypographySpan className="text-[11px] font-medium text-muted-foreground/60 mt-1">Cumulative spending chart will show here</TypographySpan>
          </div>
        )}
      </div>
    </Card>
  );
}
