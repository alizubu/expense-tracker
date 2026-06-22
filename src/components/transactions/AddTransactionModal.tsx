"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
    <Dialog open={true} onClose={onClose} title="New Transaction" className="md:max-w-[460px]">
      <div className="space-y-6 pb-2">
        {/* Type Switcher */}
        <div className="flex p-1 rounded-xl bg-card-elevated border border-border">
          {tabs.map((tab) => {
            const isActive = type === tab.type;
            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => {
                  setType(tab.type);
                  setCategory("");
                }}
                className={cn(
                  "flex-1 relative rounded-lg py-2 text-xs font-semibold transition-colors z-10 cursor-pointer select-none",
                  isActive ? "text-white" : "text-text-muted hover:text-text-secondary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="add-txn-tab"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                  />
                )}
                <span className="relative z-20">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Amount Input */}
        <div className="flex flex-col items-center justify-center py-2 select-none">
          <p className="text-[10px] font-bold tracking-wider text-text-secondary uppercase mb-1">Amount</p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl font-bold text-text-secondary font-mono">{symbol}</span>
            <NumericFormat
              value={amount || ""}
              onValueChange={(values) => setAmount(values.floatValue || 0)}
              thousandSeparator=","
              decimalScale={2}
              placeholder="0.00"
              className="w-[180px] bg-transparent text-center font-mono text-[36px] font-bold text-text-primary outline-none placeholder:text-text-muted/40"
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
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="[color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Category Picker */}
        {type !== "TRANSFER" && (
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">
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
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What was this for?"
          />
        </div>

        {/* Note & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Note (optional)"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional details"
            />
          </div>
          <div>
            <Input
              label="Tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="food, work..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <ConfirmButton
            onClick={handleSubmit}
            disabled={amount === 0 || (!category && type !== "TRANSFER") || !profileId}
            label="Save Transaction"
          />
        </div>
      </div>
    </Dialog>
  );
}
