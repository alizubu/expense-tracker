"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { useProfileStore } from "@/store/useProfileStore";
import { toast } from "sonner";

interface CreateProfileModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateProfileModal({ open, onClose, onCreated }: CreateProfileModalProps) {
  const { addProfile } = useProfileStore();
  const [selectedType, setSelectedType] = useState<(typeof PROFILE_TYPES)[number]>(PROFILE_TYPES[0]);
  const [name, setName] = useState<string>(PROFILE_TYPES[0].label);
  const [balance, setBalance] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleTypeSelect = (type: (typeof PROFILE_TYPES)[number]) => {
    setSelectedType(type);
    if (!name || PROFILE_TYPES.some((p) => p.label === name)) {
      setName(type.label);
    }
  };

  const handleSubmit = async () => {
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
      setError(err.message || "Network error. Please check your connection.");
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
                        rounded-[var(--radius-xl)] shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Add New Profile</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Profile Type Selector */}
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

            {/* Profile Name */}
            <div>
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-2 block">
                Profile Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. My ${selectedType.label}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* Starting Balance */}
            <div>
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-2 block">Starting Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium">৳</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  min="0"
                  className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] pl-8 pr-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">Enter how much you currently have in this wallet</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-2 block">
                Description <span className="text-[var(--text-muted)] text-[11px]">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dutch-Bangla Bank account"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* Preview */}
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--border-subtle)]">
              <p className="text-[11px] text-[var(--text-muted)] mb-2 uppercase tracking-wider font-semibold">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: selectedType.color + "22" }}
                >
                  {selectedType.emoji}
                </div>
                <div>
                  <p className="text-[14px] text-[var(--text-primary)] font-medium">{name || selectedType.label}</p>
                  <p className="text-[var(--text-secondary)] text-[12px]">৳ {parseFloat(balance || "0").toLocaleString("en-US")}</p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[var(--red-dim)] border border-[rgba(244,63,94,0.2)] rounded-[var(--radius-sm)] px-4 py-3 text-[var(--red)] text-[12px]">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={handleClose}
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
