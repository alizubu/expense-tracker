"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { NetBalanceCard } from "@/components/dashboard/NetBalanceCard";
import { ProfileCards } from "@/components/dashboard/ProfileCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { useUIStore } from "@/store/useUIStore";

export function DashboardClient() {
  const { activeModal, closeModal } = useUIStore();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Net Balance Card — Full width */}
      <BlurFade delay={0}>
        <NetBalanceCard />
      </BlurFade>

      {/* Profile Cards Row */}
      <BlurFade delay={0.1}>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Profiles
          </h2>
          <ProfileCards />
        </div>
      </BlurFade>

      {/* Quick Actions */}
      <BlurFade delay={0.15}>
        <QuickActions />
      </BlurFade>

      {/* Bottom Grid — Transactions + Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <BlurFade delay={0.2}>
          <div className="rounded-xl border border-white/[0.08] bg-background-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                Recent Transactions
              </h3>
              <a
                href="/transactions"
                className="text-xs font-medium text-brand-purple-light hover:text-brand-purple transition-colors"
              >
                View all →
              </a>
            </div>
            <TransactionFeed />
          </div>
        </BlurFade>

        {/* Spending Breakdown + Budget */}
        <BlurFade delay={0.25}>
          <div className="space-y-6">
            {/* Donut Chart */}
            <div className="rounded-xl border border-white/[0.08] bg-background-card p-4">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">
                Spending Breakdown
              </h3>
              <div className="h-[300px]">
                <SpendingChart />
              </div>
            </div>

            {/* Budget Progress */}
            <div className="rounded-xl border border-white/[0.08] bg-background-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  Budget Status
                </h3>
                <a
                  href="/budgets"
                  className="text-xs font-medium text-brand-purple-light hover:text-brand-purple transition-colors"
                >
                  Manage →
                </a>
              </div>
              <BudgetProgress />
            </div>
          </div>
        </BlurFade>
      </div>

      {/* Add Transaction Modal */}
      {activeModal === "addTransaction" && (
        <AddTransactionModal onClose={closeModal} />
      )}
    </div>
  );
}
