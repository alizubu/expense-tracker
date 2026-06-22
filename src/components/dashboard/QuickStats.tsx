"use client";

import { Activity, ArrowDownCircle, AlertCircle, Tag, Layers } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Card } from "@/components/ui/card";

interface QuickStatsProps {
  transactionsCount: number;
  avgDailySpend: number;
  largestExpense: number;
  topCategory: string;
  profilesCount: number;
}

export function QuickStats({
  transactionsCount,
  avgDailySpend,
  largestExpense,
  topCategory,
  profilesCount,
}: QuickStatsProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const stats = [
    {
      id: "transactions",
      label: "Transactions",
      value: transactionsCount.toString(),
      icon: Activity,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
      isCurrency: false,
    },
    {
      id: "avgDailySpend",
      label: "Avg Daily Spend",
      value: `${symbol}${avgDailySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: ArrowDownCircle,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      isCurrency: true,
    },
    {
      id: "largestExpense",
      label: "Largest Expense",
      value: `${symbol}${largestExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: AlertCircle,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      isCurrency: true,
    },
    {
      id: "topCategory",
      label: "Top Category",
      value: topCategory,
      icon: Tag,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      isCurrency: false,
      isCapitalize: true,
      textColor: "text-emerald-500",
    },
    {
      id: "activeProfiles",
      label: "Active Profiles",
      value: profilesCount.toString(),
      icon: Layers,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      isCurrency: false,
    },
  ];

  return (
    <Card className="flex flex-col w-full h-auto md:h-full p-4 rounded-xl shadow-sm border-border">
      <h2 className="hidden md:flex text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex-shrink-0 h-[32px] items-center">
        Quick Stats
      </h2>

      <div className="flex flex-row overflow-x-auto hide-scrollbar gap-2 py-1 md:flex-col md:overflow-visible md:gap-2 md:py-0 md:flex-1 md:min-h-0 touch-pan-x">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="flex-shrink-0 w-[130px] h-[72px] rounded-lg p-3 flex flex-col justify-between border border-border/50 bg-background/50 md:bg-transparent md:border-0 md:w-auto md:h-auto md:rounded-none md:p-2 md:flex-row md:items-center hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 md:gap-3 md:flex-1">
                <div 
                  className={`flex items-center justify-center w-6 h-6 rounded-md md:w-8 md:h-8 md:rounded-lg flex-shrink-0 ${stat.iconBg}`}
                >
                  <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${stat.iconColor}`} />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground truncate font-medium">
                  {stat.label}
                </span>
              </div>
              
              <div className="flex-shrink-0 text-left md:text-right md:w-24">
                <span 
                  className={`text-sm md:text-base font-bold ${stat.isCurrency ? 'font-mono' : ''} ${stat.isCapitalize ? 'capitalize' : ''} ${stat.textColor || 'text-foreground'}`}
                >
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
