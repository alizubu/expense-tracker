"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/magicui/number-ticker";
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
        <p className="text-text-muted">Profile not found</p>
        <Link href="/profiles" className="mt-3 text-sm text-brand-purple-light hover:text-brand-purple">← Back to Profiles</Link>
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
    <div className="mx-auto max-w-[1400px] w-full px-3 py-3 pb-20 md:px-5 md:py-5 md:pb-6 space-y-4 md:space-y-6">
      <BlurFade delay={0}>
        <div className="flex items-center justify-between mb-4">
          <Link href="/profiles" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Profiles
          </Link>
        </div>

        <Card className={`relative p-6 border ${profile.isDefault ? 'border-brand-purple/50 bg-brand-purple/[0.01]' : 'border-border bg-card'} hover:shadow-md transition-all duration-200`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0" style={{ backgroundColor: profile.color + "15" }}>
                <Icon className="h-7 w-7" style={{ color: profile.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-heading truncate">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center rounded-full bg-white/[0.04] dark:bg-white/[0.04] px-2.5 py-0.5 text-xs text-text-muted border border-border/40 font-medium">{profileType?.emoji} {profileType?.label}</span>
                  {profile.isDefault && (
                    <span className="inline-flex items-center rounded-full bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 text-xs font-bold text-brand-purple">Default</span>
                  )}
                </div>
                {profile.description && <p className="text-xs md:text-sm text-text-muted mt-2">{profile.description}</p>}
              </div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="rounded-xl border border-border bg-white/[0.04] dark:bg-white/[0.04] p-2.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.08] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight font-mono mb-6 flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-semibold">{symbol}</span>
            <NumberTicker value={profile.balance} decimalPlaces={2} duration={800} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-5">
            <div className="rounded-2xl bg-income/5 border border-income/10 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="text-[10px] text-income/70 font-semibold uppercase tracking-wider">Income This Month</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-income font-mono">{symbol} {monthIncome.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-expense/5 border border-expense/10 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-[10px] text-expense/70 font-semibold uppercase tracking-wider">Expense This Month</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-expense font-mono">{symbol} {monthExpense.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </BlurFade>

      {/* Transaction History */}
      <BlurFade delay={0.1}>
        <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Transaction History</h2>
          <div className="divide-y divide-border/20">
            {profileTxns.slice(0, 20).map(txn => {
              const cat = getCategoryById(txn.category);
              const CatIcon = cat ? getIcon(cat.icon) : LucideIcons.CircleDot;
              const color = txn.type === "INCOME" ? "text-income" : txn.type === "EXPENSE" ? "text-expense" : "text-transfer";
              const sign = txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "-" : "";
              return (
                <div key={txn.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-white/[0.01] transition-colors rounded-lg px-1">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: (cat?.color || "#64748B") + "15" }}>
                    <CatIcon className="h-4 w-4" style={{ color: cat?.color || "#64748B" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-bold text-text-primary truncate">{txn.title}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{cat?.label || txn.category} • {formatRelativeDate(txn.date)}</p>
                  </div>
                  <p className={cn("text-xs md:text-sm font-bold font-mono flex-shrink-0", color)}>{sign}{symbol}{txn.amount.toLocaleString()}</p>
                </div>
              );
            })}
            {profileTxns.length === 0 && <p className="text-center py-10 text-xs font-semibold text-text-muted">No transactions for this profile yet</p>}
          </div>
        </div>
      </BlurFade>

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
