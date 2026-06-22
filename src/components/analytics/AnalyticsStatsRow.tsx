"use client";

import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { BlurFade } from "@/components/magicui/blur-fade";
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
      colorClass: "text-expense",
      borderColorClass: "border-l-expense",
      icon: TrendingDown,
      iconClass: "text-expense bg-expense/10",
      decimalPlaces: 2,
    },
    {
      label: "Income This Month",
      value: totalIncome,
      colorClass: "text-income",
      borderColorClass: "border-l-income",
      icon: TrendingUp,
      iconClass: "text-income bg-income/10",
      decimalPlaces: 2,
    },
    {
      label: "Avg Daily Spend",
      value: avgDaily,
      colorClass: "text-text-primary",
      borderColorClass: "border-l-brand-purple",
      icon: Clock,
      iconClass: "text-brand-purple bg-brand-purple/10",
      decimalPlaces: 2,
    },
    {
      label: "Savings Rate",
      value: Math.max(0, savingsRate),
      colorClass: "text-brand-purple-light",
      borderColorClass: "border-l-transfer",
      icon: Scale,
      iconClass: "text-transfer bg-transfer/10",
      decimalPlaces: 1,
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <BlurFade key={stat.label} delay={0.05 * (idx + 1)}>
            <Card className={`p-4 md:p-5 flex flex-col justify-between border-l-[3.5px] ${stat.borderColorClass} bg-card hover:shadow-md transition-all duration-200 h-full`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.iconClass}`}>
                  <Icon size={12} />
                </div>
              </div>
              <div className={`text-xl md:text-2xl font-bold tracking-tight ${stat.colorClass} flex items-baseline gap-1 font-mono`}>
                {!stat.isPercentage && <span className="text-sm md:text-base font-semibold">{symbol}</span>}
                <NumberTicker value={stat.value} decimalPlaces={stat.decimalPlaces} />
                {stat.isPercentage && <span className="text-sm md:text-base font-semibold">%</span>}
              </div>
            </Card>
          </BlurFade>
        );
      })}
    </div>
  );
}
