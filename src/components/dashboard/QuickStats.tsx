"use client";

import { Activity, ArrowDownCircle, AlertCircle, Tag, Layers } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Card } from "@/components/ui/card";
import { getCategoryColor } from "@/lib/categories";

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
  
  const topCategoryColor = topCategory && topCategory !== "-" ? getCategoryColor(topCategory) : "hsl(var(--primary))";

  const stats = [
    {
      id: "transactions",
      label: "Transactions",
      value: transactionsCount.toString(),
      icon: Activity,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
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
      iconColor: "",
      iconBg: "",
      isCurrency: false,
      isCapitalize: true,
      textColor: "",
      customStyle: { color: topCategoryColor },
      customBgStyle: { backgroundColor: `${topCategoryColor}1a` }, // 10% opacity hex
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
    <Card className="flex flex-col w-full h-auto md:h-full p-6 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1 transition-shadow hover:shadow-md">
      <h2 className="hidden md:flex text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex-shrink-0 h-[32px] items-center">
        Quick Stats
      </h2>

      <div className="flex flex-row overflow-x-auto hide-scrollbar gap-4 py-1 md:flex-col md:overflow-visible md:gap-3 md:py-0 md:flex-1 md:min-h-0 touch-pan-x">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="flex-shrink-0 w-[140px] h-[80px] rounded-xl p-4 flex flex-col justify-between border border-white/[0.04] bg-surface-2 md:bg-transparent md:border-transparent md:hover:border-white/[0.04] md:w-auto md:h-auto md:rounded-xl md:p-3 md:flex-row md:items-center hover:bg-surface-2 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 md:gap-4 md:flex-1">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${stat.iconBg}`}
                  style={stat.customBgStyle}
                >
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} style={stat.customStyle} />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground truncate font-medium group-hover:text-foreground transition-colors">
                  {stat.label}
                </span>
              </div>
              
              <div className="flex-shrink-0 text-left md:text-right md:w-28 mt-2 md:mt-0">
                <span 
                  className={`text-sm md:text-base font-semibold ${stat.isCurrency ? 'tabular-money' : ''} ${stat.isCapitalize ? 'capitalize' : ''} ${stat.textColor || 'text-foreground'}`}
                  style={stat.customStyle}
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
