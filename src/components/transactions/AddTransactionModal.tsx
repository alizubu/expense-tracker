"use client";
import { TypographySpan, TypographyLabel, TypographyP } from "@/components/ui/typography";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { Calendar as CalendarIcon, X } from "lucide-react";
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
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


interface AddTransactionModalProps {
  onClose: () => void;
  defaultType?: TransactionType;
}

const ACCOUNT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444"];

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `acc_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// Staggered entrance for the modal's form sections
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" as const } },
};

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

  // Inline "add account" panel
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountColor, setNewAccountColor] = useState(ACCOUNT_COLORS[0]);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const { addTransaction } = useTransactionStore();
  const { profiles, updateBalance, addProfile } = useProfileStore();
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

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error("Give the new account a name");
      return;
    }
    const newProfileData = {
      name: newAccountName.trim(),
      icon: "Wallet",
      color: newAccountColor,
      balance: 0,
      isDefault: profiles.length === 0,
      type: "CASH" as const,
      sortOrder: profiles.length,
      description: "",
    };
    try {
      const newProfile = await addProfile(newProfileData);
      setProfileId(newProfile.id);
      setNewAccountName("");
      setShowAddAccount(false);
      toast.success(`Account "${newProfile.name}" created`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    }
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
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-border/50">
          <DialogTitle>New Transaction</DialogTitle>
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
              const activeColor = tab.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : tab.type === "EXPENSE" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20";
              
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => {
                    setType(tab.type);
                    setCategory("");
                  }}
                  className={cn(
                    "flex-1 relative rounded-lg py-2.5 text-xs font-semibold transition-colors z-10 cursor-pointer select-none border border-transparent",
                    isActive ? activeColor : "text-text-muted hover:text-text-primary hover:bg-white/[0.02]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="add-txn-tab"
                      className="absolute inset-0 rounded-lg shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <TypographySpan className="relative z-20">{tab.label}</TypographySpan>
                </button>
              );
            })}
          </motion.div>

          {/* Amount Input */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-2 select-none">
            <TypographyP className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-1">Amount</TypographyP>
            <div className={cn("flex items-center justify-center gap-1.5 transition-all duration-300 rounded-2xl px-6 py-2", type === "INCOME" ? "shadow-[0_0_30px_rgba(16,185,129,0.15)]" : type === "EXPENSE" ? "shadow-[0_0_30px_rgba(244,63,94,0.15)]" : "shadow-[0_0_30px_rgba(59,130,246,0.15)]")}>
              <TypographySpan className={cn("text-3xl font-bold font-mono transition-colors duration-300", typeAccent)}>
                {symbol}
              </TypographySpan>
              <NumericFormat
                value={amount || ""}
                onValueChange={(values) => setAmount(values.floatValue || 0)}
                thousandSeparator=","
                decimalScale={2}
                placeholder="0.00"
                className={cn(
                  "w-[180px] bg-transparent text-center font-mono text-[42px] font-bold outline-none placeholder:text-text-muted/40 transition-colors duration-300 drop-shadow-sm",
                  typeAccent
                )}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
            {/* Profile Selector */}
            <div className="w-full max-w-sm">
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
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm mt-[-10px]"
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
            <div className="w-full max-w-[200px] flex flex-col items-center space-y-2 mt-2">
              <TypographyLabel className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none text-center">
                Date
              </TypographyLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-border bg-card-elevated px-4 text-sm font-semibold text-text-primary hover:bg-card-hover transition-all cursor-pointer outline-none focus:border-accent focus:ring-1 focus:ring-accent",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 text-text-muted flex-shrink-0" />
                    {date ? format(new Date(date), "PPP") : <TypographySpan>Pick a date</TypographySpan>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ? new Date(date) : undefined}
                    onSelect={(newDate) => {
                      if (newDate) {
                        const localDate = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000);
                        setDate(localDate.toISOString().split("T")[0]);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
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
                  className="w-full max-w-sm overflow-hidden"
                >
                  <div className="rounded-xl border border-border bg-card-elevated p-3 space-y-3 mt-1">
                    <div className="flex items-center justify-between">
                      <TypographyP className="text-xs font-semibold text-text-primary">New account</TypographyP>
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
                className="space-y-2 flex flex-col items-center w-full mt-2"
              >
                <TypographyLabel className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none text-center">
                  Category
                </TypographyLabel>
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
            <TypographyLabel className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">Title</TypographyLabel>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What was this for?"
            />
          </motion.div>


        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 flex-shrink-0 border-t border-border/50 bg-background/50 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={amount === 0 || (!category && type !== "TRANSFER") || !profileId}
            className="w-full shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-indigo-500 text-white border-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Transaction
          </button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}