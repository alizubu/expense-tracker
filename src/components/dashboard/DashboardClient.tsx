"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { HeroStatCard } from "@/components/dashboard/HeroStatCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { TopCategories } from "@/components/analytics/TopCategories";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";

export function DashboardClient() {
  const { status } = useSession();
  const { profiles, setProfiles, getTotalBalance, fetchProfiles } = useProfileStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
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
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

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
  const numCategories = Object.keys(expenseByCategory).length;

  if (status === "loading" || loading) {
    return (
      <div className="flex w-full h-[60vh] flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="h-[140px] w-full skeleton" />
          <div className="h-[140px] w-full skeleton" />
          <div className="h-[140px] w-full skeleton" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="h-[280px] w-full skeleton" />
          <div className="h-[280px] w-full skeleton" />
          <div className="h-[280px] w-full skeleton" />
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full max-w-md mx-auto text-center p-8 bg-[var(--bg-surface)] border border-[var(--border-hair)] rounded-[var(--radius-xl)] shadow-2xl">
        <div className="w-16 h-16 bg-[var(--bg-raised)] rounded-full flex items-center justify-center mb-6">
          <Wallet size={32} className="text-[var(--accent-brass)]" />
        </div>
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">
          Welcome to ExpenseTracker
        </h2>
        <p className="text-[14px] text-[var(--text-muted)] mb-8">
          Start your financial journey by creating your first wallet profile.
        </p>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="w-full h-11 bg-[var(--accent-brass)] hover:bg-[var(--accent-light)] text-[var(--bg-base)] font-medium rounded-lg transition-all"
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
        space-y-4
        xl:space-y-4
        xl:h-full xl:overflow-auto hide-scrollbar
        pb-24 xl:pb-8
      "
    >
      {/* Dynamic Context String */}
      <motion.div variants={fadeUp} className="text-[15px] font-ui text-[var(--text-muted)] leading-relaxed max-w-2xl">
        You have spent <strong className="text-[var(--text-primary)] font-mono">{symbol}{expenses.toLocaleString()}</strong> across <strong className="text-[var(--text-primary)]">{numCategories}</strong> categories this month, which is <strong className="text-[var(--text-primary)]">{savingsRate > 0 ? (100 - savingsRate).toFixed(1) : 0}%</strong> of your income.
      </motion.div>

      {/* ROW 1 — Stats Strip (3 Cards) */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HeroStatCard
          title="Net Balance"
          amount={netBalance}
          accentColor="var(--accent-brass)"
          savingsRate={savingsRate}
          sparklineData={sparklineData.length > 0 ? sparklineData : [{ value: netBalance }, { value: netBalance }]}
        />
        <HeroStatCard
          title="Income"
          amount={income}
          accentColor="var(--accent-teal)"
          icon={ArrowUpRight}
        />
        <HeroStatCard
          title="Expenses"
          amount={expenses}
          accentColor="var(--accent-clay)"
          icon={ArrowDownRight}
        />
      </motion.div>

      {/* ROW 2 — Middle panels */}
      <motion.div variants={fadeUp} className="flex flex-col xl:grid xl:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="flex flex-col md:grid md:grid-cols-2 xl:flex gap-4">
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
        
        <motion.div variants={fadeUp} className="hidden xl:block">
          <QuickStats 
            transactionsCount={transactionsCount}
            avgDailySpend={avgDailySpend}
            largestExpense={largestExpense}
            topCategory={topCategory}
            profilesCount={profiles.length}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="md:col-span-2 xl:col-span-1">
          <SpendingChart />
        </motion.div>
      </motion.div>

      {/* ROW 3 — Bottom panels */}
      <motion.div variants={fadeUp} className="flex flex-col xl:grid xl:grid-cols-[1.6fr_1fr] gap-4">
        <motion.div variants={fadeUp}>
          <TransactionFeed transactions={transactions} />
        </motion.div>
        <motion.div variants={fadeUp}>
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
