"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { useRecurringStore } from "@/store/useRecurringStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/formatters";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

export default function RecurringPage() {
  const { rules, toggleRule, deleteRule } = useRecurringStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <BlurFade delay={0}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-heading">Recurring Transactions</h1>
            <p className="text-sm text-text-muted mt-1">Manage your subscriptions and automated incomes.</p>
          </div>
          <ShimmerButton>+ Add Recurring</ShimmerButton>
        </div>
      </BlurFade>

      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] p-12 text-center">
            <LucideIcons.Repeat className="h-12 w-12 text-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Recurring Transactions</h3>
            <p className="text-sm text-text-muted max-w-sm mb-6">Set up your regular subscriptions, bills, or salary to automate your tracking.</p>
          </div>
        ) : (
          rules.map((rule, idx) => {
            const category = getCategoryById(rule.category);
            const Icon = getIcon(category?.icon || "CircleDot");
            const color = rule.type === "INCOME" ? "text-income" : rule.type === "EXPENSE" ? "text-expense" : "text-transfer";
            const sign = rule.type === "INCOME" ? "+" : rule.type === "EXPENSE" ? "-" : "";

            return (
              <BlurFade key={rule.id} delay={0.1 + idx * 0.05}>
                <MagicCard className={cn("p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all", !rule.isActive && "opacity-60")}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: (category?.color || "#94A3B8") + "20" }}>
                      <Icon className="h-6 w-6" style={{ color: category?.color || "#94A3B8" }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{rule.title}</h3>
                      <p className="text-sm text-text-muted flex items-center gap-2">
                        <span className="capitalize">{rule.frequency}</span> • 
                        <span>Next: {formatRelativeDate(rule.nextDate)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
                    <div className="text-right">
                      <p className={cn("text-lg font-bold tabular-nums", color)}>
                        {sign}{symbol}{rule.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/[0.08] pl-6">
                      <button 
                        onClick={() => toggleRule(rule.id)}
                        className={cn("p-2 rounded-lg transition-colors", rule.isActive ? "text-income hover:bg-income/10" : "text-text-muted hover:bg-white/[0.05]")}
                        title={rule.isActive ? "Pause" : "Resume"}
                      >
                        {rule.isActive ? <LucideIcons.Pause className="h-4 w-4" /> : <LucideIcons.Play className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
                        title="Delete"
                      >
                        <LucideIcons.Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            );
          })
        )}
      </div>
    </div>
  );
}
