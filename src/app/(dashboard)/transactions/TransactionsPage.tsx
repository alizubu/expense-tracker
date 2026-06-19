"use client";

import { useState, useMemo } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currencies";
import { formatGroupDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Search, Filter, Download, Trash2, MoreVertical, X, ArchiveRestore } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

export default function TransactionsPage() {
  const { transactions, deleteTransaction, setFilters, filters, getFilteredTransactions } = useTransactionStore();
  const { getProfile } = useProfileStore();
  const { selectedCurrency, activeModal, openModal, closeModal } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editTxnId, setEditTxnId] = useState<string | null>(null);

  const filtered = getFilteredTransactions();
  const editTransaction = transactions.find(t => t.id === editTxnId);

  const toggleTrashView = () => {
    setFilters({ showDeleted: !filters.showDeleted });
    // Trigger a refetch
    useTransactionStore.getState().fetchTransactions();
  };

  // Group by date
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteTransaction(id));
    setSelectedIds(new Set());
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <BlurFade delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-heading">Transactions</h1>
            <p className="text-sm text-text-secondary mt-1">{filtered.length} transactions</p>
          </div>
          <button
            onClick={() => openModal("addTransaction")}
            className="flex items-center gap-2 rounded-lg bg-brand-purple/15 px-4 py-2.5 text-sm font-medium text-brand-purple-light hover:bg-brand-purple/25 transition-colors"
          >
            <LucideIcons.Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
      </BlurFade>

      {/* Filters Bar */}
      <BlurFade delay={0.05}>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-background-card p-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title, amount, category..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full rounded-lg border border-white/[0.06] bg-background-elevated pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple/30 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-lg bg-white/[0.04] p-0.5">
            {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilters({ type: t })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  filters.type === t
                    ? "bg-white/[0.08] text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as "date" | "amount" | "category" })}
            className="rounded-lg border border-white/[0.06] bg-background-elevated px-3 py-2 text-xs text-text-secondary focus:outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="category">Sort by Category</option>
          </select>

          {/* Trash Toggle */}
          <button
            onClick={toggleTrashView}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ml-auto",
              filters.showDeleted
                ? "bg-[var(--red-dim)] text-[var(--red)] border border-[rgba(244,63,94,0.2)]"
                : "bg-white/[0.04] text-text-secondary hover:text-text-primary hover:bg-white/[0.08] border border-white/[0.06]"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {filters.showDeleted ? "Exit Trash" : "View Trash"}
          </button>
        </div>
      </BlurFade>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-brand-purple/10 border border-brand-purple/20 px-4 py-2.5">
          <span className="text-sm text-brand-purple-light">{selectedIds.size} selected</span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 rounded-md bg-expense/15 px-3 py-1.5 text-xs font-medium text-expense hover:bg-expense/25 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-text-muted hover:text-text-secondary"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Transaction List */}
      <BlurFade delay={0.1}>
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
            <div key={dateLabel}>
              {/* Date Header */}
              <div className="sticky top-16 z-10 mb-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider bg-background-primary/90 backdrop-blur-sm py-2">
                  {dateLabel}
                </p>
              </div>

              {/* Transactions */}
              <div className="space-y-1">
                {txns.map((transaction) => {
                  const category = getCategoryById(transaction.category);
                  const profile = getProfile(transaction.profileId);
                  const Icon = category ? getIcon(category.icon) : LucideIcons.CircleDot;
                  const isSelected = selectedIds.has(transaction.id);

                  const amountColor =
                    transaction.type === "INCOME" ? "text-income"
                    : transaction.type === "EXPENSE" ? "text-expense"
                    : "text-transfer";

                  const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : "";

                  return (
                    <div
                      key={transaction.id}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.03]",
                        isSelected && "bg-brand-purple/5 ring-1 ring-brand-purple/20"
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(transaction.id)}
                        className={cn(
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all",
                          isSelected
                            ? "border-brand-purple bg-brand-purple text-white"
                            : "border-white/[0.1] opacity-0 group-hover:opacity-100"
                        )}
                      >
                        {isSelected && <LucideIcons.Check className="h-3 w-3" />}
                      </button>

                      {/* Icon */}
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: (category?.color || "#64748B") + "18" }}
                      >
                        <Icon className="h-5 w-5" style={{ color: category?.color || "#64748B" }} />
                      </div>

                      {/* Title & meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{transaction.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-text-muted">{category?.label || transaction.category}</span>
                          {profile && (
                            <>
                              <span className="text-xs text-text-muted">•</span>
                              <span className="inline-flex items-center rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-text-muted">
                                {profile.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-sm font-semibold tabular-nums", amountColor)}>
                          {sign}{symbol} {transaction.amount.toLocaleString()}
                        </p>
                      </div>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === transaction.id ? null : transaction.id)}
                          className="rounded-lg p-1.5 text-text-muted opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === transaction.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-1 shadow-xl">
                            {!filters.showDeleted ? (
                              <>
                                <button
                                  onClick={() => { setEditTxnId(transaction.id); setOpenMenuId(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                                >
                                  <LucideIcons.Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  onClick={() => { useTransactionStore.getState().duplicateTransaction(transaction.id); setOpenMenuId(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                                >
                                  <LucideIcons.Copy className="h-3.5 w-3.5" /> Duplicate
                                </button>
                                <button
                                  onClick={() => { deleteTransaction(transaction.id); setOpenMenuId(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--red)] hover:bg-[var(--bg-hover)]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => { useTransactionStore.getState().restoreTransaction(transaction.id); setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--green)] hover:bg-[var(--bg-hover)]"
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LucideIcons.Search className="h-12 w-12 text-text-muted mb-3" />
              <p className="text-base font-medium text-text-secondary">No transactions found</p>
              <p className="text-sm text-text-muted mt-1">Try adjusting your filters or add a new transaction</p>
            </div>
          )}
        </div>
      </BlurFade>

      {/* Modal */}
      {/* GlobalModals handles AddTransactionModal */}
      {editTxnId && editTransaction && (
        <EditTransactionModal
          transaction={editTransaction}
          onClose={() => setEditTxnId(null)}
        />
      )}
    </div>
  );
}
