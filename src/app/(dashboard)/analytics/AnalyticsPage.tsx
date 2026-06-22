"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { useTransactionStore } from "@/store/useTransactionStore";
import { PieChart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import AnalyticsStatsRow from "@/components/analytics/AnalyticsStatsRow";
import MonthlyBarChart from "@/components/analytics/MonthlyBarChart";
import { CategoryDonutChart } from "@/components/analytics/CategoryDonutChart";
import DailyLineChart from "@/components/analytics/DailyLineChart";
import ProfileAreaChart from "@/components/analytics/ProfileAreaChart";
import { TopCategories } from "@/components/analytics/TopCategories";

export default function AnalyticsPage() {
  const { transactions } = useTransactionStore();

  return (
    <div className="mx-auto max-w-[1400px] w-full px-3 py-3 pb-20 md:px-5 md:py-5 md:pb-6 space-y-4 md:space-y-6">
      <BlurFade delay={0}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-heading">Analytics & Insights</h1>
          <p className="text-sm text-text-muted mt-1">Deep dive into your spending habits and trends.</p>
        </div>
      </BlurFade>

      {transactions.length === 0 ? (
        <BlurFade delay={0.1}>
          <div className="flex flex-col items-center justify-center py-12">
            <EmptyState
              icon={PieChart}
              title="No data available"
              description="Add transactions to see your analytics and insights."
            />
          </div>
        </BlurFade>
      ) : (
        <>
          <AnalyticsStatsRow />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <BlurFade delay={0.2} className="lg:col-span-2">
              <MonthlyBarChart />
            </BlurFade>
            <BlurFade delay={0.3} className="lg:col-span-1">
              <CategoryDonutChart />
            </BlurFade>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <BlurFade delay={0.4}>
              <DailyLineChart />
            </BlurFade>
            <BlurFade delay={0.5}>
              <ProfileAreaChart />
            </BlurFade>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <BlurFade delay={0.6} className="lg:col-span-1">
              <TopCategories />
            </BlurFade>
            <BlurFade delay={0.7} className="lg:col-span-2">
              <div className="h-full min-h-[200px] w-full rounded-2xl border border-border bg-card/40 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-all">
                 <p className="text-text-muted text-xs font-semibold uppercase tracking-wider text-center">More insights coming soon...</p>
              </div>
            </BlurFade>
          </div>
        </>
      )}
    </div>
  );
}
