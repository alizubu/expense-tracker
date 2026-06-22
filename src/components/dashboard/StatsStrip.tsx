"use client";

import { motion, Variants } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Card } from "@/components/ui/card";

interface StatsStripProps {
  netBalance: number;
  income: number;
  expenses: number;
  sparklineData?: { value: number }[];
}

export function StatsStrip({ netBalance, income, expenses, sparklineData }: StatsStripProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

  return (
    <>
      <Card className="col-span-2 md:col-span-2 xl:col-span-2 min-h-[140px] rounded-2xl p-6 flex flex-col justify-between border-white/[0.06] relative overflow-hidden bg-card shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] group">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center bg-card [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/20 transition-all duration-500 pointer-events-none"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Total Net Balance
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <div className="flex items-baseline gap-1 text-foreground">
              <span className="text-3xl font-bold">{symbol}</span>
              <span className="text-5xl font-bold tracking-tighter font-mono leading-none">
                {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary backdrop-blur-md border border-white/[0.05]">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-60 mix-blend-screen overflow-hidden rounded-b-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} filter="url(#glow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="col-span-1 md:col-span-1 xl:col-span-1 min-h-[140px] rounded-2xl p-6 flex flex-col justify-between border-white/[0.06] bg-card shadow-sm hover:shadow-md transition-all">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
          <div className="flex items-baseline gap-1 text-emerald-500">
            <span className="text-xl font-bold">{symbol}</span>
            <span className="text-2xl font-bold font-mono tracking-tight leading-none">
              {income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
            <TrendingUp className="h-3 w-3" />
            <span className="font-medium">This month</span>
          </div>
        </div>
      </Card>

      <Card className="col-span-1 md:col-span-1 xl:col-span-1 min-h-[140px] rounded-2xl p-6 flex flex-col justify-between border-white/[0.06] bg-card shadow-sm hover:shadow-md transition-all">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
          <div className="flex items-baseline gap-1 text-destructive">
            <span className="text-xl font-bold">{symbol}</span>
            <span className="text-2xl font-bold font-mono tracking-tight leading-none">
              {expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-md">
            <TrendingDown className="h-3 w-3" />
            <span className="font-medium">This month</span>
          </div>
        </div>
      </Card>
    </>
  );
}
