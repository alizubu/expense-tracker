"use client";

import { useBudgetStore } from "@/store/useBudgetStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function BudgetProgress() {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const { budgets } = useBudgetStore();

  // Top 3 budgets by utilization
  const topBudgets = [...budgets]
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {topBudgets.map((budget) => {
        const category = getCategoryById(budget.category);
        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
        const isOverBudget = budget.spent > budget.limit;
        const isWarning = percentage >= 80 && !isOverBudget;

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category?.color || "#64748B" }}
                />
                <span className="text-sm text-text-primary">{category?.label || budget.category}</span>
              </div>
              <span className="text-xs text-text-muted tabular-nums">
                {symbol} {budget.spent.toLocaleString()} / {symbol} {budget.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isOverBudget
                    ? "budget-progress-danger"
                    : isWarning
                    ? "budget-progress-warning"
                    : "budget-progress-safe"
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {isOverBudget && (
              <p className="text-[10px] font-medium text-expense animate-pulse">
                Over budget by {symbol} {(budget.spent - budget.limit).toLocaleString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
