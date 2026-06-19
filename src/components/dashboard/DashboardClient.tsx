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
import { CategoryDonutChart } from "@/components/analytics/CategoryDonutChart";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="grid grid-rows-[auto_auto_1fr] gap-4 w-full max-w-[1400px] mx-auto min-h-full px-3 py-3 pb-20 md:px-4 md:py-4 md:pb-20 lg:px-5 lg:py-5 lg:pb-6 xl:px-6 xl:py-5"
    >
      {/* ROW 1: Stats Strip */}
      <StatsStrip 
        netBalance={netBalance}
        income={income}
        expenses={expenses}
        sparklineData={sparklineData.length > 0 ? sparklineData : [{ value: netBalance }, { value: netBalance }]}
      />

      {/* ROW 2: Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="min-w-0">
          <ProfileCard 
            profiles={profiles} 
            netBalance={netBalance} 
            onAdd={() => setProfileModalOpen(true)} 
          />
        </div>
        <div className="min-w-0">
          <QuickStats 
            transactionsCount={transactionsCount}
            avgDailySpend={avgDailySpend}
            largestExpense={largestExpense}
            topCategory={topCategory}
            profilesCount={profiles.length}
          />
        </div>
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <CategoryDonutChart />
        </div>
      </div>

      {/* ROW 3: Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        <div className="min-w-0">
          <TransactionFeed transactions={transactions} />
        </div>
        <div className="min-w-0">
          <TopCategories />
        </div>
      </div>

      <CreateProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCreated={fetchDashboard}
      />
    </motion.div>
  );
}
