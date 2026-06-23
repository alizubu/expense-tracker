"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Calendar as CalendarIcon, X } from "lucide-react";
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

const ACCOUNT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444"];

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `acc_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// Staggered entrance for the modal's form sections
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

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

  // Inline "add account" panel
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountColor, setNewAccountColor] = useState(ACCOUNT_COLORS[0]);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const { updateTransaction, deleteTransaction } = useTransactionStore();
  const { fetchProfiles, updateBalance, addProfile } = useProfileStore();
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

  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      toast.error("Give the new account a name");
      return;
    }
    const newProfile = {
      id: makeId(),
      name: newAccountName.trim(),
      icon: "Wallet",
      color: newAccountColor,
      balance: 0,
      isDefault: profiles.length === 0,
    };
    addProfile(newProfile);
    setProfileId(newProfile.id);
    setNewAccountName("");
    setShowAddAccount(false);
    toast.success(`Account "${newProfile.name}" created`);
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

  // Friendly date label: "Today" / "Yesterday" / "Mon, 24 Jun"
  const formattedDate = useMemo(() => {
    const selected = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (selected.getTime() === today.getTime()) return "Today";
    if (selected.getTime() === yesterday.getTime()) return "Yesterday";
    return selected.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  }, [date]);

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDate(d.toISOString().split("T")[0]);
  };

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === "function") {
      (el as any).showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  const typeAccent =
    type === "INCOME" ? "text-emerald-500" : type === "EXPENSE" ? "text-rose-500" : "text-blue-500";

  return (
    <>
      <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[460px] max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-border/50">
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6"
          >
            {/* Type Switcher */}
            <motion.div variants={itemVariants} className="flex p-1 rounded-xl bg-card-elevated border border-border">
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
                      isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="edit-txn-tab"
                        className="absolute inset-0 rounded-lg bg-card-hover shadow-sm"
                        transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-20">{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Amount Input */}
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-2 select-none">
              <p className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-1">Amount</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className={cn("text-2xl font-bold font-mono transition-colors duration-300", typeAccent)}>
                  {symbol}
                </span>
                <NumericFormat
                  value={amount || ""}
                  onValueChange={(values) => setAmount(values.floatValue || 0)}
                  thousandSeparator=","
                  decimalScale={2}
                  placeholder="0.00"
                  className={cn(
                    "w-[180px] bg-transparent text-center font-mono text-[36px] font-bold outline-none placeholder:text-text-muted/40 transition-colors duration-300",
                    typeAccent
                  )}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              {/* Profile Selector */}
              <div className="col-span-2 sm:col-span-1">
                <AccountSelector
                  label={type === "TRANSFER" ? "From Account" : "Account"}
                  profiles={profiles}
                  selectedId={profileId}
                  onChange={(id) => setProfileId(id)}
                  onAddNew={() => setShowAddAccount(true)}
                />
              </div>

              {/* To Profile (Transfer only) */}
              <AnimatePresence mode="popLayout">
                {type === "TRANSFER" && (
                  <motion.div
                    key="to-account"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2 }}
                    className="col-span-2 sm:col-span-1"
                  >
                    <AccountSelector
                      label="To Account"
                      profiles={profiles.filter((p) => p.id !== profileId)}
                      selectedId={toProfileId}
                      onChange={(id) => setToProfileId(id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date */}
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">
                  Date
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="w-full h-10 flex items-center gap-2 rounded-xl border border-border bg-card-elevated px-3 text-xs font-semibold text-text-primary hover:bg-card-hover transition-all cursor-pointer"
                  >
                    <CalendarIcon className="h-4 w-4 text-text-muted flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={formattedDate}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="truncate"
                      >
                        {formattedDate}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full opacity-0 pointer-events-none [color-scheme:dark]"
                  />
                </div>
                <div className="flex gap-1.5">
                  {[
                    { label: "Today", offset: 0 },
                    { label: "Yesterday", offset: -1 },
                  ].map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setQuickDate(q.offset)}
                      className="rounded-full border border-border bg-card-elevated px-2.5 py-1 text-[11px] font-medium text-text-muted hover:text-accent hover:bg-accent-dim hover:border-accent/30 transition-all cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inline "Add account" panel */}
              <AnimatePresence>
                {showAddAccount && (
                  <motion.div
                    key="add-account-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="col-span-2 overflow-hidden"
                  >
                    <div className="rounded-xl border border-border bg-card-elevated p-3 space-y-3 mt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-text-primary">New account</p>
                        <button
                          type="button"
                          onClick={() => setShowAddAccount(false)}
                          className="text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Input
                        autoFocus
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="e.g. Cash Wallet"
                        onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
                      />
                      <div className="flex items-center gap-2">
                        {ACCOUNT_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewAccountColor(c)}
                            style={{ backgroundColor: c }}
                            className={cn(
                              "h-6 w-6 rounded-full border-2 transition-transform cursor-pointer",
                              newAccountColor === c ? "scale-110 border-text-primary" : "border-transparent hover:scale-105"
                            )}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAccount}
                        className="w-full rounded-lg bg-accent text-white text-sm font-semibold py-2 hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Create account
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Category Picker */}
            <AnimatePresence mode="wait">
              {type !== "TRANSFER" && (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-1.5"
                >
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">
                    Category
                  </label>
                  <CategoryGrid
                    categories={availableCategories}
                    selectedCategory={category}
                    onSelect={handleCategorySelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What was this for?"
              />
            </motion.div>

            {/* Note & Tags */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">Note (optional)</label>
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional details"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">Tags</label>
                <Input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="food, work..."
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 flex gap-3 flex-shrink-0 border-t border-border/50 bg-background/50 backdrop-blur-md"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center w-12 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer shadow-sm select-none"
              title="Delete Transaction"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </motion.button>
            <div className="flex-1">
              <ConfirmButton
                onClick={handleSubmit}
                disabled={amount === 0 || (!category && type !== "TRANSFER") || !profileId}
                label="Save Changes"
              />
            </div>
          </motion.div>
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