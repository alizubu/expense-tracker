"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, FileText, Repeat, ChevronDown } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { EXPENSE_CATEGORIES, getIncomeCategories } from "@/lib/categories";
import { TransactionType } from "@/lib/types";
import { AccountSelector } from "./AccountSelector";
import { CategoryGrid } from "./CategoryGrid";
import { ConfirmButton } from "./ConfirmButton";
import * as LucideIcons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

interface AddTransactionModalProps {
  onClose: () => void;
  defaultType?: TransactionType;
}

export function AddTransactionModal({ onClose, defaultType = "EXPENSE" }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [profileId, setProfileId] = useState("");
  const [toProfileId, setToProfileId] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [tags, setTags] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { addTransaction } = useTransactionStore();
  const { profiles, updateBalance } = useProfileStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  // Set default profile
  useEffect(() => {
    if (profiles.length > 0 && !profileId) {
      const defaultProfile = profiles.find((p) => p.isDefault) || profiles[0];
      setProfileId(defaultProfile.id);
      if (profiles.length > 1) {
        const otherProfile = profiles.find((p) => p.id !== defaultProfile.id);
        if (otherProfile) setToProfileId(otherProfile.id);
      }
    }
  }, [profiles, profileId]);

  const handleSubmit = () => {
    if (!amount || !title || !profileId || (!category && type !== "TRANSFER")) {
      toast.error("Please fill in all required fields");
      return;
    }

    addTransaction({
      profileId,
      toProfileId: type === "TRANSFER" ? toProfileId : undefined,
      type,
      amount,
      category: type === "TRANSFER" ? "transfer" : category,
      title,
      note: note || undefined,
      date: new Date(date).toISOString(),
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    });

    if (type === "EXPENSE") {
      updateBalance(profileId, -amount);
    } else if (type === "INCOME") {
      updateBalance(profileId, amount);
    } else if (type === "TRANSFER") {
      updateBalance(profileId, -amount);
      updateBalance(toProfileId, amount);
    }

    toast.success(`${type === "INCOME" ? "Income" : type === "EXPENSE" ? "Expense" : "Transfer"} added successfully!`, {
      description: `${symbol} ${amount.toLocaleString()} — ${title}`,
    });
    onClose();
  };

  const availableCategories = type === "INCOME"
    ? getIncomeCategories()
    : EXPENSE_CATEGORIES.filter((c) => c.group !== "Income");

  const selectedCategory = availableCategories.find((c) => c.id === category);

  const handleCategorySelect = (cat: { id: string; label: string }) => {
    setCategory(cat.id);
    if (!title || (selectedCategory && title === selectedCategory.label)) {
      setTitle(cat.label);
    }
  };

  const tabs: { type: TransactionType; label: string }[] = [
    { type: "INCOME", label: "Income" },
    { type: "EXPENSE", label: "Expense" },
    { type: "TRANSFER", label: "Transfer" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60" 
          style={{ backdropFilter: "blur(4px)" }}
          onClick={onClose} 
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, y: "100%", scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: "100%", scale: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative z-10 w-full md:max-w-[480px] bg-[var(--bg-elevated)] border-t md:border border-[var(--border-subtle)] rounded-t-[24px] md:rounded-[var(--radius-xl)] max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Mobile Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1.5 rounded-full bg-white/[0.15]" />
          </div>

          {/* Header */}
          <div className="flex-none sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-3 md:py-4">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">New Transaction</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-10">
            {/* Type Switcher */}
            <div className="flex p-1 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              {tabs.map((tab) => {
                const isActive = type === tab.type;
                return (
                  <button
                    key={tab.type}
                    onClick={() => {
                      setType(tab.type);
                      setCategory("");
                    }}
                    className={cn(
                      "flex-1 relative rounded-[var(--radius-sm)] py-2 text-[13px] font-medium transition-colors z-10",
                      isActive ? "text-white text-shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="modal-tab"
                        className="absolute inset-0 rounded-[var(--radius-sm)] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] shadow-[0_0_12px_var(--accent-glow)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-20">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Amount Input */}
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-2">Amount</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-mono text-[var(--text-secondary)]">{symbol}</span>
                <NumericFormat
                  value={amount || ""}
                  onValueChange={(values) => setAmount(values.floatValue || 0)}
                  thousandSeparator=","
                  decimalScale={2}
                  placeholder="0.00"
                  className="w-[200px] bg-transparent text-center font-mono text-[40px] font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Profile Selector */}
              <div className="col-span-2 sm:col-span-1">
                <AccountSelector
                  label={type === "TRANSFER" ? "From Account" : "Account"}
                  profiles={profiles}
                  selectedId={profileId}
                  onChange={(id) => setProfileId(id)}
                />
              </div>

              {/* To Profile (Transfer only) */}
              {type === "TRANSFER" && (
                <div className="col-span-2 sm:col-span-1">
                  <AccountSelector
                    label="To Account"
                    profiles={profiles.filter((p) => p.id !== profileId)}
                    selectedId={toProfileId}
                    onChange={(id) => setToProfileId(id)}
                  />
                </div>
              )}
              
              {/* Date */}
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Date
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] hover:border-[var(--accent-light)] hover:shadow-[0_0_12px_var(--accent-glow)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] transition-all cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Category Picker */}
            {type !== "TRANSFER" && (
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Category
                </label>
                <CategoryGrid
                  categories={availableCategories}
                  selectedCategory={category}
                  onSelect={handleCategorySelect}
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What was this for?"
                className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all"
              />
            </div>

            {/* Note & Tags - Hidden behind a toggle to keep UI clean, or just show them simply */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional details"
                  className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="food, work..."
                  className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <ConfirmButton
                onClick={handleSubmit}
                disabled={amount === 0 || (!category && type !== "TRANSFER") || !profileId}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
