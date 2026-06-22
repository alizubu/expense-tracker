"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { formatGroupDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { 
  Search, Trash2, X, ChevronDown, 
  ArrowDownUp, ReceiptText, Utensils, ShoppingCart, Gamepad2, 
  Cpu, Car, AlertCircle, ArrowLeftRight, Shirt, Beef, Pill, Plane, Circle, Menu, Plus
} from "lucide-react";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 2G - Category Icon Map
const CATEGORY_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  "Food / Restaurant": { icon: Utensils,       color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "Groceries":         { icon: ShoppingCart,   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  "Gaming":            { icon: Gamepad2,       color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
  "Electronics":       { icon: Cpu,            color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  "Ride Share":        { icon: Car,            color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  "Tax / Fines":       { icon: AlertCircle,    color: "#f43f5e", bg: "rgba(243,67,94,0.12)" },
  "Transfer":          { icon: ArrowLeftRight, color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  "Clothing":          { icon: Shirt,          color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  "Fastfood":          { icon: Beef,           color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  "Medicine":          { icon: Pill,           color: "#14b8a6", bg: "rgba(20,184,166,0.12)" },
  "Travel":            { icon: Plane,          color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

function getCatStyle(label: string) {
  return CATEGORY_MAP[label] || { icon: Circle, color: "var(--text-secondary)", bg: "var(--border-subtle)" };
}

export default function TransactionsPage() {
  const { transactions, setFilters, filters, getFilteredTransactions } = useTransactionStore();
  const { getProfile } = useProfileStore();
  const { selectedCurrency, openModal, openSidebar } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const [editTxnId, setEditTxnId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filtered = getFilteredTransactions();
  const editTransaction = transactions.find(t => t.id === editTxnId);

  const toggleTrashView = () => {
    setFilters({ showDeleted: !filters.showDeleted });
    useTransactionStore.getState().fetchTransactions();
  };

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((t) => {
      const key = formatGroupDate(t.date);
      const existing = groups.get(key) || [];
      existing.push(t);
      groups.set(key, existing);
    });
    return groups;
  }, [filtered]);

  const sortOptions = [
    { value: "date", label: "Sort by Date" },
    { value: "amount", label: "Sort by Amount" },
    { value: "category", label: "Sort by Name" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 2A - Mobile Topbar */}
      <div className="sticky top-0 z-40 lg:hidden flex items-center justify-between h-[52px] px-[12px] bg-card/95 backdrop-blur-[16px] border-b border-border/60">
        <button onClick={openSidebar} className="flex items-center justify-center w-[32px] h-[32px] rounded-xl bg-card-elevated border border-border cursor-pointer">
          <Menu size={16} className="text-text-secondary" />
        </button>
        <span className="text-[13px] font-semibold text-text-primary flex-1 text-center">Transactions</span>
        <div className="flex items-center gap-[8px]">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex items-center justify-center w-[32px] h-[32px] rounded-xl bg-card-elevated border border-border cursor-pointer">
            <Search size={15} className="text-text-secondary" />
          </button>
          <button onClick={() => openModal("addTransaction")} className="flex items-center justify-center w-[32px] h-[32px] rounded-xl bg-accent shadow-md shadow-violet-500/20 cursor-pointer">
            <Plus size={16} color="white" />
          </button>
        </div>
      </div>

      {/* 2B - Desktop Search Bar */}
      <div className="hidden lg:flex pt-4">
        <div className="relative flex items-center w-full max-w-md h-[40px] rounded-xl bg-card-elevated border border-border px-[14px]">
          <Search size={14} className="text-text-muted absolute left-[14px]" />
          <input
            type="text"
            placeholder="Search by title, amount, category..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="flex-1 bg-transparent border-none text-[13px] text-text-primary placeholder:text-text-muted/60 focus:outline-none pl-[24px]"
          />
          {filters.search.length > 0 && (
            <button onClick={() => setFilters({ search: "" })} className="p-1 cursor-pointer">
              <X size={13} className="text-text-muted hover:text-text-secondary" />
            </button>
          )}
        </div>
      </div>

      {/* 2B - Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-[52px] z-30 lg:hidden w-full bg-card border-b border-border/80 p-2"
          >
            <div className="relative flex items-center w-full h-[40px] rounded-xl bg-card-elevated border border-border px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-dim">
              <Search size={14} className="text-text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search by title, amount, category..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="flex-1 bg-transparent border-none text-[13px] text-text-primary placeholder:text-text-muted/60 focus:outline-none ml-2"
              />
              {filters.search.length > 0 && (
                <button onClick={() => setFilters({ search: "" })} className="p-1 cursor-pointer">
                  <X size={13} className="text-text-muted" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2C - Page Header Section (Desktop only) */}
      <div className="hidden lg:flex items-center justify-between pt-4">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary tracking-[-0.03em]">Transactions</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <Badge variant="secondary">
              {filtered.length} transactions
            </Badge>
          </div>
        </div>
      </div>

      {/* 2D - Filter Tabs */}
      <div className="flex gap-2 pt-4 overflow-x-auto hide-scrollbar scroll-touch">
        {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((t) => {
          const isActive = filters.type === t;
          let activeStyles = "bg-accent-dim text-accent border-accent/20";
          if (t === "INCOME") { activeStyles = "bg-income/10 text-income border-income/20"; }
          if (t === "EXPENSE") { activeStyles = "bg-expense/10 text-expense border-expense/20"; }
          if (t === "TRANSFER") { activeStyles = "bg-transfer/10 text-transfer border-transfer/20"; }

          return (
            <button
              key={t}
              onClick={() => setFilters({ type: t })}
              className={cn(
                "relative flex h-[30px] px-[14px] items-center justify-center rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors duration-150 border cursor-pointer select-none",
                isActive ? activeStyles : "bg-card-elevated border-border text-text-secondary hover:text-text-primary"
              )}
            >
              <span>
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              </span>
            </button>
          )
        })}
      </div>

      {/* 2I - Summary Stats Bar */}
      <div className="py-4 grid grid-cols-3 gap-3">
        {/* Stat 1: Total */}
        <Card className="p-3 flex flex-col justify-between h-[52px]">
          <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-text-muted">Total</span>
          <span className="text-[13px] font-bold font-mono-amount text-text-primary truncate">
            {symbol}{filtered.reduce((sum, t) => sum + (t.type === "EXPENSE" ? -t.amount : t.amount), 0).toLocaleString()}
          </span>
        </Card>
        {/* Stat 2: Count */}
        <Card className="p-3 flex flex-col justify-between h-[52px]">
          <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-text-muted">Count</span>
          <span className="text-[13px] font-bold font-mono-amount text-text-primary truncate">{filtered.length}</span>
        </Card>
        {/* Stat 3: Largest */}
        <Card className="p-3 flex flex-col justify-between h-[52px] border-l-[3px] border-l-expense">
          <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-text-muted">Largest</span>
          <span className="text-[13px] font-bold font-mono-amount text-expense truncate">
            {symbol}{filtered.length > 0 ? Math.max(...filtered.map(t => t.amount)).toLocaleString() : 0}
          </span>
        </Card>
      </div>

      {/* 2E - Sort + Actions Row */}
      <div className="pb-3 flex items-center justify-between relative z-20">
        {/* Custom Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-[32px] px-3 rounded-xl bg-card-elevated border border-border text-[12px] text-text-secondary flex items-center gap-1.5 cursor-pointer select-none"
          >
            <ArrowDownUp size={13} className="text-text-muted" />
            {sortOptions.find(o => o.value === filters.sortBy)?.label || "Sort by Date"}
            <ChevronDown size={12} />
          </button>
          
          <AnimatePresence>
            {isSortOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsSortOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+4px)] left-0 min-w-[160px] rounded-xl bg-card border border-border shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-[6px]"
                >
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilters({ sortBy: opt.value as any });
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "w-full text-left flex items-center h-[32px] px-2 rounded-lg text-xs transition-colors cursor-pointer select-none",
                        filters.sortBy === opt.value
                          ? "text-brand-purple-light bg-brand-purple/10 font-semibold"
                          : "text-text-secondary hover:bg-card-hover hover:text-text-primary"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* View Trash Button */}
        <button
          onClick={toggleTrashView}
          className={cn(
            "h-[32px] px-3 rounded-xl font-semibold text-[11px] flex items-center transition-all cursor-pointer border select-none",
            filters.showDeleted
              ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
              : "bg-card-elevated border-border text-text-secondary hover:bg-card-hover hover:text-text-primary"
          )}
        >
          <Trash2 size={12} className="mr-1.5" />
          {filters.showDeleted ? "Exit Trash" : "View Trash"}
        </button>
      </div>

      {/* 2F & 2H - List Items / Empty State */}
      <div className="flex-1 pb-safe mb-nav">
        {filtered.length === 0 ? (
          /* Empty State */
          <div className="py-8">
            <EmptyState
              icon={ReceiptText}
              title="No transactions yet"
              description="Add your first transaction or clear filters to see your feed."
              actionLabel="Add Transaction"
              onAction={() => openModal("addTransaction")}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
              <div key={dateLabel}>
                {/* Sticky Date Header */}
                <div className="sticky top-0 z-10 h-[28px] bg-page/80 backdrop-blur-md flex items-center gap-[10px] text-[10px] text-text-muted font-bold uppercase tracking-[0.08em]">
                  {dateLabel}
                  <div className="flex-1 h-[1px] bg-border/40" />
                </div>

                <div className="divide-y divide-border/30">
                  {txns.map((transaction, index) => {
                    const profile = getProfile(transaction.profileId);
                    const categoryLabel = getCategoryById(transaction.category)?.label || transaction.category;
                    const catStyle = getCatStyle(transaction.type === "TRANSFER" ? "Transfer" : categoryLabel);
                    const Icon = catStyle.icon;

                    const amountColor =
                      transaction.type === "INCOME" ? "text-income"
                      : transaction.type === "EXPENSE" ? "text-expense"
                      : "text-transfer";

                    const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "−" : "→";

                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ y: 4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        onClick={() => setEditTxnId(transaction.id)}
                        className="grid grid-cols-[36px_1fr_auto] gap-[12px] items-center py-3 min-h-[56px] cursor-pointer hover:bg-card-hover rounded-xl px-2 transition-colors duration-150"
                      >
                        {/* Icon */}
                        <div 
                          className="w-[36px] h-[36px] rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: catStyle.bg }}
                        >
                          <Icon size={16} color={catStyle.color} />
                        </div>

                        {/* Title & Sub */}
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-text-primary truncate">
                            {transaction.title}
                          </p>
                          <p className="text-[11px] text-text-secondary truncate mt-0.5">
                            {transaction.type === "TRANSFER" ? "Transfer" : categoryLabel} {profile ? `· ${profile.name}` : ''}
                          </p>
                        </div>

                        {/* Amount & Date */}
                        <div className="text-right flex flex-col justify-center">
                          <span className={cn("text-[13px] font-bold font-mono-amount", amountColor)}>
                            {sign}{symbol}{Math.abs(transaction.amount).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTxnId && editTransaction && (
        <EditTransactionModal
          transaction={editTransaction}
          onClose={() => setEditTxnId(null)}
        />
      )}
    </div>
  );
}
