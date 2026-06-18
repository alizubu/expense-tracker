"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import { NetBalanceCard } from "@/components/dashboard/NetBalanceCard";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { useProfileStore } from "@/store/useProfileStore";

interface DashboardData {
  netBalance: number;
  profiles: any[];
  recentTransactions: any[];
}

export function DashboardClient() {
  const { status } = useSession();
  const { profiles: storeProfiles, setProfiles, getTotalBalance } = useProfileStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?month=${month}&year=${year}`, { cache: "no-store" });
      const json = await res.json();
      setData(json);
      if (json.profiles) {
        setProfiles(json.profiles);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [month, year, setProfiles]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchDashboard();
  }, [status, fetchDashboard]);

  // Aggregate category spending for Donut chart
  const donutData = useMemo(() => {
    if (!data?.recentTransactions) return [];
    const expenses = data.recentTransactions.filter((t) => t.type === "EXPENSE");
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  }, [data]);

  const COLORS = ["var(--accent)", "var(--accent-light)", "#38BDF8", "#F472B6", "#10B981"];

  if (status === "loading" || loading) {
    return (
      <div className="flex w-full h-[60vh] flex-col space-y-4">
        <div className="h-[200px] w-full skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="col-span-3 space-y-4">
             <div className="h-[300px] w-full skeleton" />
             <div className="h-[300px] w-full skeleton" />
          </div>
          <div className="col-span-2">
             <div className="h-[300px] w-full skeleton" />
          </div>
        </div>
      </div>
    );
  }

  const netBalance = getTotalBalance();
  const profilesToRender = storeProfiles;

  if (profilesToRender.length === 0) {
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
    <div className="flex flex-col space-y-6">
      {/* Row 1: Hero */}
      <NetBalanceCard />

      {/* Row 2: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60%) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col space-y-6">
          {/* Profiles Section */}
          <div className="flex flex-col w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-medium text-[var(--text-primary)]">Your Profiles</h2>
                <button 
                  onClick={() => setProfileModalOpen(true)}
                  className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
                >
                  + Add New
                </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {profilesToRender.map(p => (
                 <ProfileCard key={p.id} profile={p} netBalance={netBalance} />
               ))}
             </div>
          </div>

          {/* Transactions Section */}
          <TransactionFeed transactions={data?.recentTransactions || []} />
        </div>

        {/* Right Column (40%) */}
        <div className="col-span-1 lg:col-span-2">
          <div className="flex flex-col w-full h-full min-h-[400px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-[13px] font-medium text-[var(--text-primary)] mb-6">
              Spending by Category
            </h2>
            <div className="flex-1 w-full h-full relative flex flex-col items-center justify-center">
              {donutData.length === 0 ? (
                 <p className="text-[13px] text-[var(--text-muted)]">No expenses this month</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-hover)', 
                          borderColor: 'var(--border-default)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-geist-sans)'
                        }}
                        itemStyle={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-secondary)' }}
                        formatter={(value: any) => `৳ ${Number(value).toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Spent</span>
                    <span className="font-mono text-[24px] font-semibold text-[var(--text-primary)]">
                      ৳ {donutData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      <CreateProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCreated={fetchDashboard}
      />
    </div>
  );
}
