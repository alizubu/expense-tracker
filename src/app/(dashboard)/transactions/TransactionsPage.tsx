"use client";

import React, { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
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

const CATEGORY_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  "Food / Restaurant": { icon: Utensils,       color: "text-amber-500", bg: "bg-amber-500/10" },
  "Groceries":         { icon: ShoppingCart,   color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "Gaming":            { icon: Gamepad2,       color: "text-violet-500", bg: "bg-violet-500/10" },
  "Electronics":       { icon: Cpu,            color: "text-blue-500", bg: "bg-blue-500/10" },
  "Ride Share":        { icon: Car,            color: "text-cyan-500", bg: "bg-cyan-500/10" },
  "Tax / Fines":       { icon: AlertCircle,    color: "text-rose-500", bg: "bg-rose-500/10" },
  "Transfer":          { icon: ArrowLeftRight, color: "text-slate-500", bg: "bg-slate-500/10" },
  "Clothing":          { icon: Shirt,          color: "text-pink-500", bg: "bg-pink-500/10" },
  "Fastfood":          { icon: Beef,           color: "text-orange-500", bg: "bg-orange-500/10" },
  "Medicine":          { icon: Pill,           color: "text-teal-500", bg: "bg-teal-500/10" },
  "Travel":            { icon: Plane,          color: "text-purple-500", bg: "bg-purple-500/10" },
};

function getCatStyle(label: string) {
  return CATEGORY_MAP[label] || { icon: Circle, color: "text-slate-500", bg: "bg-slate-500/10" };
}

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
        <button onClick={openSidebar} className="flex items-center justify-center w-8 h-8 rounded-md bg-muted border border-border">
          <Menu size={16} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground flex-1 text-center">Transactions</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="flex items-center justify-center w-8 h-8 rounded-md bg-muted border border-border">
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
            <div className="relative flex items-center w-full h-10 rounded-md bg-muted border border-border px-3 focus-within:ring-2 focus-within:ring-primary/20">
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
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9 h-10 bg-background"
            />
            {filters.search.length > 0 && (
              <button onClick={() => setFilters({ search: "" })} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
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
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs px-3 py-1 font-medium whitespace-nowrap transition-colors",
                  isActive ? activeStyles : "hover:bg-muted"
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
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <ArrowDownUp size={14} className="mr-2 text-muted-foreground" />
                {sortOptions.find(o => o.value === filters.sortBy)?.label || "Sort by Date"}
                <ChevronDown size={14} className="ml-2 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map(opt => (
                <DropdownMenuItem 
                  key={opt.value}
                  onClick={() => setFilters({ sortBy: opt.value as any })}
                  className={cn(filters.sortBy === opt.value && "bg-muted font-medium")}
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
            className={cn("h-8", filters.showDeleted && "border-destructive text-destructive hover:bg-destructive/10")}
          >
            <Trash2 size={14} className="mr-2" />
            {filters.showDeleted ? "Exit Trash" : "View Trash"}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col justify-center">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Total</span>
          <span className="text-xl font-bold font-mono text-foreground truncate">
            {symbol}{filtered.reduce((sum, t) => sum + (t.type === "EXPENSE" ? -t.amount : t.amount), 0).toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Count</span>
          <span className="text-xl font-bold font-mono text-foreground truncate">{filtered.length}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">Largest</span>
          <span className="text-xl font-bold font-mono text-destructive truncate">
            {symbol}{filtered.length > 0 ? Math.max(...filtered.map(t => t.amount)).toLocaleString() : 0}
          </span>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="flex-1 overflow-hidden flex flex-col border-border shadow-sm">
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
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Profile</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
                  <React.Fragment key={dateLabel}>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={6} className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {dateLabel}
                      </TableCell>
                    </TableRow>
                    {txns.map((transaction) => {
                      const profile = getProfile(transaction.profileId);
                      const categoryLabel = getCategoryById(transaction.category)?.label || transaction.category;
                      const catStyle = getCatStyle(transaction.type === "TRANSFER" ? "Transfer" : categoryLabel);
                      const Icon = catStyle.icon;

                      const amountColor =
                        transaction.type === "INCOME" ? "text-emerald-500"
                        : transaction.type === "EXPENSE" ? "text-destructive"
                        : "text-slate-500";

                      const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "−" : "→";

                      return (
                        <TableRow 
                          key={transaction.id}
                          onClick={() => setEditTxnId(transaction.id)}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${catStyle.bg}`}>
                              <Icon size={14} className={catStyle.color} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{transaction.title}</div>
                            <div className="text-xs text-muted-foreground sm:hidden mt-1">
                              {transaction.type === "TRANSFER" ? "Transfer" : categoryLabel} • {profile?.name}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {transaction.type === "TRANSFER" ? "Transfer" : categoryLabel}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {profile?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            <span className={amountColor}>
                              {sign}{symbol}{Math.abs(transaction.amount).toLocaleString()}
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
