"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { TopCategories } from "@/components/analytics/TopCategories";

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
      <div className="flex w-full h-[60vh] flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="h-[96px] w-full skeleton" />
          <div className="h-[96px] w-full skeleton" />
          <div className="h-[96px] w-full skeleton" />
          <div className="h-[96px] w-full skeleton" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="h-[280px] w-full skeleton" />
          <div className="h-[280px] w-full skeleton" />
          <div className="h-[280px] w-full skeleton" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="h-[400px] w-full skeleton" />
          <div className="h-[400px] w-full skeleton" />
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full max-w-md mx-auto text-center p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-2xl">
        <div className="w-16 h-16 bg-[var(--accent-glow)] rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl text-[var(--accent-light)]">✧</span>
        </div>
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">
          Welcome to ExpenseTracker
        </h2>
        <p className="text-[14px] text-[var(--text-muted)] mb-8">
          Start your financial journey by creating your first wallet profile.
        </p>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="w-full h-11 bg-[var(--accent)] hover:bg-[#6D28D9] text-white font-medium rounded-[var(--radius-md)] transition-all"
        >
          Create Profile
        </button>
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
      variants={staggerContainer(0.07)} 
      initial="hidden" 
      animate="show"
      className="
        space-y-3
        xl:space-y-0 xl:grid xl:gap-3.5
        xl:h-full xl:overflow-hidden
        xl:grid-rows-[86px_minmax(0,210px)_minmax(0,1fr)]
        pb-24 xl:pb-0
      "
    >
      {/* ROW 1 — Stats Strip */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatsStrip 
          netBalance={netBalance}
          income={income}
          expenses={expenses}
          sparklineData={sparklineData.length > 0 ? sparklineData : [{ value: netBalance }, { value: netBalance }]}
        />
      </motion.div>

      {/* ROW 2 — Middle panels */}
      <motion.div variants={fadeUp} className="flex flex-col xl:grid xl:grid-cols-3 gap-3 xl:min-h-0">
        <motion.div variants={fadeUp} className="xl:min-h-0 xl:h-full flex flex-col md:grid md:grid-cols-2 xl:flex gap-3">
          <ProfileCard 
            profiles={profiles} 
            netBalance={netBalance} 
            onAdd={() => setProfileModalOpen(true)} 
          />
          <div className="xl:hidden">
            <QuickStats 
              transactionsCount={transactionsCount}
              avgDailySpend={avgDailySpend}
              largestExpense={largestExpense}
              topCategory={topCategory}
              profilesCount={profiles.length}
            />
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="hidden xl:block xl:min-h-0 xl:h-full">
          <QuickStats 
            transactionsCount={transactionsCount}
            avgDailySpend={avgDailySpend}
            largestExpense={largestExpense}
            topCategory={topCategory}
            profilesCount={profiles.length}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="xl:min-h-0 xl:h-full md:col-span-2 xl:col-span-1">
          <SpendingChart />
        </motion.div>
      </motion.div>

      {/* ROW 3 — Bottom panels */}
      <motion.div variants={fadeUp} className="flex flex-col xl:grid xl:grid-cols-[1.6fr_1fr] gap-3 xl:min-h-0">
        <motion.div variants={fadeUp} className="xl:min-h-0 xl:h-full">
          <TransactionFeed transactions={transactions} />
        </motion.div>
        <motion.div variants={fadeUp} className="xl:min-h-0 xl:h-full">
          <TopCategories />
        </motion.div>
      </motion.div>

      <CreateProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCreated={fetchDashboard}
      />
    </motion.div>
  );
}
