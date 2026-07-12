"use client";
import { TypographySpan, TypographyH1, TypographyP } from "@/components/ui/typography";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById, getCategoryColor, getCategoryIconName } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { formatGroupDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { 
  Search, Trash2, X, ChevronDown, 
  ArrowDownUp, ReceiptText, CircleDashed, Menu, Plus,
  ArrowRight
} from "lucide-react";
import * as Icons from "lucide-react";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const { transactions, setFilters, filters, getFilteredTransactions } = useTransactionStore();
  const { getProfile } = useProfileStore();
  const { selectedCurrency, openModal, openSidebar } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const [editTxnId, setEditTxnId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-6xl mx-auto w-full relative">
      {/* Background Glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Mobile Topbar */}
      <div className="sticky top-0 z-40 lg:hidden flex items-center justify-between h-16 -mx-4 px-4 bg-background/60 backdrop-blur-3xl border-b border-white/[0.04] mb-6">
        <button onClick={openSidebar} className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-surface-1 border border-white/[0.04] active:scale-95 transition-transform">
          <Menu size={18} className="text-foreground" />
        </button>
        <TypographySpan className="text-sm font-bold text-foreground flex-1 text-center tracking-wide">Transactions</TypographySpan>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-surface-1 border border-white/[0.04] active:scale-95 transition-transform">
            <Search size={16} className="text-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden w-full overflow-hidden mb-6"
          >
            <div className="relative flex items-center w-full h-12 rounded-[16px] bg-surface-1/50 backdrop-blur-md border border-white/[0.06] px-4 focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all shadow-sm">
              <Search size={16} className="text-muted-foreground/80" />
              <input
                autoFocus
                type="text"
                placeholder="Search anything..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="flex-1 bg-transparent border-none text-[15px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none ml-3"
              />
              {filters.search.length > 0 && (
                <button onClick={() => setFilters({ search: "" })} className="p-1">
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between mb-10">
        <div>
          <TypographyH1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Transactions
          </TypographyH1>
          <TypographyP className="text-[13px] text-muted-foreground/80 mt-1.5 font-medium tracking-wide">
            Manage and view your financial history
          </TypographyP>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center w-64 h-11 rounded-full bg-surface-1/40 backdrop-blur-md border border-white/[0.04] px-4 focus-within:w-80 focus-within:bg-surface-1/60 focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-300 shadow-sm group">
            <Search size={14} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="flex-1 bg-transparent border-none text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none ml-2.5"
            />
            {filters.search.length > 0 && (
              <button onClick={() => setFilters({ search: "" })} className="text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => openModal("addTransaction")}
            className="group relative flex items-center gap-2 h-11 px-5 rounded-full font-bold text-[13px] text-primary-foreground transition-all shadow-[0_4px_20px_rgba(var(--primary),0.3)] hover:shadow-[0_4px_25px_rgba(var(--primary),0.5)] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-500 rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out rounded-full" />
            <Plus size={14} className="relative z-10" />
            <TypographySpan className="relative z-10 tracking-wide">New Record</TypographySpan>
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5 mb-8">
        <div className="p-5 lg:p-6 rounded-[24px] border border-white/[0.03] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
            <ArrowDownUp className="w-32 h-32" />
          </div>
          <TypographySpan className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-1.5 block">Net Flow</TypographySpan>
          <TypographySpan className="text-2xl lg:text-3xl font-bold tabular-money tracking-tighter text-foreground">
            {symbol}{filtered.reduce((sum, t) => sum + (t.type === "EXPENSE" ? -t.amount : t.amount), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </TypographySpan>
        </div>
        <div className="p-5 lg:p-6 rounded-[24px] border border-white/[0.03] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
            <ReceiptText className="w-32 h-32" />
          </div>
          <TypographySpan className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-1.5 block">Total Records</TypographySpan>
          <TypographySpan className="text-2xl lg:text-3xl font-bold tabular-money tracking-tighter text-foreground">{filtered.length}</TypographySpan>
        </div>
        <div className="hidden md:flex p-5 lg:p-6 rounded-[24px] border border-white/[0.03] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group flex-col justify-center">
          <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity text-destructive">
            <ArrowDownUp className="w-32 h-32" />
          </div>
          <TypographySpan className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em] mb-1.5 block">Max Single</TypographySpan>
          <TypographySpan className="text-2xl lg:text-3xl font-bold tabular-money tracking-tighter text-destructive">
            {symbol}{filtered.length > 0 ? Math.max(...filtered.map(t => t.amount)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
          </TypographySpan>
        </div>
      </div>

      {/* Filters Sticky Bar */}
      <div className="sticky top-16 lg:top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 bg-background/80 backdrop-blur-3xl border-b border-white/[0.02] mb-6 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((t) => {
            const isActive = filters.type === t;
            let activeClass = "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]";
            if (t === "INCOME") activeClass = "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
            if (t === "EXPENSE") activeClass = "bg-destructive text-white border-destructive shadow-[0_0_12px_rgba(239,68,68,0.3)]";
            if (t === "TRANSFER") activeClass = "bg-slate-500 text-white border-slate-500 shadow-[0_0_12px_rgba(100,116,139,0.3)]";

            return (
              <Badge
                key={t}
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all duration-300",
                  isActive ? activeClass : "hover:bg-surface-2 bg-surface-1/50 border-white/[0.05] text-muted-foreground/80 hover:text-foreground"
                )}
                onClick={() => setFilters({ type: t })}
              >
                {t === "ALL" ? "All" : t}
              </Badge>
            )
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-9 px-3 rounded-xl bg-surface-1/40 border border-white/[0.04] hover:bg-surface-2/60 font-medium text-[12px] text-muted-foreground hover:text-foreground">
                <ArrowDownUp size={14} className="mr-2" />
                {sortOptions.find(o => o.value === filters.sortBy)?.label || "Sort"}
                <ChevronDown size={14} className="ml-2 opacity-50" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="rounded-[16px] border border-white/[0.05] bg-surface-1/90 backdrop-blur-2xl p-1.5 shadow-xl">
              {sortOptions.map(opt => (
                <DropdownMenuItem 
                  key={opt.value}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setFilters({ sortBy: opt.value as any })}
                  className={cn("rounded-[10px] text-[12px] font-medium px-3 py-2 cursor-pointer transition-colors", filters.sortBy === opt.value && "bg-surface-2 text-primary")}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            onClick={toggleTrashView}
            className={cn(
              "h-9 px-3 rounded-xl border font-bold text-[12px] transition-all", 
              filters.showDeleted 
                ? "bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20" 
                : "bg-surface-1/40 border-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-surface-2/60"
            )}
          >
            <Trash2 size={14} className="mr-2" />
            {filters.showDeleted ? "Exit Trash" : "Trash"}
          </Button>
        </div>
      </div>

      {/* Transactions Feed */}
      <div className="flex-1 pb-20 lg:pb-10">
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-[32px] bg-surface-1/10 backdrop-blur-sm">
            <EmptyState
              icon={ReceiptText}
              title="No records found"
              description="Adjust your filters or add a new transaction to get started."
              actionLabel="Add Transaction"
              onAction={() => openModal("addTransaction")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
              <div key={dateLabel} className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-1">
                  <TypographySpan className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">{dateLabel}</TypographySpan>
                  <div className="h-px bg-white/[0.03] flex-1" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  {txns.map((transaction) => {
                    const profile = getProfile(transaction.profileId);
                    const categoryLabel = getCategoryById(transaction.category)?.label || transaction.category;
                    
                    let catColor = getCategoryColor(transaction.category);
                    let iconName = getCategoryIconName(transaction.category);
                    
                    if (transaction.type === "TRANSFER") {
                      catColor = "hsl(var(--muted-foreground))";
                      iconName = "ArrowLeftRight";
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const Icon = (Icons as any)[iconName] || CircleDashed;
                    const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "" : "→";
                    
                    return (
                      <div
                        key={transaction.id}
                        onClick={() => setEditTxnId(transaction.id)}
                        className="group flex items-center justify-between p-3 sm:px-5 sm:py-4 rounded-[20px] bg-surface-1/20 border border-transparent hover:bg-surface-2/40 hover:border-white/[0.03] hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative"
                      >
                        {/* Hover Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                        <div className="flex items-center gap-4 z-10">
                          <div 
                            className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-inner"
                            style={{ backgroundColor: `${catColor}15`, color: catColor, boxShadow: `inset 0 0 0 1px ${catColor}20` }}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="flex flex-col">
                            <TypographySpan className="font-bold text-[14px] text-foreground tracking-tight group-hover:text-primary transition-colors">{transaction.title}</TypographySpan>
                            <div className="flex items-center gap-2 mt-0.5">
                              <TypographySpan className="text-[11px] font-medium text-muted-foreground/70">{categoryLabel}</TypographySpan>
                              <div className="w-1 h-1 rounded-full bg-white/[0.1]" />
                              <TypographySpan className="text-[11px] font-medium text-muted-foreground/70">{profile?.name || "Unknown"}</TypographySpan>
                              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/[0.1]" />
                              <TypographySpan className="hidden sm:block text-[11px] font-medium text-muted-foreground/50 tabular-nums">
                                {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </TypographySpan>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 z-10">
                          <div className={cn(
                            "flex items-center justify-center px-3 py-1.5 rounded-[10px] transition-transform duration-300 group-hover:scale-[1.02]",
                            transaction.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" :
                            transaction.type === "EXPENSE" ? "bg-surface-3/50 text-foreground" :
                            "bg-slate-500/10 text-slate-500"
                          )}>
                            <TypographySpan className="text-[14px] tabular-money font-bold tracking-tighter">
                              {sign}{symbol}{Math.abs(transaction.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </TypographySpan>
                          </div>
                          
                          {/* Slide-in Arrow */}
                          <div className="w-0 opacity-0 -ml-4 group-hover:w-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 flex justify-end">
                            <ArrowRight size={16} className="text-muted-foreground/50" />
                          </div>
                        </div>
                      </div>
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
