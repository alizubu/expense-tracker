"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Card } from "@/components/ui/card";

interface StatsStripProps {
  netBalance: number;
  income: number;
  expenses: number;
  sparklineData?: { value: number }[];
}

export function StatsStrip({ netBalance, income, expenses }: StatsStripProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  return (
    <>
      {/* Total Balance Card */}
      <Card className="p-6 rounded-[24px] border border-white/[0.03] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group hover:bg-surface-1/50 transition-all duration-500 flex flex-col justify-between min-h-[160px]">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
          <div className="flex items-center justify-between">
            <TypographyH3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
              Net Worth
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></span>
            </TypographyH3>
            <div className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline gap-1 text-foreground">
              <TypographySpan className="text-2xl font-medium text-muted-foreground/60">{symbol}</TypographySpan>
              <TypographySpan className="text-4xl lg:text-5xl font-bold tracking-tighter tabular-money">
                {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TypographySpan>
            </div>
          </div>
        </div>
      </Card>

      {/* Income Card */}
      <Card className="p-6 rounded-[24px] border border-white/[0.03] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group hover:bg-surface-1/50 transition-all duration-500 flex flex-col justify-between min-h-[160px]">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
          <div className="flex items-center justify-between">
            <TypographyH3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
              Total Income
            </TypographyH3>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 ring-1 ring-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline gap-1 text-emerald-500">
              <TypographySpan className="text-xl font-medium opacity-60">{symbol}</TypographySpan>
              <TypographySpan className="text-3xl lg:text-4xl font-bold tracking-tighter tabular-money">
                {income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TypographySpan>
            </div>
            <TypographySpan className="text-xs text-muted-foreground/60 font-medium mt-1 block">This month</TypographySpan>
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 rounded-[24px] border border-white/[0.03] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group hover:bg-surface-1/50 transition-all duration-500 flex flex-col justify-between min-h-[160px]">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
          <div className="flex items-center justify-between">
            <TypographyH3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
              Total Expenses
            </TypographyH3>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 ring-1 ring-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline gap-1 text-rose-500">
              <TypographySpan className="text-xl font-medium opacity-60">{symbol}</TypographySpan>
              <TypographySpan className="text-3xl lg:text-4xl font-bold tracking-tighter tabular-money">
                {expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TypographySpan>
            </div>
            <TypographySpan className="text-xs text-muted-foreground/60 font-medium mt-1 block">This month</TypographySpan>
          </div>
        </div>
      </Card>
    </>
  );
}
