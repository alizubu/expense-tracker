"use client";

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
  ArrowDownUp, ReceiptText, CircleDashed, Menu, Plus
} from "lucide-react";
import * as Icons from "lucide-react";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedSearch } from "@/components/ui/animated-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Mobile Topbar */}
      <div className="sticky top-0 z-40 lg:hidden flex items-center justify-between h-14 -mx-4 px-4 bg-background/95 backdrop-blur-md border-b border-border/50 mb-4">
        <button onClick={openSidebar} className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-2 border border-border">
          <Menu size={16} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground flex-1 text-center">Transactions</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-2 border border-border">
            <Search size={15} className="text-muted-foreground" />
          </button>
          <button onClick={() => openModal("addTransaction")} className="flex items-center justify-center w-8 h-8 rounded-md bg-primary shadow-sm">
            <Plus size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-14 z-30 lg:hidden w-full bg-background border-b border-border/50 -mx-4 px-4 py-2 mb-4"
          >
            <div className="relative flex items-center w-full h-10 rounded-md bg-surface-2 border border-border px-3 focus-within:ring-2 focus-within:ring-primary/20">
              <Search size={14} className="text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="flex-1 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ml-2"
              />
              {filters.search.length > 0 && (
                <button onClick={() => setFilters({ search: "" })} className="p-1">
                  <X size={13} className="text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and view your financial history.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatedSearch
            value={filters.search}
            onChange={(val) => setFilters({ search: val })}
            placeholder="Search transactions..."
          />
          <Button onClick={() => openModal("addTransaction")}>
            <Plus size={16} className="mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
          {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((t) => {
            const isActive = filters.type === t;
            let activeStyles = "bg-primary text-primary-foreground border-primary";
            if (t === "INCOME") { activeStyles = "bg-emerald-500 text-white border-emerald-500"; }
            if (t === "EXPENSE") { activeStyles = "bg-destructive text-destructive-foreground border-destructive"; }
            if (t === "TRANSFER") { activeStyles = "bg-slate-500 text-white border-slate-500"; }

            return (
              <Badge
                key={t}
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer text-xs px-3 py-1 font-medium whitespace-nowrap transition-colors",
                  isActive ? activeStyles : "hover:bg-surface-2 bg-surface-1 border-white/[0.04]"
                )}
                onClick={() => setFilters({ type: t })}
              >
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              </Badge>
            )
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 bg-surface-1 border-white/[0.04]" />}>
              <ArrowDownUp size={14} className="mr-2 text-muted-foreground" />
              {sortOptions.find(o => o.value === filters.sortBy)?.label || "Sort by Date"}
              <ChevronDown size={14} className="ml-2 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map(opt => (
                <DropdownMenuItem 
                  key={opt.value}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setFilters({ sortBy: opt.value as any })}
                  className={cn(filters.sortBy === opt.value && "bg-surface-2 font-medium")}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTrashView}
            className={cn("h-8 bg-surface-1 border-white/[0.04]", filters.showDeleted && "border-destructive text-destructive hover:bg-destructive/10")}
          >
            <Trash2 size={14} className="mr-2" />
            {filters.showDeleted ? "Exit Trash" : "View Trash"}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-6 rounded-2xl border-white/[0.04] bg-surface-1 flex flex-col justify-center shadow-sm">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-widest mb-1">Total</span>
          <span className="text-xl font-bold tabular-money tracking-tight text-foreground truncate">
            {symbol}{filtered.reduce((sum, t) => sum + (t.type === "EXPENSE" ? -t.amount : t.amount), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </Card>
        <Card className="p-6 rounded-2xl border-white/[0.04] bg-surface-1 flex flex-col justify-center shadow-sm">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-widest mb-1">Count</span>
          <span className="text-xl font-bold tabular-money tracking-tight text-foreground truncate">{filtered.length}</span>
        </Card>
        <Card className="p-6 rounded-2xl border-white/[0.04] bg-surface-1 flex flex-col justify-center shadow-sm">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-widest mb-1">Largest</span>
          <span className="text-xl font-bold tabular-money tracking-tight text-destructive truncate">
            {symbol}{filtered.length > 0 ? Math.max(...filtered.map(t => t.amount)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
          </span>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="flex-1 overflow-hidden flex flex-col rounded-2xl border-white/[0.04] bg-surface-1 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={ReceiptText}
              title="No transactions yet"
              description="Add your first transaction or clear filters to see your feed."
              actionLabel="Add Transaction"
              onAction={() => openModal("addTransaction")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-white/[0.04]">
                  <TableHead className="w-[88px] pl-6"></TableHead>
                  <TableHead className="text-left font-semibold">Transaction</TableHead>
                  <TableHead className="hidden md:table-cell text-left font-semibold">Category</TableHead>
                  <TableHead className="hidden sm:table-cell text-left font-semibold">Profile</TableHead>
                  <TableHead className="hidden lg:table-cell text-center font-semibold">Date</TableHead>
                  <TableHead className="text-right font-semibold pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
                  <React.Fragment key={dateLabel}>
                    <TableRow className="bg-transparent hover:bg-transparent border-b border-white/[0.02]">
                      <TableCell colSpan={6} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest bg-surface-1/30">
                        {dateLabel}
                      </TableCell>
                    </TableRow>
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

                      const amountColor =
                        transaction.type === "INCOME" ? "text-emerald-500"
                        : transaction.type === "EXPENSE" ? "text-foreground"
                        : "text-muted-foreground";

                      const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "" : "→";

                      return (
                        <TableRow 
                          key={transaction.id}
                          onClick={() => setEditTxnId(transaction.id)}
                          className="cursor-pointer transition-colors hover:bg-surface-2 border-b border-white/[0.02] group"
                        >
                          <TableCell className="pl-6">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
                              style={{ backgroundColor: `${catColor}1a`, color: catColor }}
                            >
                              <Icon size={18} />
                            </div>
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{transaction.title}</div>
                            <div className="text-xs text-muted-foreground sm:hidden mt-0.5">
                              {transaction.type === "TRANSFER" ? "Transfer" : categoryLabel} • {profile?.name}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm text-left font-medium">
                            {transaction.type === "TRANSFER" ? "Transfer" : categoryLabel}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm text-left font-medium">
                            {profile?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs text-center font-medium">
                            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <span className={`tabular-money font-semibold tracking-tight ${amountColor}`}>
                              {sign}{symbol}{Math.abs(transaction.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

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
