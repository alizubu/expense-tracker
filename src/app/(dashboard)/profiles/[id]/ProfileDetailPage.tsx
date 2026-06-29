"use client";
import { TypographySpan, TypographyP, TypographyH1, TypographyH2 } from "@/components/ui/typography";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById, getCategoryColor, getCategoryIconName } from "@/lib/categories";
import { getProfileType } from "@/lib/profiles";
import { formatRelativeDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, TrendingDown, Edit2, CircleDashed } from "lucide-react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { EditProfileModal } from "@/components/profiles/EditProfileModal";


function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <TypographyP className="text-muted-foreground">Profile not found</TypographyP>
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

        <Card className={`relative p-6 lg:p-8 border ${profile.isDefault ? 'border-primary/50 bg-primary/[0.02]' : 'border-white/[0.04] bg-surface-1'} shadow-sm transition-all duration-300 hover:shadow-md mt-4 rounded-2xl`}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0 shadow-sm" style={{ backgroundColor: profile.color + "15" }}>
                <Icon className="h-8 w-8" style={{ color: profile.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <TypographyH1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">{profile.name}</TypographyH1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <TypographySpan className="inline-flex items-center rounded-md bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground font-semibold tracking-wide border border-white/[0.04]">{profileType?.emoji} {profileType?.label}</TypographySpan>
                  {profile.isDefault && (
                    <TypographySpan className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary tracking-wide">Default</TypographySpan>
                  )}
                </div>
                {profile.description && <TypographyP className="text-sm text-muted-foreground mt-3">{profile.description}</TypographyP>}
              </div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="rounded-xl border border-white/[0.04] bg-surface-2 p-2.5 text-muted-foreground hover:text-primary hover:bg-surface-3 hover:border-primary/20 transition-all shadow-sm"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight tabular-money mb-8 flex items-baseline gap-1">
            <TypographySpan className="text-xl md:text-2xl font-semibold opacity-80">{symbol}</TypographySpan>
            <TypographySpan className="leading-none">{profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TypographySpan>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.04] pt-6">
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <TypographySpan className="text-xs text-emerald-500/80 font-bold uppercase tracking-widest">Income This Month</TypographySpan>
              </div>
              <TypographyP className="text-xl md:text-2xl font-semibold text-emerald-500 tabular-money relative z-10 leading-none">{symbol} {monthIncome.toLocaleString()}</TypographyP>
            </div>
            <div className="rounded-2xl bg-surface-2 border border-white/[0.04] p-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <TypographySpan className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Expense This Month</TypographySpan>
              </div>
              <TypographyP className="text-xl md:text-2xl font-semibold text-foreground tabular-money relative z-10 leading-none">{symbol} {monthExpense.toLocaleString()}</TypographyP>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Card className="p-6 border-white/[0.04] shadow-sm bg-surface-1 rounded-2xl">
          <TypographyH2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Transaction History</TypographyH2>
          <div className="divide-y divide-white/[0.04]">
            {profileTxns.slice(0, 20).map(txn => {
              const categoryLabel = getCategoryById(txn.category)?.label || txn.category;
              let catColor = getCategoryColor(txn.category);
              let iconName = getCategoryIconName(txn.category);
              
              if (txn.type === "TRANSFER") {
                catColor = "hsl(var(--muted-foreground))";
                iconName = "ArrowLeftRight";
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const CatIcon = (LucideIcons as any)[iconName] || CircleDashed;
              const color = txn.type === "INCOME" ? "text-emerald-500" : txn.type === "EXPENSE" ? "text-foreground" : "text-muted-foreground";
              const sign = txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "" : "";
              
              return (
                <div key={txn.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:bg-surface-2 transition-colors rounded-xl px-2 -mx-2 group">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: `${catColor}1a`, color: catColor }}>
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TypographyP className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{txn.title}</TypographyP>
                    <TypographyP className="text-xs text-muted-foreground mt-1">{categoryLabel} • {formatRelativeDate(txn.date)}</TypographyP>
                  </div>
                  <TypographyP className={cn("text-sm font-semibold tabular-money flex-shrink-0", color)}>{sign}{symbol}{txn.amount.toLocaleString()}</TypographyP>
                </div>
              );
            })}
            {profileTxns.length === 0 && <TypographyP className="text-center py-12 text-sm font-semibold text-muted-foreground">No transactions for this profile yet</TypographyP>}
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
