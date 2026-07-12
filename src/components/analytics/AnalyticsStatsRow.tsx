"use client";
import { TypographySpan } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { TrendingUp, TrendingDown, Clock, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsStatsRow() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const now = new Date();
  const currentMonthTxns = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthTxns.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const totalIncome = currentMonthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  
  const daysPassed = now.getDate();
  const avgDaily = daysPassed > 0 ? totalSpent / daysPassed : 0;
  
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

  const stats = [
    {
      label: "Spent This Month",
      value: totalSpent,
      colorClass: "text-foreground",
      glowClass: "bg-destructive/20",
      icon: TrendingDown,
      iconClass: "text-destructive shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]",
      decimalPlaces: 0,
    },
    {
      label: "Income This Month",
      value: totalIncome,
      colorClass: "text-foreground",
      glowClass: "bg-emerald-500/20",
      icon: TrendingUp,
      iconClass: "text-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]",
      decimalPlaces: 0,
    },
    {
      label: "Avg Daily Spend",
      value: avgDaily,
      colorClass: "text-foreground",
      glowClass: "bg-primary/20",
      icon: Clock,
      iconClass: "text-primary shadow-[inset_0_0_10px_rgba(var(--primary),0.3)]",
      decimalPlaces: 0,
    },
    {
      label: "Savings Rate",
      value: Math.max(0, savingsRate),
      colorClass: "text-foreground",
      glowClass: "bg-slate-500/20",
      icon: Scale,
      iconClass: "text-slate-400 shadow-[inset_0_0_10px_rgba(148,163,184,0.2)]",
      decimalPlaces: 1,
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 * idx, ease: [0.23, 1, 0.32, 1] }}>
            <div className="p-5 flex flex-col justify-between bg-surface-1/40 backdrop-blur-2xl border border-white/[0.04] shadow-sm hover:border-white/[0.08] transition-colors duration-500 h-[140px] rounded-[24px] relative overflow-hidden group">
              {/* Subtle Ambient Glow */}
              <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] pointer-events-none transition-transform duration-700 group-hover:scale-150", stat.glowClass)} />
              
              <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                <TypographySpan className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80">
                  {stat.label}
                </TypographySpan>
                <div className={cn("w-8 h-8 rounded-[12px] flex items-center justify-center bg-surface-2/50 backdrop-blur-md border border-white/[0.02]", stat.iconClass)}>
                  <Icon size={14} />
                </div>
              </div>
              <div className={cn("text-2xl md:text-3xl font-bold tracking-tighter flex items-baseline gap-1 tabular-money relative z-10", stat.colorClass)}>
                {!stat.isPercentage && <TypographySpan className="text-base font-medium text-muted-foreground/70">{symbol}</TypographySpan>}
                <TypographySpan className="leading-none drop-shadow-sm">{stat.value.toLocaleString(undefined, { minimumFractionDigits: stat.decimalPlaces, maximumFractionDigits: stat.decimalPlaces })}</TypographySpan>
                {stat.isPercentage && <TypographySpan className="text-base font-medium text-muted-foreground/70">%</TypographySpan>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
