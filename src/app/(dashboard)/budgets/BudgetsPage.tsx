"use client";

import { useState } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import SetBudgetModal from "@/components/budgets/SetBudgetModal";
import * as LucideIcons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

export default function BudgetsPage() {
  const { budgets, deleteBudget } = useBudgetStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <BlurFade delay={0}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-heading">Budgets</h1>
            <p className="text-sm text-text-muted mt-1">Manage your spending limits.</p>
          </div>
          <ShimmerButton onClick={() => setIsModalOpen(true)}>
            + Set Budget
          </ShimmerButton>
        </div>
      </BlurFade>

      {budgets.length === 0 ? (
        <BlurFade delay={0.1}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] p-12 text-center">
            <LucideIcons.Target className="h-12 w-12 text-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Budgets Set</h3>
            <p className="text-sm text-text-muted max-w-sm mb-6">Create your first budget to start tracking your spending limits by category.</p>
            <ShimmerButton onClick={() => setIsModalOpen(true)}>Create Budget</ShimmerButton>
          </div>
        </BlurFade>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {budgets.map((budget, idx) => {
            const category = getCategoryById(budget.category);
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const isOverBudget = budget.spent > budget.limit;
            const isWarning = percentage >= 80 && !isOverBudget;
            const Icon = getIcon(category?.icon || "CircleDot");
            const color = category?.color || "#94A3B8";

            return (
              <BlurFade key={budget.id} delay={0.1 + idx * 0.05}>
                <MagicCard className={cn("p-5 relative overflow-hidden transition-all", isOverBudget ? "ring-1 ring-expense/50" : "")}>
                  {isOverBudget && (
                    <div className="absolute top-0 right-0 bg-expense/20 text-expense text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider animate-pulse">
                      Over Budget
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: color + "20" }}>
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">{category?.label || budget.category}</h3>
                        <p className="text-xs text-text-muted capitalize">{budget.period} budget</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteBudget(budget.id)}
                      className="text-text-muted hover:text-expense transition-colors p-2 rounded-lg hover:bg-white/[0.05]"
                      title="Delete Budget"
                    >
                      <LucideIcons.Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-text-primary tabular-nums">
                        {symbol}{budget.spent.toLocaleString()}
                        <span className="text-sm font-medium text-text-muted ml-1">of {symbol}{budget.limit.toLocaleString()}</span>
                      </div>
                      <span className="text-sm font-medium text-text-muted">{percentage.toFixed(0)}%</span>
                    </div>
                    
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isOverBudget ? "bg-expense" : isWarning ? "bg-amber-500" : "bg-income"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-text-muted">
                        {isOverBudget 
                          ? `${symbol}${(budget.spent - budget.limit).toLocaleString()} over limit` 
                          : `${symbol}${(budget.limit - budget.spent).toLocaleString()} remaining`}
                      </span>
                      <span className="text-xs text-text-muted">
                        {budget.period === "monthly" ? "Resets next month" : "Resets next week"}
                      </span>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            );
          })}
        </div>
      )}

      <SetBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
