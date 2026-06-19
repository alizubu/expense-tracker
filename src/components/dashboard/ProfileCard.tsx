"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { useProfileStore } from "@/store/useProfileStore";
import { EditProfileModal } from "@/components/profiles/EditProfileModal";
import { toast } from "sonner";

function getProfileIcon(type: string, iconStr: string) {
  const typeUpper = type?.toUpperCase();
  if (typeUpper === "CASH" || typeUpper === "Cash") return LucideIcons.Banknote;
  if (typeUpper === "BANK_ACCOUNT" || typeUpper === "Bank Account") return LucideIcons.Building2;
  if (iconStr && (LucideIcons as Record<string, any>)[iconStr]) {
    return (LucideIcons as Record<string, any>)[iconStr];
  }
  return LucideIcons.Wallet;
}

interface ProfileCardProps {
  profile: any;
  netBalance: number;
}

export function ProfileCard({ profile, netBalance }: ProfileCardProps) {
  const Icon = getProfileIcon(profile.type, profile.icon);
  const percentage = netBalance > 0 ? (profile.balance / netBalance) * 100 : 0;
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteProfile } = useProfileStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${profile.name}?`)) {
      try {
        await deleteProfile(profile.id);
        toast.success("Profile deleted successfully");
      } catch (err) {
        toast.error("Failed to delete profile");
      }
    }
    setMenuOpen(false);
  };

  return (
    <>
      <motion.div
        className="flex flex-col h-[180px] bg-[#FFFFFF] rounded-[14px] cursor-pointer relative"
        style={{
          border: "1px solid rgba(0,0,0,0.07)",
          padding: "18px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          transition: "all 160ms ease"
        }}
        whileHover={{
          y: -2,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.06)",
          borderColor: "rgba(0,0,0,0.10)"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[rgba(124,58,237,0.10)] text-[#7C3AED]">
              <Icon className="h-[18px] w-[18px]" />
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#9CA3AF] hover:text-[#111111] transition-colors p-1"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-36 bg-[#FFFFFF] border border-[rgba(0,0,0,0.10)] rounded-[8px] shadow-lg py-1 z-10"
                >
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] flex items-center gap-2"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-[14px]">
          <div className="text-[12px] font-medium text-[#6B7280] mb-1">
            {profile.name}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[16px] font-medium text-[#6B7280]">৳</span>
            <NumberTicker
              value={profile.balance}
              className="font-mono text-[28px] font-bold text-[#111111] tracking-tight"
              decimalPlaces={0}
              duration={1.2}
            />
          </div>
        </div>

        <div className="mt-auto pt-[14px]">
          <div className="h-[6px] w-full rounded-[3px] bg-[#F3F4F6] overflow-hidden">
            <div
              className="h-[6px] rounded-[3px]"
              style={{
                width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
              }}
            />
          </div>
          <div className="mt-2 text-right text-[11px] text-[#9CA3AF]">
            {percentage.toFixed(1)}% of total
          </div>
        </div>
      </motion.div>

      <EditProfileModal 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        profileId={profile.id} 
      />
    </>
  );
}
