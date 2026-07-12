"use client";
import { TypographySpan, TypographyH1, TypographyP, TypographyH3 } from "@/components/ui/typography";

import { useState } from "react";
import { motion } from "framer-motion";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
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
import { Button } from "@/components/ui/button";


function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-[1600px] mx-auto w-full relative">
      {/* Ambient Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <TypographyH1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">Profiles</TypographyH1>
          <TypographyP className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">Manage your wallets and financial accounts</TypographyP>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" /> New Profile
        </Button>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile, index) => {
          const profileType = getProfileType(profile.type);
          const Icon = getIcon(profile.icon);
          const now = new Date();
          const monthTxns = transactions.filter(t => t.profileId === profile.id && new Date(t.date).getMonth() === now.getMonth());
          const monthIncome = monthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
          const monthExpense = monthTxns.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

          return (
            <motion.div
              key={profile.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 + index * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="h-full relative z-10 group/profile"
            >
              <CardContainer className="inter-var w-full h-full" containerClassName="py-0 h-full">
                <CardBody className={`relative p-7 flex flex-col justify-between transition-all duration-500 h-full min-h-[300px] rounded-[32px] overflow-hidden ${profile.isDefault ? 'border-primary/30 bg-surface-1/60 shadow-[0_0_40px_rgba(var(--primary),0.1)]' : 'border-white/[0.08] bg-surface-1/40 hover:bg-surface-1/60 hover:border-white/[0.12] hover:shadow-2xl'}`}>
                  {/* Background mesh/glow for card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-700 group-hover/profile:opacity-40 group-hover/profile:scale-150" style={{ backgroundColor: profile.color }} />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <CardItem translateZ={30} className="flex h-14 w-14 items-center justify-center rounded-[18px] flex-shrink-0 shadow-lg border border-white/[0.05] backdrop-blur-md" style={{ backgroundColor: profile.color + "20" }}>
                        <Icon className="h-7 w-7" style={{ color: profile.color }} />
                      </CardItem>

                      {profile.isDefault && (
                        <CardItem translateZ={20} className="rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 text-[11px] font-bold text-primary tracking-widest uppercase shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                          Default
                        </CardItem>
                      )}
                    </div>

                    <CardItem translateZ={40} className="mb-6">
                      <TypographyH3 className="text-xl font-bold text-foreground tracking-tight mb-1">{profile.name}</TypographyH3>
                      <TypographySpan className="text-[12px] font-medium text-muted-foreground/80 tracking-wide uppercase">
                        {profileType?.label || "General"}
                      </TypographySpan>
                    </CardItem>

                    <CardItem translateZ={50} className="mb-8">
                      <TypographySpan className="text-sm font-medium text-muted-foreground block mb-1">Balance</TypographySpan>
                      <div className="text-4xl font-black text-foreground tracking-tighter tabular-money drop-shadow-sm">
                        {symbol}{profile.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </div>
                    </CardItem>

                    <CardItem translateZ={30} className="flex items-center gap-6 mb-8 p-4 rounded-2xl bg-surface-2/30 border border-white/[0.03] backdrop-blur-sm">
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <TypographySpan className="text-[10px] font-bold uppercase tracking-widest">Income</TypographySpan>
                        </div>
                        <TypographySpan className="text-sm font-bold text-foreground tabular-money truncate">{symbol}{monthIncome.toLocaleString()}</TypographySpan>
                      </div>
                      <div className="w-px h-8 bg-white/[0.06]" />
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <TrendingDown className="h-3.5 w-3.5" />
                          <TypographySpan className="text-[10px] font-bold uppercase tracking-widest">Expense</TypographySpan>
                        </div>
                        <TypographySpan className="text-sm font-bold text-foreground tabular-money truncate">{symbol}{monthExpense.toLocaleString()}</TypographySpan>
                      </div>
                    </CardItem>
                  </div>

                  <CardItem translateZ={20} className="grid grid-cols-[1fr_auto_auto] gap-3 mt-auto w-full relative z-10">
                    <Link href={`/profiles/${profile.id}`} className="w-full">
                      <Button className="w-full h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-foreground border border-white/[0.05] shadow-sm transition-all">
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </Button>
                    </Link>
                    <Button size="icon" className="h-11 w-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-foreground border border-white/[0.05] shadow-sm transition-all" onClick={() => setEditProfileId(profile.id)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="h-11 w-11 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive border border-destructive/20 shadow-sm transition-all" onClick={() => triggerDeleteConfirm(profile.id, profile.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </motion.div>
          );
        })}

        {/* Add Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 + profiles.length * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="h-full relative z-10"
        >
          <CardContainer className="inter-var w-full h-full" containerClassName="py-0 h-full">
            <CardBody
              className="relative group/card p-6 flex flex-col items-center justify-center hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all duration-500 h-full min-h-[300px] rounded-[32px] border-2 border-dashed border-white/[0.1] bg-surface-1/10 hover:border-primary/40 hover:bg-primary/5 cursor-pointer backdrop-blur-xl"
              onClick={() => setShowCreateModal(true)}
            >
              <CardItem
                translateZ={30}
                className="flex flex-col items-center justify-center gap-4 text-muted-foreground group-hover/card:text-primary w-full h-full"
              >
                <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] group-hover/card:bg-primary/10 group-hover/card:border-primary/30 flex items-center justify-center transition-all duration-500 group-hover/card:scale-110 shadow-lg">
                  <Plus className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <TypographySpan className="text-base font-bold tracking-tight block text-foreground group-hover/card:text-primary transition-colors">Add New Profile</TypographySpan>
                  <TypographySpan className="text-xs font-medium text-muted-foreground/60 mt-1">Create a new wallet</TypographySpan>
                </div>
              </CardItem>
            </CardBody>
          </CardContainer>
        </motion.div>
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
