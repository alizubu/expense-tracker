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
import { Plus, X, TrendingUp, TrendingDown, Eye, Edit2, Trash2 } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import { EditProfileModal } from "@/components/profiles/EditProfileModal";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

export default function ProfilesPage() {
  const { profiles, deleteProfile } = useProfileStore();
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProfileId, setEditProfileId] = useState<string | null>(null);

  const handleDeleteProfile = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteProfile(id);
        toast.success("Profile deleted successfully");
      } catch (err) {
        toast.error("Failed to delete profile");
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BlurFade delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-heading">Profiles</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your wallets and accounts</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-lg bg-[var(--accent-glow)] px-4 py-2.5 text-sm font-medium text-[var(--accent)] dark:text-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white transition-colors">
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
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">{profile.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-hover)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">{profileType?.label}</span>
                    </div>
                  </div>
                  {profile.isDefault && <span className="rounded-full bg-[var(--accent-glow)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)] dark:text-[var(--accent-light)]">Default</span>}
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
                  <Link href={`/profiles/${profile.id}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--bg-hover)] py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Link>
                  <button onClick={() => setEditProfileId(profile.id)} className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDeleteProfile(profile.id, profile.name)} className="flex items-center justify-center p-2 rounded-lg bg-[var(--red-dim)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </MagicCard>
            </BlurFade>
          );
        })}

        {/* Add Profile Card */}
        <BlurFade delay={0.05 + profiles.length * 0.05}>
          <button onClick={() => setShowCreateModal(true)} className="group flex h-full min-h-[200px] w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]">
            <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] group-hover:text-[var(--accent)]">
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Add New Profile</span>
            </div>
          </button>
        </BlurFade>
      </div>

      <CreateProfileModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editProfileId && (
        <EditProfileModal
          open={!!editProfileId}
          profileId={editProfileId}
          onClose={() => setEditProfileId(null)}
        />
      )}
    </div>
  );
}
