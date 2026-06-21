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
  Search, Trash2, X, ArchiveRestore, Menu, Plus, ChevronDown, 
  ArrowDownUp, ReceiptText, Utensils, ShoppingCart, Gamepad2, 
  Cpu, Car, AlertCircle, ArrowLeftRight, Shirt, Beef, Pill, Plane, Circle
} from "lucide-react";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";

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
  return CATEGORY_MAP[label] || { icon: Circle, color: "#64748b", bg: "rgba(100,116,139,0.12)" };
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
      <div className="sticky top-0 z-40 lg:hidden flex items-center justify-between h-[52px] px-[12px] bg-[rgba(8,8,15,0.95)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.05)]">
        <button onClick={openSidebar} className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)]">
          <Menu size={16} color="#64748b" />
        </button>
        <span className="text-[13px] font-[600] text-[#f1f5f9] flex-1 text-center">Transactions</span>
        <div className="flex items-center gap-[8px]">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)]">
            <Search size={15} color="#64748b" />
          </button>
          <button onClick={() => openModal("addTransaction")} className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#7c3aed] shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <Plus size={16} color="white" />
          </button>
        </div>
      </div>

      {/* 2B - Desktop Search Bar */}
      <div className="hidden lg:flex px-[20px] pt-[20px]">
        <div className="relative flex items-center w-full max-w-md h-[40px] rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] px-[14px]">
          <Search size={14} color="#334155" className="absolute left-[14px]" />
          <input
            type="text"
            placeholder="Search by title, amount, category..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="flex-1 bg-transparent border-none text-[13px] text-[#f1f5f9] placeholder-[#334155] focus:outline-none pl-[24px]"
          />
          {filters.search.length > 0 && (
            <button onClick={() => setFilters({ search: "" })} className="p-1">
              <X size={13} color="#64748b" />
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
            className="sticky top-[52px] z-30 lg:hidden w-full bg-[rgba(8,8,15,0.98)] border-b border-[rgba(255,255,255,0.06)] p-[8px_16px]"
          >
            <div className="relative flex items-center w-full h-[40px] rounded-[12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] px-[12px] focus-within:border-[rgba(124,58,237,0.5)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.10)] focus-within:bg-[rgba(124,58,237,0.04)]">
              <Search size={14} color="#334155" />
              <input
                autoFocus
                type="text"
                placeholder="Search by title, amount, category..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="flex-1 bg-transparent border-none text-[13px] text-[#f1f5f9] placeholder-[#334155] focus:outline-none ml-[8px]"
              />
              {filters.search.length > 0 && (
                <button onClick={() => setFilters({ search: "" })} className="p-[4px]">
                  <X size={13} color="#64748b" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2C - Page Header Section (Desktop only) */}
      <div className="hidden lg:flex items-center justify-between pt-[20px] px-[20px]">
        <div>
          <h1 className="text-[22px] font-[700] text-[#f1f5f9] tracking-[-0.03em]">Transactions</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.2)] rounded-[20px] px-[10px] py-[2px] text-[11px] text-[#a78bfa]">
              {filtered.length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* 2D - Filter Tabs */}
      <div className="flex gap-[6px] pt-[14px] px-[16px] overflow-x-auto hide-scrollbar scroll-touch">
        {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((t) => {
          const isActive = filters.type === t;
          let activeBg = "rgba(124,58,237,0.15)";
          let activeBorder = "rgba(124,58,237,0.35)";
          let activeColor = "#a78bfa";
          if (t === "INCOME") { activeBg = "rgba(16,185,129,0.15)"; activeBorder = "rgba(16,185,129,0.35)"; activeColor = "#10b981"; }
          if (t === "EXPENSE") { activeBg = "rgba(244,63,94,0.15)"; activeBorder = "rgba(244,63,94,0.35)"; activeColor = "#f43f5e"; }
          if (t === "TRANSFER") { activeBg = "rgba(59,130,246,0.15)"; activeBorder = "rgba(59,130,246,0.35)"; activeColor = "#3b82f6"; }

          return (
            <motion.button
              key={t}
              onClick={() => setFilters({ type: t })}
              className={cn(
                "relative flex h-[30px] px-[14px] items-center justify-center rounded-[20px] text-[12px] font-[500] whitespace-nowrap transition-colors duration-150",
                isActive ? "" : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#475569] hover:text-[#94a3b8]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="filter-bg"
                  className="absolute inset-0 rounded-[20px] border"
                  style={{ backgroundColor: activeBg, borderColor: activeBorder }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10" style={{ color: isActive ? activeColor : undefined }}>
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* 2I - Summary Stats Bar */}
      <div className="px-[16px] py-[10px] grid grid-cols-3 gap-[8px]">
        {/* Stat 1: Total */}
        <div className="h-[44px] rounded-[12px] p-[8px_12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#334155]">Total</span>
          <span className="text-[13px] font-[600] font-mono-amount text-[#f1f5f9] truncate">
            {symbol}{filtered.reduce((sum, t) => sum + (t.type === "EXPENSE" ? -t.amount : t.amount), 0).toLocaleString()}
          </span>
        </div>
        {/* Stat 2: Count */}
        <div className="h-[44px] rounded-[12px] p-[8px_12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#334155]">Count</span>
          <span className="text-[13px] font-[600] font-mono-amount text-[#f1f5f9] truncate">{filtered.length}</span>
        </div>
        {/* Stat 3: Largest */}
        <div className="h-[44px] rounded-[12px] p-[8px_12px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#334155]">Largest</span>
          <span className="text-[13px] font-[600] font-mono-amount text-[#f43f5e] truncate">
            {symbol}{filtered.length > 0 ? Math.max(...filtered.map(t => t.amount)).toLocaleString() : 0}
          </span>
        </div>
      </div>

      {/* 2E - Sort + Actions Row */}
      <div className="px-[16px] py-[10px] flex items-center justify-between relative z-20">
        {/* Custom Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-[32px] px-[12px] rounded-[10px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[12px] text-[#64748b] flex items-center gap-[6px]"
          >
            <ArrowDownUp size={13} color="#475569" />
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
                  className="absolute top-[calc(100%+4px)] left-0 min-w-[160px] rounded-[12px] bg-[#111120] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-[6px]"
                >
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilters({ sortBy: opt.value as any });
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "w-full text-left flex items-center h-[32px] px-[10px] rounded-[8px] text-[12px] transition-colors",
                        filters.sortBy === opt.value
                          ? "text-[#a78bfa] bg-[rgba(124,58,237,0.08)]"
                          : "text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f1f5f9]"
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
            "h-[30px] px-[12px] rounded-[10px] font-[500] text-[11px] flex items-center transition-all",
            filters.showDeleted
              ? "bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.3)] text-[#f43f5e]"
              : "bg-[rgba(243,67,94,0.08)] border border-[rgba(243,67,94,0.15)] text-[#f43f5e] hover:bg-[rgba(243,67,94,0.14)] hover:border-[rgba(243,67,94,0.28)]"
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
          <div className="flex flex-col items-center py-[60px] px-[24px] text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[80px] h-[80px] rounded-full bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)] flex items-center justify-center mb-[20px]"
            >
              <ReceiptText size={32} color="#7c3aed" strokeWidth={1.5} />
              <div className="absolute top-[10px] right-[10px] w-[3px] h-[3px] rounded-full bg-[#a78bfa] animate-pulse" />
              <div className="absolute bottom-[20px] left-[15px] w-[4px] h-[4px] rounded-full bg-[#a78bfa] animate-pulse" style={{ animationDelay: '1s' }} />
            </motion.div>
            <h3 className="text-[16px] font-[600] text-[#94a3b8] mb-[8px]">No transactions yet</h3>
            <p className="text-[13px] text-[#334155] leading-[1.6] max-w-[220px]">
              Add your first transaction using the + button
            </p>
            <button
              onClick={() => openModal("addTransaction")}
              className="mt-[20px] h-[40px] px-[20px] rounded-[12px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.25)] text-[13px] text-[#a78bfa] font-[500] flex items-center"
            >
              <Plus size={14} className="mr-2" />
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-[0px]">
            {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
              <div key={dateLabel}>
                {/* Sticky Date Header */}
                <div className="sticky-date-header h-[28px] px-[16px] flex items-center gap-[10px] text-[10px] text-[#334155] uppercase tracking-[0.08em]">
                  {dateLabel}
                  <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.04)]" />
                </div>

                <div>
                  {txns.map((transaction, index) => {
                    const profile = getProfile(transaction.profileId);
                    const categoryLabel = getCategoryById(transaction.category)?.label || transaction.category;
                    const catStyle = getCatStyle(categoryLabel);
                    const Icon = catStyle.icon;

                    const amountColor =
                      transaction.type === "INCOME" ? "text-[#10b981]"
                      : transaction.type === "EXPENSE" ? "text-[#f43f5e]"
                      : "text-[#3b82f6]";

                    const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "−" : "→";

                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ y: 4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        onClick={() => setEditTxnId(transaction.id)}
                        className="grid grid-cols-[36px_1fr_auto] gap-[12px] items-center px-[16px] py-[12px] border-b border-[rgba(255,255,255,0.04)] min-h-[56px] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
                      >
                        {/* Icon */}
                        <div 
                          className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center"
                          style={{ backgroundColor: catStyle.bg }}
                        >
                          <Icon size={16} color={catStyle.color} />
                        </div>

                        {/* Title & Sub */}
                        <div className="min-w-0">
                          <p className="text-[13px] font-[500] text-[#f1f5f9] truncate">
                            {transaction.title}
                          </p>
                          <p className="text-[11px] text-[#475569] truncate mt-[2px]">
                            {categoryLabel} {profile ? `· ${profile.name}` : ''}
                          </p>
                        </div>

                        {/* Amount & Date */}
                        <div className="text-right flex flex-col justify-center">
                          <span className={cn("text-[13px] font-[600] font-mono-amount", amountColor)}>
                            {sign}{symbol}{Math.abs(transaction.amount).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#334155] mt-[2px]">
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
