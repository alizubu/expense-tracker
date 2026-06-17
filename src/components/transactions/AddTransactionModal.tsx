"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, FileText, Repeat, ChevronDown } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { EXPENSE_CATEGORIES, getCategoriesByGroup, getCategoryGroups, getIncomeCategories } from "@/lib/categories";
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
  const [categorySearch, setCategorySearch] = useState("");
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
      userId: "user_001",
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

    // Update balances
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

  // Get categories based on type
  const availableCategories = type === "INCOME"
    ? getIncomeCategories()
    : EXPENSE_CATEGORIES.filter((c) => c.group !== "Income");

  const filteredCategories = categorySearch
    ? availableCategories.filter(
        (c) =>
          c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
          c.group.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : availableCategories;

  const groups = Array.from(new Set(filteredCategories.map((c) => c.group)));

  const selectedCategory = EXPENSE_CATEGORIES.find((c) => c.id === category);

  const tabs: { type: TransactionType; label: string; color: string }[] = [
    { type: "INCOME", label: "Income", color: "text-income" },
    { type: "EXPENSE", label: "Expense", color: "text-expense" },
    { type: "TRANSFER", label: "Transfer", color: "text-transfer" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg animate-slide-up sm:animate-scale-in rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-background-secondary max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-background-secondary/95 backdrop-blur-xl px-5 py-4 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-text-primary">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-white/[0.05] hover:text-text-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Type Tabs */}
          <div className="flex rounded-lg bg-white/[0.04] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => {
                  setType(tab.type);
                  setCategory("");
                }}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  type === tab.type
                    ? "bg-white/[0.08] " + tab.color
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="text-center py-3">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Amount</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-semibold text-text-secondary">{symbol}</span>
              <NumericFormat
                value={amount || ""}
                onValueChange={(values) => setAmount(values.floatValue || 0)}
                thousandSeparator=","
                decimalScale={2}
                placeholder="0.00"
                className="w-48 bg-transparent text-center text-4xl font-bold text-text-primary outline-none tabular-nums placeholder:text-text-muted/30"
              />
            </div>
          </div>

          {/* Profile Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {type === "TRANSFER" ? "From Profile" : "Profile"}
            </label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {symbol} {p.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* To Profile (Transfer only) */}
          {type === "TRANSFER" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                To Profile
              </label>
              <select
                value={toProfileId}
                onChange={(e) => setToProfileId(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25"
              >
                {profiles
                  .filter((p) => p.id !== profileId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {symbol} {p.balance.toLocaleString()}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category Picker (not for transfers) */}
          {type !== "TRANSFER" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Category
              </label>

              {/* Selected category display / trigger */}
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-left transition-colors hover:border-white/[0.12]"
              >
                {selectedCategory ? (
                  <>
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded"
                      style={{ backgroundColor: selectedCategory.color + "20" }}
                    >
                      {(() => {
                        const Icon = getIcon(selectedCategory.icon);
                        return <Icon className="h-3.5 w-3.5" style={{ color: selectedCategory.color }} />;
                      })()}
                    </div>
                    <span className="text-text-primary">{selectedCategory.label}</span>
                  </>
                ) : (
                  <span className="text-text-muted">Select a category...</span>
                )}
                <ChevronDown className="ml-auto h-4 w-4 text-text-muted" />
              </button>

              {/* Category Picker Grid */}
              {showCategoryPicker && (
                <div className="mt-2 rounded-xl border border-white/[0.08] bg-background-elevated p-3 max-h-64 overflow-y-auto">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="mb-3 w-full rounded-lg border border-white/[0.06] bg-background-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-purple/30"
                  />

                  {groups.map((group) => (
                    <div key={group} className="mb-3">
                      <p className="mb-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        {group}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {filteredCategories
                          .filter((c) => c.group === group)
                          .map((cat) => {
                            const Icon = getIcon(cat.icon);
                            const isSelected = category === cat.id;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setCategory(cat.id);
                                  setShowCategoryPicker(false);
                                  setCategorySearch("");
                                }}
                                className={cn(
                                  "flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-all",
                                  isSelected
                                    ? "ring-2 bg-white/[0.06]"
                                    : "hover:bg-white/[0.04]"
                                )}
                                style={
                                  isSelected ? { boxShadow: `0 0 0 2px ${cat.color}` } : undefined
                                }
                              >
                                <div
                                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: cat.color + "18" }}
                                >
                                  <Icon className="h-4 w-4" style={{ color: cat.color }} />
                                </div>
                                <span className="text-[10px] text-text-secondary leading-tight">
                                  {cat.label}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <FileText className="inline h-3.5 w-3.5 mr-1" />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What was this for?"
              className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Calendar className="inline h-3.5 w-3.5 mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25 [color-scheme:dark]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Tag className="inline h-3.5 w-3.5 mr-1" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="food, work, monthly..."
              className="w-full rounded-lg border border-white/[0.08] bg-background-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/50 focus:outline-none focus:ring-1 focus:ring-brand-purple/25"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-background-card px-4 py-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-text-muted" />
              <span className="text-sm text-text-secondary">Repeat this transaction</span>
            </div>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                isRecurring ? "bg-brand-purple" : "bg-white/[0.1]"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  isRecurring ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {/* Frequency (if recurring) */}
          {isRecurring && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Frequency
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["daily", "weekly", "monthly", "yearly"].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all",
                      frequency === freq
                        ? "bg-brand-purple/20 text-brand-purple-light ring-1 ring-brand-purple/30"
                        : "bg-white/[0.04] text-text-muted hover:bg-white/[0.06]"
                    )}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <ShimmerButton
            type="button"
            onClick={handleSubmit}
            className="w-full py-3.5"
            shimmerColor={
              type === "INCOME" ? "#10B981" : type === "EXPENSE" ? "#EF4444" : "#3B82F6"
            }
            background={
              type === "INCOME"
                ? "rgba(16, 185, 129, 0.15)"
                : type === "EXPENSE"
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(59, 130, 246, 0.15)"
            }
          >
            <LucideIcons.Plus className="h-4 w-4" />
            Add {type === "INCOME" ? "Income" : type === "EXPENSE" ? "Expense" : "Transfer"}
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
