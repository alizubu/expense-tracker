"use client";
import { TypographyH1, TypographyP } from "@/components/ui/typography";

import { motion } from "framer-motion";
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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }}>
        <div className="mb-2">
          <TypographyH1 className="text-3xl font-bold text-foreground tracking-tight">Analytics & Insights</TypographyH1>
          <TypographyP className="text-sm text-muted-foreground mt-1">Deep dive into your spending habits and trends.</TypographyP>
        </div>
      </motion.div>

      {transactions.length === 0 ? (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-col items-center justify-center py-12">
            <EmptyState
              icon={PieChart}
              title="No data available"
              description="Add transactions to see your analytics and insights."
            />
          </div>
        </motion.div>
      ) : (
        <>
          <AnalyticsStatsRow />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <MonthlyBarChart />
            </motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
              <CategoryDonutChart />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <DailyLineChart />
            </motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <ProfileAreaChart />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="lg:col-span-3">
              <TopCategories />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
