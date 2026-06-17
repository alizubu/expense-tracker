"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import * as LucideIcons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

interface DashboardData {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  profiles: any[];
  recentTransactions: any[];
}

export function DashboardClient() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/dashboard?month=${month}&year=${year}`, { cache: "no-store" });
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchDashboard();
  }, [status, fetchDashboard]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  // No profiles yet — guide user
  if (data?.profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="text-5xl mb-4">💰</span>
        <h2 className="text-xl font-semibold text-white mb-2">
          No profiles yet
        </h2>
        <p className="text-slate-400 mb-6">
          Create a wallet profile to start tracking your money
        </p>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white
                     font-medium rounded-xl transition"
        >
          + Add Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Net Balance Card */}
      <div className="bg-[#16161E] border border-white/10 rounded-2xl p-6">
        <p className="text-slate-400 text-sm mb-1">Net Balance</p>
        <p className="text-4xl font-semibold text-white">
          ৳ {data?.netBalance.toLocaleString("en-BD")}
        </p>
        <div className="flex gap-3 mt-4">
          <span className="text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
            ↑ Income ৳ {data?.totalIncome.toLocaleString("en-BD")}
          </span>
          <span className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded-full">
            ↓ Expense ৳ {data?.totalExpense.toLocaleString("en-BD")}
          </span>
          <span className="text-sm bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full">
            % Savings {data?.savingsRate}%
          </span>
        </div>
      </div>

      {/* Profiles */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Profiles
          </h2>
          <button 
            onClick={() => setProfileModalOpen(true)}
            className="text-xs font-medium text-brand-purple hover:text-brand-purple-light transition-colors"
          >
            + Add New
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.profiles.map((profile) => {
            const Icon = getIcon(profile.icon);
            return (
            <div
              key={profile.id}
              className="bg-[#16161E] border border-white/10 rounded-xl p-4"
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl mb-3"
                style={{ backgroundColor: profile.color + "20" }}
              >
                <Icon className="h-5 w-5" style={{ color: profile.color }} />
              </div>
              <p className="text-white font-medium">{profile.name}</p>
              <p className="text-xl font-semibold text-white mt-1">
                ৳ {profile.balance.toLocaleString("en-BD")}
              </p>
            </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
          Recent Transactions
        </h2>
        {data?.recentTransactions.length === 0 ? (
          <div className="bg-[#16161E] border border-white/10 rounded-xl p-8
                          text-center text-slate-400">
            No transactions yet. Add your first one!
          </div>
        ) : (
          <div className="bg-[#16161E] border border-white/10 rounded-xl divide-y
                          divide-white/5">
            {data?.recentTransactions.map((txn) => {
              const TxnIcon = getIcon(txn.profile?.icon);
              return (
              <div key={txn.id} className="flex items-center gap-4 p-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: txn.profile?.color + "20" }}
                >
                  <TxnIcon className="h-4 w-4" style={{ color: txn.profile?.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{txn.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {txn.category} · {txn.profile?.name}
                  </p>
                </div>
                <p
                  className={`text-sm font-medium ${
                    txn.type === "INCOME"
                      ? "text-green-400"
                      : txn.type === "TRANSFER"
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
                >
                  {txn.type === "INCOME" ? "+" : txn.type === "TRANSFER" ? "" : "-"}
                  ৳ {txn.amount.toLocaleString("en-BD")}
                </p>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onCreated={fetchDashboard}
      />
    </div>
  );
}
