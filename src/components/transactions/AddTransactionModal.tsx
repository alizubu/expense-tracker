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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
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
      isRecurring,
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
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[480px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] max-h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex-none sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-4">
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
                      isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="modal-tab"
                        className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] shadow-sm border border-[var(--border-subtle)]"
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
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  {type === "TRANSFER" ? "From Account" : "Account"}
                </label>
                <select
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Profile (Transfer only) */}
              {type === "TRANSFER" && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                    To Account
                  </label>
                  <select
                    value={toProfileId}
                    onChange={(e) => setToProfileId(e.target.value)}
                    className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all"
                  >
                    {profiles
                      .filter((p) => p.id !== profileId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              
              {/* Date */}
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-glow)] transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Category Picker */}
            {type !== "TRANSFER" && (
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                  Category
                </label>

                <div className="flex flex-wrap gap-2">
                  {availableCategories.slice(0, 7).map((cat) => {
                    const Icon = getIcon(cat.icon);
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] border transition-all text-[12px]",
                          isSelected 
                            ? "border-[var(--accent)] bg-[rgba(124,58,237,0.12)] text-[var(--accent-light)]" 
                            : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {cat.label}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[12px] text-[var(--text-muted)] hover:border-[var(--border-default)] transition-all"
                  >
                    More <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {showCategoryPicker && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[var(--bg-surface)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] max-h-48 overflow-y-auto no-scrollbar"
                  >
                    {availableCategories.slice(7).map((cat) => {
                      const Icon = getIcon(cat.icon);
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleCategorySelect(cat);
                            setShowCategoryPicker(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-[12px] text-left",
                            isSelected ? "bg-[rgba(124,58,237,0.12)] text-[var(--accent-light)]" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
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
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full h-12 mt-2 bg-[var(--accent)] hover:bg-[#6D28D9] text-white text-[14px] font-medium rounded-[var(--radius-md)] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_var(--accent-glow)]"
            >
              Confirm Transaction
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
