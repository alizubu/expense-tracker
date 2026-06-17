"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { MagicCard } from "@/components/magicui/magic-card";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import * as LucideIcons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

export default function TopCategories() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const now = new Date();
  const currentMonthTxns = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear() && t.type === "EXPENSE";
  });

  const totalSpent = currentMonthTxns.reduce((sum, t) => sum + t.amount, 0);

  const grouped = currentMonthTxns.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped)
    .map(([catId, amount]) => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.label || catId,
        icon: cat?.icon || "CircleDot",
        amount,
        color: cat?.color || "#94A3B8",
        percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <MagicCard className="p-4 md:p-6 w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Top Spending Categories</h3>
      <div className="space-y-4 flex-1">
        {data.map((cat) => {
          const Icon = getIcon(cat.icon);
          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: cat.color + "20" }}>
                    <Icon className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold tabular-nums text-text-primary">{symbol}{cat.amount.toLocaleString()}</span>
                  <span className="text-xs text-text-muted">{cat.percent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.percent}%`, backgroundColor: cat.color }} />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-sm text-text-muted text-center pt-8">No expenses this month</p>
        )}
      </div>
    </MagicCard>
  );
}
