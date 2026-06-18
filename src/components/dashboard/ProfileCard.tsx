"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { useProfileStore } from "@/store/useProfileStore";
import { EditProfileModal } from "@/components/profiles/EditProfileModal";
import { toast } from "sonner";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

interface ProfileCardProps {
  profile: any;
  netBalance: number;
}

export function ProfileCard({ profile, netBalance }: ProfileCardProps) {
  const Icon = getIcon(profile.icon);
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
        whileHover={{ y: -1 }}
        className="flex flex-col justify-between h-[140px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 hover:border-[var(--border-default)] transition-all duration-150 relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[var(--accent-light)]">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[14px] font-medium text-[var(--text-primary)]">
              {profile.name}
            </span>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-36 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] shadow-lg py-1 z-10"
                >
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[14px] text-[var(--text-muted)]">৳</span>
            <NumberTicker
              value={profile.balance}
              className="font-mono text-[24px] font-semibold text-[var(--text-primary)] tracking-tight"
              decimalPlaces={0}
              duration={1.2}
            />
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="h-1 w-full rounded-sm bg-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-sm"
              style={{
                width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                background: "linear-gradient(to right, var(--accent), var(--accent-light))",
              }}
            />
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
