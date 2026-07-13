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

  if (status === "loading" || loading) {
    return (
      <div className="flex w-full h-auto flex-col space-y-4 p-4 lg:p-6 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-[110px] w-full rounded-xl" />
          <Skeleton className="h-[110px] w-full rounded-xl" />
          <Skeleton className="h-[110px] w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          <Skeleton className="h-[300px] w-full xl:col-span-2 rounded-xl" />
          <Skeleton className="h-[300px] w-full xl:col-span-1 rounded-xl" />
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated gradient mesh — signature premium element */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/12 via-primary/4 to-transparent rounded-full blur-[100px] opacity-30 dark:opacity-15 animate-mesh-drift" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-rose-500/3 to-transparent rounded-full blur-[100px] opacity-25 dark:opacity-12 animate-mesh-drift-reverse" />
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/8 via-indigo-500/2 to-transparent rounded-full blur-[80px] opacity-20 dark:opacity-10 animate-mesh-drift-slow" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="p-3 md:p-4 lg:p-6 space-y-4 lg:space-y-5 max-w-[1440px] mx-auto relative z-10"
      >
        {/* ROW 1: Hero Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatsStrip 
            netBalance={netBalance}
            income={income}
            expenses={expenses}
            sparklineData={sparklineData.length > 0 ? sparklineData : [{ value: netBalance }, { value: netBalance }]}
          />
        </motion.div>

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 lg:gap-4 items-start">
          
          {/* LEFT COLUMN: Wallets & Activity (65%) */}
          <motion.div variants={itemVariants} className="xl:col-span-2 space-y-4 lg:space-y-5">
            <ProfileCard 
              profiles={profiles} 
              netBalance={netBalance} 
              onAdd={() => setProfileModalOpen(true)} 
            />
            <TransactionFeed transactions={transactions} />
          </motion.div>

          {/* RIGHT COLUMN: Analytics (35%) — single unified card */}
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <SpendingChart />
          </motion.div>

        </div>

      </motion.div>

      <CreateProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCreated={fetchDashboard}
      />
    </div>
  );
}
