"use client";
import { TypographyLabel, TypographySpan, TypographyP } from "@/components/ui/typography";

import { useState } from "react";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Type Selector */}
          <div>
            <TypographyLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none mb-2.5 block">
              Wallet Type
            </TypographyLabel>
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
                  <TypographySpan className="text-xl">{p.emoji}</TypographySpan>
                  <TypographySpan className="text-[10px] font-bold leading-tight truncate w-full">{p.label}</TypographySpan>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Name */}
          <div className="space-y-1.5">
            <TypographyLabel className="text-sm font-semibold text-foreground">Profile Name</TypographyLabel>
            <Input
              placeholder={`e.g. My ${selectedType.label}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Starting Balance */}
          <div className="space-y-1.5">
            <TypographyLabel className="text-sm font-semibold text-foreground">Starting Balance</TypographyLabel>
            <div className="relative">
              <TypographySpan className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground font-mono">
                {symbol}
              </TypographySpan>
              <Input
                type="number"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                min="0"
                step="any"
                disabled={loading}
                className="pl-8"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <TypographyLabel className="text-sm font-semibold text-foreground">Description (Optional)</TypographyLabel>
            <Input
              placeholder="e.g. Personal savings account"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <TypographyP className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-bold">Preview</TypographyP>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: selectedType.color + "15" }}
              >
                {selectedType.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <TypographyP className="text-sm font-bold text-foreground truncate">{name || selectedType.label}</TypographyP>
                <TypographyP className="text-muted-foreground font-semibold font-mono text-xs mt-0.5">
                  {symbol}{parseFloat(balance || "0").toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </TypographyP>
              </div>
            </div>
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
              onClick={handleClose}
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
              Create Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
