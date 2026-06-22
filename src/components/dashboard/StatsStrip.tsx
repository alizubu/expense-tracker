"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, BarChart2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip } from "recharts";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsStripProps {
  netBalance: number;
  income: number;
  expenses: number;
  sparklineData?: { value: number }[];
}

export function StatsStrip({ netBalance, income, expenses, sparklineData }: StatsStripProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  return (
    <>
      <Card className="col-span-2 md:col-span-2 xl:col-span-2 min-h-[160px] rounded-2xl p-6 flex flex-col justify-between border-white/[0.04] bg-surface-1 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10 mb-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Total Net Balance
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </h3>
            <div className="flex items-baseline gap-1 text-foreground">
              <span className="text-3xl font-medium text-muted-foreground">{symbol}</span>
              <span className="text-5xl font-semibold tracking-tighter tabular-money leading-none">
                {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setChartType(prev => prev === "area" ? "bar" : "area")}
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              chartType === "area" 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                : "bg-surface-2 text-muted-foreground hover:text-foreground border border-white/[0.04]"
            )}
          >
            {chartType === "area" ? <Activity className="h-5 w-5" /> : <BarChart2 className="h-5 w-5" />}
          </button>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-80 mix-blend-screen overflow-hidden rounded-b-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" opacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--surface-3))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600, fontFamily: 'monospace' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorNet)" 
                  strokeWidth={2} 
                  animationDuration={1500}
                  animationEasing="ease-out"
                  activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--surface-1))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="col-span-1 md:col-span-1 xl:col-span-1 min-h-[160px] rounded-2xl p-6 flex flex-col justify-between border-white/[0.04] bg-surface-1 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Income</h3>
          <div className="flex items-baseline gap-1 text-emerald-500">
            <span className="text-xl font-medium opacity-80">{symbol}</span>
            <span className="text-3xl font-semibold tabular-money leading-none">
              {income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>This month</span>
          </div>
        </div>
      </Card>

      <Card className="col-span-1 md:col-span-1 xl:col-span-1 min-h-[160px] rounded-2xl p-6 flex flex-col justify-between border-white/[0.04] bg-surface-1 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Expenses</h3>
          <div className="flex items-baseline gap-1 text-destructive">
            <span className="text-xl font-medium opacity-80">{symbol}</span>
            <span className="text-3xl font-semibold tabular-money leading-none">
              {expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-2.5 py-1 rounded-full text-xs font-semibold">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>This month</span>
          </div>
        </div>
      </Card>
    </>
  );
}
