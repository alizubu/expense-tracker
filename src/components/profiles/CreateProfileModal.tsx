"use client";

import { useState } from "react";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateProfileModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateProfileModal({ open, onClose, onCreated }: CreateProfileModalProps) {
  const { addProfile } = useProfileStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const [selectedType, setSelectedType] = useState<(typeof PROFILE_TYPES)[number]>(PROFILE_TYPES[0]);
  const [name, setName] = useState<string>(PROFILE_TYPES[0].label);
  const [balance, setBalance] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTypeSelect = (type: (typeof PROFILE_TYPES)[number]) => {
    setSelectedType(type);
    if (!name || PROFILE_TYPES.some((p) => p.label === name)) {
      setName(type.label);
    }
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
      await addProfile({
        name: name.trim(),
        type: selectedType.type as any,
        icon: selectedType.icon,
        color: selectedType.color,
        balance: parseFloat(balance) || 0,
        description: description.trim() || undefined,
        isDefault: false,
        sortOrder: 0,
      });

      toast.success("Profile created successfully!");

      // Success — reset and close
      setName(PROFILE_TYPES[0].label);
      setBalance("");
      setDescription("");
      setSelectedType(PROFILE_TYPES[0]);
      setError("");
      onClose();
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName(PROFILE_TYPES[0].label);
    setBalance("");
    setDescription("");
    setError("");
    setSelectedType(PROFILE_TYPES[0]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Add New Profile" className="md:max-w-[500px]">
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
          placeholder={`e.g. My ${selectedType.label}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        {/* Starting Balance */}
        <Input
          label="Starting Balance"
          type="number"
          placeholder="0.00"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          min="0"
          step="any"
          disabled={loading}
          leftIcon={<span className="text-xs font-semibold text-text-muted font-mono">{symbol}</span>}
        />

        {/* Description */}
        <Input
          label="Description (Optional)"
          placeholder="e.g. Personal savings account"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        {/* Preview */}
        <div className="bg-card-elevated/40 rounded-xl p-3.5 border border-border/40">
          <p className="text-[10px] text-text-muted mb-2 uppercase tracking-wider font-bold">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: selectedType.color + "15" }}
            >
              {selectedType.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary truncate">{name || selectedType.label}</p>
              <p className="text-text-secondary font-semibold font-mono text-xs mt-0.5">
                {symbol}{parseFloat(balance || "0").toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

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
            onClick={handleClose}
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
            Create Profile
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
