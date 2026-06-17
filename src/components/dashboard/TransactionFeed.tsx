"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { formatRelativeDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Sparkles } from "@/components/magicui/sparkles";
import * as LucideIcons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

export function TransactionFeed() {
  const { transactions } = useTransactionStore();
  const { getProfile } = useProfileStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  // Get last 10 transactions sorted by date
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (recentTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <LucideIcons.Receipt className="h-12 w-12 text-text-muted mb-3" />
        <p className="text-sm text-text-muted">No transactions yet</p>
        <p className="text-xs text-text-muted mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recentTransactions.map((transaction, index) => {
        const category = getCategoryById(transaction.category);
        const profile = getProfile(transaction.profileId);
        const Icon = category ? getIcon(category.icon) : LucideIcons.CircleDot;

        const amountColor =
          transaction.type === "INCOME"
            ? "text-income"
            : transaction.type === "EXPENSE"
            ? "text-expense"
            : "text-transfer";

        const amountSign =
          transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : "";

        const formattedAmount = `${amountSign}${symbol} ${transaction.amount.toLocaleString("en-US", {
          minimumFractionDigits: 0,
        })}`;

        return (
          <div
            key={transaction.id}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03] animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Category Icon */}
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: (category?.color || "#64748B") + "18",
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: category?.color || "#64748B" }}
              />
            </div>

            {/* Title & category */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {transaction.title}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted">
                  {category?.label || transaction.category}
                </span>
                {profile && (
                  <>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{profile.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Amount & time */}
            <div className="text-right flex-shrink-0">
              <p className={cn("text-sm font-semibold tabular-nums", amountColor)}>
                {transaction.type === "INCOME" ? (
                  <Sparkles color="#10B981" count={3}>
                    {formattedAmount}
                  </Sparkles>
                ) : (
                  formattedAmount
                )}
              </p>
              <p className="text-xs text-text-muted">
                {formatRelativeDate(transaction.date)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
