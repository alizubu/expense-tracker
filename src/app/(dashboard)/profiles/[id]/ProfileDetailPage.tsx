"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById } from "@/lib/categories";
import { getProfileType } from "@/lib/profiles";
import { formatRelativeDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, TrendingDown, Edit2 } from "lucide-react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { EditProfileModal } from "@/components/profiles/EditProfileModal";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

export default function ProfileDetailPage() {
  const params = useParams();
  const profileId = params.id as string;
  const { getProfile } = useProfileStore();
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [showEditModal, setShowEditModal] = useState(false);

  const profile = getProfile(profileId);
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Profile not found</p>
        <Link href="/profiles" className="mt-4 text-sm text-primary hover:underline">← Back to Profiles</Link>
      </div>
    );
  }

  const profileType = getProfileType(profile.type);
  const Icon = getIcon(profile.icon);
  const profileTxns = transactions.filter(t => t.profileId === profileId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const now = new Date();
  const monthTxns = profileTxns.filter(t => new Date(t.date).getMonth() === now.getMonth());
  const monthIncome = monthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxns.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0, duration: 0.3 }}>
        <div className="flex items-center justify-between mb-2">
          <Link href="/profiles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Profiles
          </Link>
        </div>

        <Card className={`relative p-6 lg:p-8 border ${profile.isDefault ? 'border-primary/50 bg-primary/[0.02]' : 'border-border bg-card'} hover:shadow-sm transition-all duration-200 mt-4`}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: profile.color + "15" }}>
                <Icon className="h-8 w-8" style={{ color: profile.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium">{profileType?.emoji} {profileType?.label}</span>
                  {profile.isDefault && (
                    <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary">Default</span>
                  )}
                </div>
                {profile.description && <p className="text-sm text-muted-foreground mt-3">{profile.description}</p>}
              </div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="rounded-xl border border-border bg-muted p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-mono mb-8 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-semibold">{symbol}</span>
            <span>{profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/50 pt-6">
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-emerald-500/80 font-bold uppercase tracking-wider">Income This Month</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-emerald-500 font-mono">{symbol} {monthIncome.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-destructive/5 border border-destructive/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs text-destructive/80 font-bold uppercase tracking-wider">Expense This Month</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-destructive font-mono">{symbol} {monthExpense.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Card className="p-6 border-border shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-6">Transaction History</h2>
          <div className="divide-y divide-border/50">
            {profileTxns.slice(0, 20).map(txn => {
              const cat = getCategoryById(txn.category);
              const CatIcon = cat ? getIcon(cat.icon) : LucideIcons.CircleDot;
              const color = txn.type === "INCOME" ? "text-emerald-500" : txn.type === "EXPENSE" ? "text-destructive" : "text-slate-500";
              const sign = txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "-" : "";
              return (
                <div key={txn.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-muted/50 transition-colors rounded-xl px-2 -mx-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: (cat?.color || "#64748B") + "15" }}>
                    <CatIcon className="h-4 w-4" style={{ color: cat?.color || "#64748B" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{txn.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cat?.label || txn.category} • {formatRelativeDate(txn.date)}</p>
                  </div>
                  <p className={cn("text-sm font-bold font-mono flex-shrink-0", color)}>{sign}{symbol}{txn.amount.toLocaleString()}</p>
                </div>
              );
            })}
            {profileTxns.length === 0 && <p className="text-center py-12 text-sm font-semibold text-muted-foreground">No transactions for this profile yet</p>}
          </div>
        </Card>
      </motion.div>

      {showEditModal && (
        <EditProfileModal
          open={showEditModal}
          profileId={profileId}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
