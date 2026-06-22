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
      <Card className="col-span-2 md:col-span-2 xl:col-span-2 min-h-[140px] rounded-xl p-6 flex flex-col justify-between border-border relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Total Net Balance
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <div className="flex items-baseline gap-1 text-foreground">
              <span className="text-3xl font-bold">{symbol}</span>
              <span className="text-5xl font-bold tracking-tighter font-mono">
                {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-50">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="col-span-1 md:col-span-1 xl:col-span-1 min-h-[140px] rounded-xl p-5 flex flex-col justify-between border-border bg-background shadow-sm hover:shadow-md transition-all">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
          <div className="flex items-baseline gap-1 text-emerald-500">
            <span className="text-xl font-bold">{symbol}</span>
            <span className="text-2xl font-bold font-mono tracking-tight">
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

      <Card className="col-span-1 md:col-span-1 xl:col-span-1 min-h-[140px] rounded-xl p-5 flex flex-col justify-between border-border bg-background shadow-sm hover:shadow-md transition-all">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
          <div className="flex items-baseline gap-1 text-destructive">
            <span className="text-xl font-bold">{symbol}</span>
            <span className="text-2xl font-bold font-mono tracking-tight">
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
