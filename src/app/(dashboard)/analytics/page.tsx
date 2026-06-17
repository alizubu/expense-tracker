"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { useTransactionStore } from "@/store/useTransactionStore";
import { PieChart } from "lucide-react";
import AnalyticsStatsRow from "@/components/analytics/AnalyticsStatsRow";
import MonthlyBarChart from "@/components/analytics/MonthlyBarChart";
import CategoryDonutChart from "@/components/analytics/CategoryDonutChart";
import DailyLineChart from "@/components/analytics/DailyLineChart";
import ProfileAreaChart from "@/components/analytics/ProfileAreaChart";
import TopCategories from "@/components/analytics/TopCategories";

export default function AnalyticsPage() {
  const { transactions } = useTransactionStore();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BlurFade delay={0}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-heading">Analytics & Insights</h1>
          <p className="text-sm text-text-muted mt-1">Deep dive into your spending habits and trends.</p>
        </div>
      </BlurFade>

      {transactions.length === 0 ? (
        <BlurFade delay={0.1}>
          <div className="flex flex-col items-center justify-center h-64 border border-white/10 rounded-2xl bg-[#16161E] text-center p-6">
            <PieChart className="w-12 h-12 text-text-muted mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No data available</h2>
            <p className="text-slate-400">Add transactions to see your analytics and insights.</p>
          </div>
        </BlurFade>
      ) : (
        <>
          <AnalyticsStatsRow />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BlurFade delay={0.2} className="lg:col-span-2">
          <MonthlyBarChart />
        </BlurFade>
        <BlurFade delay={0.3} className="lg:col-span-1">
          <CategoryDonutChart />
        </BlurFade>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlurFade delay={0.4}>
          <DailyLineChart />
        </BlurFade>
        <BlurFade delay={0.5}>
          <ProfileAreaChart />
        </BlurFade>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BlurFade delay={0.6} className="lg:col-span-1">
          <TopCategories />
        </BlurFade>
        <BlurFade delay={0.7} className="lg:col-span-2">
          {/* We can use another chart here for Income vs Expense trend if needed, or leave blank/placeholder */}
          <div className="h-full w-full rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center p-6">
             <p className="text-text-muted text-sm text-center">More insights coming soon...</p>
          </div>
        </BlurFade>
      </div>
      </>
      )}
    </div>
  );
}
