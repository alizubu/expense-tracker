"use client";

import { useState, useEffect } from "react";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { useProfileStore } from "@/store/useProfileStore";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  if (!profile) return null;

  const handleTypeSelect = (type: (typeof PROFILE_TYPES)[number]) => {
    setSelectedType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit Profile" className="md:max-w-[500px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Type Selector */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary select-none mb-2.5 block">
            Wallet Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PROFILE_TYPES.map((p) => (
              <button
                type="button"
                key={p.type}
                onClick={() => handleTypeSelect(p)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                  selectedType.type === p.type
                    ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                    : "border-border hover:border-text-muted hover:bg-card-hover text-text-secondary"
                }`}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[10px] font-bold leading-tight truncate w-full">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Name */}
        <Input
          label="Profile Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        {/* Description */}
        <Input
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={!name.trim()}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
