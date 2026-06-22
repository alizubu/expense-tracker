"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { EXPENSE_CATEGORIES, getIncomeCategories } from "@/lib/categories";
import { Transaction, TransactionType } from "@/lib/types";
import { AccountSelector } from "./AccountSelector";
import { CategoryGrid } from "./CategoryGrid";
import { ConfirmButton } from "./ConfirmButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState<number>(transaction.amount);
  const [title, setTitle] = useState(transaction.title);
  const [note, setNote] = useState(transaction.note || "");
  const [category, setCategory] = useState(transaction.category);
  const [profileId, setProfileId] = useState(transaction.profileId);
  const [toProfileId, setToProfileId] = useState(transaction.toProfileId || "");
  const [date, setDate] = useState(new Date(transaction.date).toISOString().split("T")[0]);
  const [tags, setTags] = useState(transaction.tags.join(", "));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateTransaction, deleteTransaction } = useTransactionStore();
  const { fetchProfiles, updateBalance } = useProfileStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const profiles = useProfileStore((state) => state.profiles);

  const handleSubmit = async () => {
    if (!amount || !title || !profileId || (!category && type !== "TRANSFER")) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Revert old balances first
    if (transaction.type === "EXPENSE") {
      updateBalance(transaction.profileId, transaction.amount);
    } else if (transaction.type === "INCOME") {
      updateBalance(transaction.profileId, -transaction.amount);
    } else if (transaction.type === "TRANSFER") {
      updateBalance(transaction.profileId, transaction.amount);
      if (transaction.toProfileId) updateBalance(transaction.toProfileId, -transaction.amount);
    }

    await updateTransaction(transaction.id, {
      profileId,
      toProfileId: type === "TRANSFER" ? toProfileId : null,
      type,
      amount,
      category: type === "TRANSFER" ? "transfer" : category,
      title,
      note: note || null,
      date: new Date(date).toISOString(),
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    } as any);

    // Apply new balances
    if (type === "EXPENSE") {
      updateBalance(profileId, -amount);
    } else if (type === "INCOME") {
      updateBalance(profileId, amount);
    } else if (type === "TRANSFER") {
      updateBalance(profileId, -amount);
      updateBalance(toProfileId, amount);
    }

    await fetchProfiles(); // Sync database changes
    toast.success("Transaction updated successfully!");
    onClose();
  };

  const handleDelete = async () => {
    // Revert old balances
    if (transaction.type === "EXPENSE") {
      updateBalance(transaction.profileId, transaction.amount);
    } else if (transaction.type === "INCOME") {
      updateBalance(transaction.profileId, -transaction.amount);
    } else if (transaction.type === "TRANSFER") {
      updateBalance(transaction.profileId, transaction.amount);
      if (transaction.toProfileId) updateBalance(transaction.toProfileId, -transaction.amount);
    }

    await deleteTransaction(transaction.id);
    await fetchProfiles();
    toast.success("Transaction moved to trash successfully");
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
    <>
      <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[460px] max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-border/50">
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            {/* Type Switcher */}
            <div className="flex p-1 rounded-xl bg-muted border border-border">
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
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="edit-txn-tab"
                        className="absolute inset-0 rounded-lg bg-background shadow-sm"
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
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">Amount</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-bold text-muted-foreground font-mono">{symbol}</span>
                <NumericFormat
                  value={amount || ""}
                  onValueChange={(values) => setAmount(values.floatValue || 0)}
                  thousandSeparator=","
                  decimalScale={2}
                  placeholder="0.00"
                  className="w-[180px] bg-transparent text-center font-mono text-[36px] font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
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
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</label>
                <Input
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
                <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What was this for?"
              />
            </div>

            {/* Note & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note (optional)</label>
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional details"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</label>
                <Input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="food, work..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 flex gap-3 flex-shrink-0 border-t border-border/50 bg-background/50 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center w-12 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer shadow-sm select-none"
              title="Delete Transaction"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
            <div className="flex-1">
              <ConfirmButton
                onClick={handleSubmit}
                disabled={amount === 0 || (!category && type !== "TRANSFER") || !profileId}
                label="Save Changes"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Transaction?"
        description="Are you sure you want to delete this transaction? It will be moved to the trash archive, and the account balance will be updated."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </>
  );
}
