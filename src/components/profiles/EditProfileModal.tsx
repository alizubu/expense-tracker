"use client";

import { useState, useEffect } from "react";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { useProfileStore } from "@/store/useProfileStore";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Type Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none mb-2.5 block">
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
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-[10px] font-bold leading-tight truncate w-full">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Profile Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Description (Optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-xs font-medium">
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
              variant="default"
              disabled={!name.trim() || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
