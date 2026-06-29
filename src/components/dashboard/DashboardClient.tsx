"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { StatsStrip } from "@/components/dashboard/StatsStrip";

import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { TopCategories } from "@/components/analytics/TopCategories";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

export function DashboardClient() {
  const { status } = useSession();
  const { profiles, setProfiles, getTotalBalance, fetchProfiles } = useProfileStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProfiles(),
        fetchTransactions()
      ]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [fetchProfiles, fetchTransactions]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchDashboard();
  }, [status, fetchDashboard]);

  const currentMonthTxns = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transactions, now]);

  const netBalance = getTotalBalance();
  const income = currentMonthTxns.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const expenses = currentMonthTxns.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

  const sparklineData = useMemo(() => {
    let running = netBalance - (income - expenses);
    return currentMonthTxns
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => {
        running += (t.type === "INCOME" ? t.amount : t.type === "EXPENSE" ? -t.amount : 0);
        return { value: running };
      });
  }, [currentMonthTxns, netBalance, income, expenses]);

  const transactionsCount = currentMonthTxns.length;
  const avgDailySpend = expenses / Math.max(1, now.getDate());
  const largestExpense = currentMonthTxns.filter(t => t.type === "EXPENSE").reduce((max, t) => Math.max(max, t.amount), 0);
  
  const expenseByCategory = currentMonthTxns
     .filter(t => t.type === "EXPENSE")
     .reduce((acc, t) => { 
       acc[t.category] = (acc[t.category] || 0) + t.amount; 
       return acc; 
     }, {} as Record<string, number>);
     
  const topCategory = Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1])[0]?.[0] || "-";

  if (status === "loading" || loading) {
    return (
      <div className="flex w-full h-auto flex-col space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Skeleton className="h-[140px] w-full" />
          <Skeleton className="h-[140px] w-full" />
          <Skeleton className="h-[140px] w-full" />
          <Skeleton className="h-[140px] w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] w-full xl:col-span-2" />
          <Skeleton className="h-[500px] w-full xl:col-span-1" />
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full px-4">
        <EmptyState
          icon={Wallet}
          title="Welcome to ExpenseTracker"
          description="Start your financial journey by creating your first wallet profile."
          actionLabel="Create Profile"
          onAction={() => setProfileModalOpen(true)}
        />
        <CreateProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onCreated={fetchDashboard}
        />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 space-y-3 lg:space-y-4 max-w-[1600px] mx-auto"
    >
      {/* ROW 1: Hero Stats (Bento Grid) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <StatsStrip 
          netBalance={netBalance}
          income={income}
          expenses={expenses}
          sparklineData={sparklineData.length > 0 ? sparklineData : [{ value: netBalance }, { value: netBalance }]}
        />
      </motion.div>

      {/* ROW 2: Profiles, Spending Chart */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 items-stretch">
        <div className="h-auto md:h-full lg:col-span-2">
          <ProfileCard 
            profiles={profiles} 
            netBalance={netBalance} 
            onAdd={() => setProfileModalOpen(true)} 
          />
        </div>
        <div className="h-auto md:h-full lg:col-span-1">
          <SpendingChart />
        </div>
      </motion.div>

      {/* ROW 3: Transactions Feed & Top Categories */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 items-stretch">
        <div className="xl:col-span-2 h-auto lg:h-[500px]">
          <TransactionFeed transactions={transactions} />
        </div>
        <div className="xl:col-span-1 h-auto lg:h-[500px]">
          <TopCategories />
        </div>
      </motion.div>

      <CreateProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCreated={fetchDashboard}
      />
    </motion.div>
  );
}
