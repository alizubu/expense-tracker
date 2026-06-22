"use client";

import { useState } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Card } from "@/components/ui/card";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getProfileType } from "@/lib/profiles";
import { Plus, Eye, Edit2, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

import { CreateProfileModal } from "@/components/profiles/CreateProfileModal";
import { EditProfileModal } from "@/components/profiles/EditProfileModal";
import { ConfirmDialog } from "@/components/ui/dialog";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || Wallet;
}

export default function ProfilesPage() {
  const { profiles, deleteProfile } = useProfileStore();
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProfileId, setEditProfileId] = useState<string | null>(null);
  
  // State for confirm dialog delete
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [deleteProfileName, setDeleteProfileName] = useState<string>("");

  const triggerDeleteConfirm = (id: string, name: string) => {
    setDeleteProfileId(id);
    setDeleteProfileName(name);
  };

  return (
    <div className="mx-auto max-w-[1400px] w-full px-3 py-3 pb-20 md:px-5 md:py-5 md:pb-6 space-y-4 md:space-y-6">
      <BlurFade delay={0}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-heading">Profiles</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your wallets and accounts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-purple hover:bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm shadow-violet-500/10 cursor-pointer animate-fade-in"
          >
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
              <Card className={`relative p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 h-full border ${profile.isDefault ? 'border-brand-purple/50 bg-brand-purple/[0.01]' : 'border-border bg-card'}`}>
                {profile.isDefault && (
                  <div className="absolute top-3 right-3 rounded-full bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 text-[9px] font-bold text-brand-purple">
                    Default
                  </div>
                )}
                
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: profile.color + "15" }}>
                      <Icon className="h-5 w-5" style={{ color: profile.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-text-primary truncate">{profile.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-white/[0.04] dark:bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-text-muted border border-border/40 mt-1">
                        {profileType?.label || "General"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xl md:text-2xl font-bold text-text-primary tracking-tight font-mono mb-4">
                    {symbol}{profile.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </p>

                  <div className="flex items-center gap-4 mb-5 border-t border-border/20 pt-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TrendingUp className="h-3.5 w-3.5 text-income flex-shrink-0" />
                      <span className="text-[11px] text-text-secondary font-semibold font-mono truncate">{symbol}{monthIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TrendingDown className="h-3.5 w-3.5 text-expense flex-shrink-0" />
                      <span className="text-[11px] text-text-secondary font-semibold font-mono truncate">{symbol}{monthExpense.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border/20 pt-3 mt-auto">
                  <Link href={`/profiles/${profile.id}`} className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] hover:bg-white/[0.08] dark:hover:bg-white/[0.08] border border-border/45 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all">
                    <Eye className="h-3.5 w-3.5" /> Details
                  </Link>
                  <button onClick={() => setEditProfileId(profile.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] dark:bg-white/[0.04] hover:bg-white/[0.08] dark:hover:bg-white/[0.08] border border-border/45 text-text-secondary hover:text-text-primary transition-all cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => triggerDeleteConfirm(profile.id, profile.name)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 hover:text-red-600 transition-all cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            </BlurFade>
          );
        })}

        {/* Add Profile Card */}
        <BlurFade delay={0.05 + profiles.length * 0.05}>
          <button onClick={() => setShowCreateModal(true)} className="group flex h-full min-h-[220px] w-full items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 transition-all duration-200 hover:border-brand-purple hover:bg-white/[0.02] cursor-pointer">
            <div className="flex flex-col items-center gap-2 text-text-muted group-hover:text-brand-purple">
              <Plus className="h-7 w-7 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold">Add New Profile</span>
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

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteProfileId}
        onClose={() => {
          setDeleteProfileId(null);
          setDeleteProfileName("");
        }}
        onConfirm={async () => {
          if (!deleteProfileId) return;
          try {
            await deleteProfile(deleteProfileId);
            toast.success("Profile deleted successfully");
          } catch (err) {
            toast.error("Failed to delete profile");
          }
        }}
        title="Delete Profile"
        description={`Are you sure you want to delete "${deleteProfileName}"? This will permanently delete this profile and cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
