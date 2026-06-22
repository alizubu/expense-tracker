"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { TrendingUp, TrendingDown, Clock, Scale } from "lucide-react";

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
      colorClass: "text-destructive",
      borderColorClass: "border-l-destructive",
      icon: TrendingDown,
      iconClass: "text-destructive bg-destructive/10",
      decimalPlaces: 2,
    },
    {
      label: "Income This Month",
      value: totalIncome,
      colorClass: "text-emerald-500",
      borderColorClass: "border-l-emerald-500",
      icon: TrendingUp,
      iconClass: "text-emerald-500 bg-emerald-500/10",
      decimalPlaces: 2,
    },
    {
      label: "Avg Daily Spend",
      value: avgDaily,
      colorClass: "text-foreground",
      borderColorClass: "border-l-primary",
      icon: Clock,
      iconClass: "text-primary bg-primary/10",
      decimalPlaces: 2,
    },
    {
      label: "Savings Rate",
      value: Math.max(0, savingsRate),
      colorClass: "text-primary",
      borderColorClass: "border-l-slate-500",
      icon: Scale,
      iconClass: "text-slate-500 bg-slate-500/10",
      decimalPlaces: 1,
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * (idx + 1) }}>
            <Card className={`p-5 flex flex-col justify-between border-l-4 ${stat.borderColorClass} bg-card hover:shadow-sm transition-all duration-200 h-full`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.iconClass}`}>
                  <Icon size={14} />
                </div>
              </div>
              <div className={`text-2xl md:text-3xl font-bold tracking-tight ${stat.colorClass} flex items-baseline gap-1 font-mono`}>
                {!stat.isPercentage && <span className="text-base font-semibold">{symbol}</span>}
                <span>{stat.value.toLocaleString(undefined, { minimumFractionDigits: stat.decimalPlaces, maximumFractionDigits: stat.decimalPlaces })}</span>
                {stat.isPercentage && <span className="text-base font-semibold">%</span>}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
