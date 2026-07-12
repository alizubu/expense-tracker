"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";
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
    <Card className="p-5 md:p-6 w-full h-[400px] flex flex-col justify-between border-white/[0.04] bg-surface-1/40 backdrop-blur-2xl rounded-[24px] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(var(--primary),0.05)] transition-shadow duration-500">
      {/* Ambient Glow */}
      <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-1000" />
      <div className="absolute -top-10 right-10 w-[200px] h-[200px] bg-destructive/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-destructive/10 transition-colors duration-1000" />

      <div className="flex items-center justify-between mb-6 flex-shrink-0 relative z-10">
        <TypographyH3 className="text-[14px] font-bold text-foreground tracking-tight">Monthly Overview</TypographyH3>
        <TypographySpan className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80 bg-surface-2/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.05]">
          Last 6 Months
        </TypographySpan>
      </div>

      <div className="flex-1 min-h-0 w-full relative z-10 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
              </linearGradient>
              <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.15} vertical={false} />
            <XAxis 
              dataKey="name" 
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
              tickFormatter={(val) => `${symbol}${val > 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
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
              labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "6px" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: string) => [
                <span key="val" className={name === "Income" ? "text-emerald-500" : "text-destructive"}>
                  {symbol}{value.toLocaleString()}
                </span>,
                <span key="name" className="text-muted-foreground ml-1">{name}</span>
              ]}
            />
            <Legend 
              wrapperStyle={{ fontSize: "11px", paddingTop: "15px", fontWeight: "bold" }}
              iconType="circle"
              iconSize={8}
            />
            <Bar 
              dataKey="Income" 
              fill="url(#colorIncome)" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={32}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="Expense" 
              fill="url(#colorExpense)" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={32}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
