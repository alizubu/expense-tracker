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
  const [name, setName] = useState("");
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
        icon: selectedType.emoji, // The prompt's API expects emoji to be sent as icon
        color: selectedType.color,
        balance: parseFloat(balance) || 0,
        description: description.trim() || undefined,
        isDefault: false,
        sortOrder: 0,
      });

      toast.success("Profile created successfully!");

      // Success — reset and close
      setName("");
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
    setName("");
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#16161E] border border-white/10
                        rounded-2xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Add New Profile</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Profile Type Selector */}
            <div>
              <label className="text-sm text-slate-400 mb-3 block">Wallet Type</label>
              <div className="grid grid-cols-4 gap-2">
                {PROFILE_TYPES.map((p) => (
                  <button
                    key={p.type}
                    onClick={() => handleTypeSelect(p)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                      selectedType.type === p.type
                        ? "border-brand-purple bg-brand-purple/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-xs text-white font-medium leading-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Name */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Profile Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. My ${selectedType.label}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1C1C27] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-purple transition"
              />
            </div>

            {/* Starting Balance */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Starting Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">৳</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  min="0"
                  className="w-full bg-[#1C1C27] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-purple transition"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter how much you currently have in this wallet</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Description <span className="text-slate-600 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dutch-Bangla Bank account"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1C1C27] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-purple transition"
              />
            </div>

            {/* Preview */}
            <div className="bg-[#1C1C27] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-500 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: selectedType.color + "22" }}
                >
                  {selectedType.emoji}
                </div>
                <div>
                  <p className="text-white font-medium">{name || selectedType.label}</p>
                  <p className="text-slate-400 text-sm">৳ {parseFloat(balance || "0").toLocaleString("en-BD")}</p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 border border-white/10 text-slate-400 hover:border-white/20 hover:text-white rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
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
