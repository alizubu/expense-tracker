"use client";

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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your wallets and accounts</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
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
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }}
              className="h-full"
            >
              <CardContainer className="inter-var w-full h-full" containerClassName="py-0 h-full">
                <CardBody className={`relative group/card p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-primary/5 transition-shadow duration-300 h-full min-h-[260px] border rounded-2xl ${profile.isDefault ? 'border-primary/30 bg-primary/[0.02]' : 'border-white/[0.04] bg-surface-1 shadow-sm'}`}>
                  {profile.isDefault && (
                    <CardItem translateZ={20} className="absolute top-4 right-4 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary tracking-wide">
                      Default
                    </CardItem>
                  )}
                  
                  <div>
                    <CardItem translateZ={30} className="flex items-start gap-4 mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 shadow-sm" style={{ backgroundColor: profile.color + "15" }}>
                        <Icon className="h-6 w-6" style={{ color: profile.color }} />
                      </div>
                      <div className="min-w-0 flex-1 mt-1">
                        <h3 className="text-base font-semibold text-foreground truncate">{profile.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground mt-1 tracking-wide">
                          {profileType?.label || "General"}
                        </span>
                      </div>
                    </CardItem>

                    <CardItem translateZ={40} className="text-3xl font-bold text-foreground tracking-tight tabular-money mb-6">
                      {symbol}{profile.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                    </CardItem>

                    <CardItem translateZ={20} className="flex items-center gap-6 mb-6 border-t border-white/[0.04] pt-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground font-semibold tabular-money truncate">{symbol}{monthIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <TrendingDown className="h-4 w-4 text-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground font-semibold tabular-money truncate">{symbol}{monthExpense.toLocaleString()}</span>
                      </div>
                    </CardItem>
                  </div>

                  <CardItem translateZ={20} className="grid grid-cols-[1fr_auto_auto] gap-2 pt-4 border-t border-white/[0.04] mt-auto w-full">
                    <Link href={`/profiles/${profile.id}`} className="w-full">
                      <Button variant="outline" className="w-full h-9 border-white/[0.04] bg-surface-2 hover:bg-surface-3 transition-colors">
                        <Eye className="h-4 w-4 mr-2" /> Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-white/[0.04] bg-surface-2 hover:bg-surface-3 transition-colors" onClick={() => setEditProfileId(profile.id)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-white/[0.04] bg-surface-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" onClick={() => triggerDeleteConfirm(profile.id, profile.name)}>
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
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 + profiles.length * 0.05, duration: 0.3 }}
          className="h-full"
        >
          <CardContainer className="inter-var w-full h-full" containerClassName="py-0 h-full">
            <CardBody 
              className="relative group/card p-6 flex flex-col items-center justify-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full min-h-[260px] border border-dashed border-white/[0.1] bg-surface-1/30 hover:border-primary/30 hover:bg-primary/5 rounded-2xl"
            >
              <CardItem 
                as="button" 
                onClick={() => setShowCreateModal(true)} 
                translateZ={30} 
                className="flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover/card:text-primary w-full h-full cursor-pointer"
              >
                <Plus className="h-8 w-8 transition-transform group-hover/card:scale-110" />
                <span className="text-sm font-semibold tracking-wide">Add New Profile</span>
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
