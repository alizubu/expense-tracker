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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-[1600px] mx-auto w-full relative">
      {/* Background Glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="mb-10"
      >
        <TypographyH1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          Analytics & Insights
        </TypographyH1>
        <TypographyP className="text-[14px] text-muted-foreground/80 mt-2 font-medium tracking-wide max-w-xl">
          Deep dive into your spending habits and financial trends through beautiful, high-fidelity visualizations.
        </TypographyP>
      </motion.div>

      {transactions.length === 0 ? (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/[0.05] rounded-[32px] bg-surface-1/10 backdrop-blur-sm">
            <EmptyState
              icon={PieChart}
              title="No data available"
              description="Add transactions to unlock deep analytics and insights."
            />
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6 lg:gap-8">
          <AnalyticsStatsRow />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }} 
              className="xl:col-span-2 flex flex-col"
            >
              <MonthlyBarChart />
            </motion.div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }} 
              className="xl:col-span-1 flex flex-col"
            >
              <CategoryDonutChart />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <DailyLineChart />
            </motion.div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <ProfileAreaChart />
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <TopCategories />
          </motion.div>
        </div>
      )}
    </div>
  );
}
