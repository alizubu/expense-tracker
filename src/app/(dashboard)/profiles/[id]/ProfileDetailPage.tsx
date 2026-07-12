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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-[1200px] mx-auto w-full relative">
      {/* Ambient Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[120px] mix-blend-screen opacity-30 transition-colors duration-1000" style={{ backgroundColor: profile.color }} />
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
        <div className="flex items-center justify-between mb-6">
          <Link href="/profiles" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-surface-2/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/[0.05] hover:border-white/[0.1] hover:bg-surface-2">
            <ArrowLeft className="h-4 w-4" /> Back to Profiles
          </Link>
        </div>

        <Card className={`relative p-8 lg:p-10 border rounded-[32px] overflow-hidden ${profile.isDefault ? 'border-primary/30 bg-surface-1/60 shadow-[0_0_40px_rgba(var(--primary),0.1)]' : 'border-white/[0.08] bg-surface-1/40 hover:shadow-2xl'} backdrop-blur-2xl transition-all duration-500 mb-8`}>
          {/* Internal Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: profile.color }} />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] flex-shrink-0 shadow-lg border border-white/[0.05] backdrop-blur-md" style={{ backgroundColor: profile.color + "20" }}>
                <Icon className="h-10 w-10" style={{ color: profile.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <TypographyH1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight truncate mb-2">{profile.name}</TypographyH1>
                <div className="flex flex-wrap items-center gap-2">
                  <TypographySpan className="inline-flex items-center rounded-full bg-surface-2/50 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground font-bold tracking-widest uppercase border border-white/[0.05]">{profileType?.emoji} {profileType?.label}</TypographySpan>
                  {profile.isDefault && (
                    <TypographySpan className="inline-flex items-center rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 px-3 py-1 text-xs font-bold text-primary tracking-widest uppercase shadow-[0_0_15px_rgba(var(--primary),0.2)]">Default</TypographySpan>
                  )}
                </div>
                {profile.description && <TypographyP className="text-sm font-medium text-muted-foreground/80 mt-4 max-w-xl leading-relaxed">{profile.description}</TypographyP>}
              </div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center rounded-2xl border border-white/[0.05] bg-surface-2/50 backdrop-blur-md p-4 text-muted-foreground hover:text-foreground hover:bg-surface-3 hover:border-white/[0.1] transition-all shadow-sm"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-10 relative z-10">
            <TypographySpan className="text-sm font-bold text-muted-foreground uppercase tracking-widest block mb-2">Total Balance</TypographySpan>
            <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter tabular-money flex items-baseline gap-2 drop-shadow-sm">
              <TypographySpan className="text-3xl md:text-4xl font-semibold opacity-60">{symbol}</TypographySpan>
              <TypographySpan className="leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">{profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TypographySpan>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/[0.04] pt-8 relative z-10">
            <div className="rounded-[24px] bg-emerald-500/5 border border-emerald-500/20 p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-shadow duration-500 backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-1000" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <TypographySpan className="text-[11px] text-emerald-400/90 font-bold uppercase tracking-widest">Income This Month</TypographySpan>
              </div>
              <TypographyP className="text-2xl md:text-3xl font-black text-emerald-400 tabular-money relative z-10 leading-none tracking-tight">{symbol} {monthIncome.toLocaleString()}</TypographyP>
            </div>
            <div className="rounded-[24px] bg-surface-2/30 border border-white/[0.06] p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-shadow duration-500 backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-foreground/10 transition-colors duration-1000" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <TrendingDown className="h-5 w-5 text-muted-foreground" />
                <TypographySpan className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Expense This Month</TypographySpan>
              </div>
              <TypographyP className="text-2xl md:text-3xl font-black text-foreground tabular-money relative z-10 leading-none tracking-tight">{symbol} {monthExpense.toLocaleString()}</TypographyP>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
        <Card className="p-6 lg:p-8 border-white/[0.04] shadow-sm bg-surface-1/40 backdrop-blur-2xl rounded-[32px] overflow-hidden relative">
          {/* Subtle mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          
          <TypographyH2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 relative z-10">Transaction History</TypographyH2>
          <div className="flex flex-col gap-3 relative z-10">
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
              const color = txn.type === "INCOME" ? "text-emerald-400" : txn.type === "EXPENSE" ? "text-foreground" : "text-muted-foreground";
              const sign = txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "" : "";
              
              return (
                <div key={txn.id} className="flex items-center gap-4 py-3 px-4 rounded-[20px] hover:bg-surface-2/60 border border-transparent hover:border-white/[0.04] transition-all duration-300 group cursor-pointer">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] shadow-sm transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: `${catColor}15`, color: catColor, boxShadow: `inset 0 0 0 1px ${catColor}20` }}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TypographyP className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors tracking-tight">{txn.title}</TypographyP>
                    <TypographyP className="text-[12px] font-medium text-muted-foreground/80 mt-0.5">{categoryLabel} <span className="opacity-50 mx-1">•</span> {formatRelativeDate(txn.date)}</TypographyP>
                  </div>
                  <TypographyP className={cn("text-base font-black tabular-money flex-shrink-0", color)}>{sign}{symbol}{txn.amount.toLocaleString()}</TypographyP>
                </div>
              );
            })}
            {profileTxns.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-[20px] bg-surface-2/40 border border-white/[0.03] flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
                  <CircleDashed className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <TypographyP className="text-sm font-bold text-foreground tracking-tight">No transactions yet</TypographyP>
                <TypographyP className="text-[11px] font-medium text-muted-foreground/60 mt-1">This profile has no activity</TypographyP>
              </div>
            )}
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
