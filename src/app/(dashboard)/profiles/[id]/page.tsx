"use client";

import { useParams } from "next/navigation";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
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
    <div className="mx-auto max-w-4xl space-y-6">
      <BlurFade delay={0}>
        <Link href="/profiles" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Profiles
        </Link>

        <MagicCard className="p-6" gradientColor={profile.color} gradientOpacity={0.1}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: profile.color + "20" }}>
                <Icon className="h-8 w-8" style={{ color: profile.color }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-heading">{profile.name}</h1>
                <span className="inline-flex items-center rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-text-muted mt-1">{profileType?.emoji} {profileType?.label}</span>
                {profile.description && <p className="text-sm text-text-muted mt-1">{profile.description}</p>}
              </div>
            </div>
            <button className="rounded-lg bg-white/[0.05] p-2 text-text-muted hover:bg-white/[0.08] transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="text-3xl font-bold text-text-primary tabular-nums mb-6">
            {symbol} <NumberTicker value={profile.balance} decimalPlaces={2} duration={800} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-income/5 border border-income/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="text-xs text-income/70 font-medium uppercase tracking-wider">Income This Month</span>
              </div>
              <p className="text-xl font-bold text-income tabular-nums">{symbol} {monthIncome.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-expense/5 border border-expense/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="text-xs text-expense/70 font-medium uppercase tracking-wider">Expense This Month</span>
              </div>
              <p className="text-xl font-bold text-expense tabular-nums">{symbol} {monthExpense.toLocaleString()}</p>
            </div>
          </div>
        </MagicCard>
      </BlurFade>

      {/* Transaction History */}
      <BlurFade delay={0.1}>
        <div className="rounded-xl border border-white/[0.08] bg-background-card p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Transaction History</h2>
          <div className="space-y-1">
            {profileTxns.slice(0, 20).map(txn => {
              const cat = getCategoryById(txn.category);
              const CatIcon = cat ? getIcon(cat.icon) : LucideIcons.CircleDot;
              const color = txn.type === "INCOME" ? "text-income" : txn.type === "EXPENSE" ? "text-expense" : "text-transfer";
              const sign = txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "-" : "";
              return (
                <div key={txn.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: (cat?.color || "#64748B") + "18" }}>
                    <CatIcon className="h-4 w-4" style={{ color: cat?.color || "#64748B" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{txn.title}</p>
                    <p className="text-xs text-text-muted">{cat?.label || txn.category} • {formatRelativeDate(txn.date)}</p>
                  </div>
                  <p className={cn("text-sm font-semibold tabular-nums", color)}>{sign}{symbol} {txn.amount.toLocaleString()}</p>
                </div>
              );
            })}
            {profileTxns.length === 0 && <p className="text-center py-8 text-sm text-text-muted">No transactions for this profile yet</p>}
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
