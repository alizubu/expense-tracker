"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { useProfileStore } from "@/store/useProfileStore";
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
}

export function EditProfileModal({ open, onClose, profileId }: EditProfileModalProps) {
  const { profiles, updateProfile } = useProfileStore();
  const profile = profiles.find((p) => p.id === profileId);

  const [selectedType, setSelectedType] = useState<(typeof PROFILE_TYPES)[number]>(PROFILE_TYPES[0]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile && open) {
      setName(profile.name);
      setDescription(profile.description || "");
      const matchedType = PROFILE_TYPES.find((p) => p.type === profile.type) || PROFILE_TYPES[0];
      setSelectedType(matchedType);
    }
  }, [profile, open]);

  if (!open || !profile) return null;

  const handleTypeSelect = (type: (typeof PROFILE_TYPES)[number]) => {
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter a profile name.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(profile.id, {
        name: name.trim(),
        type: selectedType.type as any,
        icon: selectedType.icon,
        color: selectedType.color,
        description: description.trim() || undefined,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Edit Profile</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
            <div>
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-3 block">Wallet Type</label>
              <div className="grid grid-cols-4 gap-2">
                {PROFILE_TYPES.map((p) => (
                  <button
                    key={p.type}
                    onClick={() => handleTypeSelect(p)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                      selectedType.type === p.type
                        ? "border-[var(--accent)] bg-[var(--accent-glow)]"
                        : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-[11px] text-[var(--text-primary)] font-medium leading-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-2 block">
                Profile Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-2 block">
                Description <span className="text-[var(--text-muted)] text-[11px]">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {error && (
              <div className="bg-[var(--red-dim)] border border-red-500/20 rounded-[var(--radius-sm)] px-4 py-3 text-red-400 text-[12px]">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-sm)] transition-all text-[13px] font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="flex-1 h-10 bg-[var(--accent)] hover:bg-[#6D28D9] text-white font-medium rounded-[var(--radius-sm)] transition-all text-[13px] shadow-[0_0_20px_var(--accent-glow)] flex items-center justify-center disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
