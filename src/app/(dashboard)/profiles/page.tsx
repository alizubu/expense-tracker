"use client";

import { useState } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getProfileType, PROFILE_TYPES } from "@/lib/profiles";
import { cn, generateId } from "@/lib/utils";
import { Plus, X, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

const PRESET_COLORS = [
  "#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#EC4899", "#06B6D4", "#F97316", "#22C55E", "#8B5CF6",
  "#A78BFA", "#64748B",
];

export default function ProfilesPage() {
  const { profiles, addProfile, deleteProfile } = useProfileStore();
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("MONEYBAG");
  const [newColor, setNewColor] = useState("#7C3AED");
  const [newBalance, setNewBalance] = useState(0);
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = () => {
    if (!newName) { toast.error("Profile name is required"); return; }
    const profileType = getProfileType(newType);
    addProfile({
      name: newName,
      type: newType as any,
      icon: profileType?.icon || "Wallet",
      color: newColor,
      balance: newBalance,
      description: newDescription || undefined,
      isDefault: profiles.length === 0,
      sortOrder: profiles.length,
    });
    toast.success(`Profile "${newName}" created!`);
    setShowCreateModal(false);
    setNewName(""); setNewBalance(0); setNewDescription("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BlurFade delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-heading">Profiles</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your wallets and accounts</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-lg bg-brand-purple/15 px-4 py-2.5 text-sm font-medium text-brand-purple-light hover:bg-brand-purple/25 transition-colors">
            <Plus className="h-4 w-4" /> New Profile
          </button>
        </div>
      </BlurFade>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile, index) => {
          const profileType = getProfileType(profile.type);
          const Icon = getIcon(profile.icon);
          const now = new Date();
          const monthTxns = transactions.filter(t => t.profileId === profile.id && new Date(t.date).getMonth() === now.getMonth());
          const monthIncome = monthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
          const monthExpense = monthTxns.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

          return (
            <BlurFade key={profile.id} delay={0.05 + index * 0.05}>
              <MagicCard className="relative p-5" gradientColor={profile.color} gradientOpacity={0.1}>
                {profile.isDefault && <BorderBeam colorFrom={profile.color} colorTo={profile.color + "80"} />}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: profile.color + "20" }}>
                      <Icon className="h-6 w-6" style={{ color: profile.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{profile.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-text-muted">{profileType?.label}</span>
                    </div>
                  </div>
                  {profile.isDefault && <span className="rounded-full bg-brand-purple/15 px-2 py-0.5 text-[10px] font-medium text-brand-purple-light">Default</span>}
                </div>

                <p className="text-2xl font-bold text-text-primary tabular-nums mb-4">
                  {symbol} {profile.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-income" />
                    <span className="text-xs text-text-secondary">{symbol} {monthIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-expense" />
                    <span className="text-xs text-text-secondary">{symbol} {monthExpense.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/profiles/${profile.id}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] py-2 text-xs text-text-secondary hover:bg-white/[0.08] transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Link>
                </div>
              </MagicCard>
            </BlurFade>
          );
        })}

        {/* Add Profile Card */}
        <BlurFade delay={0.05 + profiles.length * 0.05}>
          <button onClick={() => setShowCreateModal(true)} className="flex h-full min-h-[200px] w-full items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]">
            <div className="flex flex-col items-center gap-2 text-text-muted">
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Add New Profile</span>
            </div>
          </button>
        </BlurFade>
      </div>

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-2xl border border-white/[0.08] bg-background-secondary p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-text-primary">Create Profile</h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-text-muted hover:bg-white/[0.05]"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Main Wallet" className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {PROFILE_TYPES.map(pt => (
                    <button key={pt.type} onClick={() => { setNewType(pt.type); setNewColor(pt.color); }} className={cn("flex flex-col items-center gap-1 rounded-lg p-2 transition-all", newType === pt.type ? "bg-white/[0.08] ring-1 ring-brand-purple/30" : "bg-white/[0.02] hover:bg-white/[0.04]")}>
                      <span className="text-lg">{pt.emoji}</span>
                      <span className="text-[9px] text-text-muted leading-tight text-center">{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} className={cn("h-7 w-7 rounded-full transition-all", newColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-background-secondary scale-110" : "hover:scale-105")} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Starting Balance</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">{symbol}</span>
                  <NumericFormat value={newBalance || ""} onValueChange={v => setNewBalance(v.floatValue || 0)} thousandSeparator="," decimalScale={2} placeholder="0.00" className="flex-1 rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none tabular-nums" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Description (optional)</label>
                <input type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="A brief description..." className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none" />
              </div>

              <ShimmerButton onClick={handleCreate} className="w-full py-3"><Plus className="h-4 w-4" /> Create Profile</ShimmerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
