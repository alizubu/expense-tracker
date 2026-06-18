import { create } from "zustand";
import { Transaction } from "@/lib/types";

import { generateId } from "@/lib/utils";

interface TransactionFilters {
  search: string;
  type: "ALL" | "INCOME" | "EXPENSE" | "TRANSFER";
  profileIds: string[];
  categories: string[];
  dateRange: { from: Date | null; to: Date | null };
  sortBy: "date" | "amount" | "category";
  sortOrder: "asc" | "desc";
  showDeleted: boolean;
}

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  restoreTransaction: (id: string) => Promise<void>;
  duplicateTransaction: (id: string) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  getFilteredTransactions: () => Transaction[];
}

const defaultFilters: TransactionFilters = {
  search: "",
  type: "ALL",
  profileIds: [],
  categories: [],
  dateRange: { from: null, to: null },
  sortBy: "date",
  sortOrder: "desc",
  showDeleted: false,
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filters: defaultFilters,
  isLoading: false,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/transactions?trash=${get().filters.showDeleted ? "true" : "false"}`);
      const data = await res.json();
      set({ transactions: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      console.error(error);
      set({ transactions: [], isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      const newTxn = await res.json();
      set((state) => ({ transactions: [newTxn, ...state.transactions] }));
    } catch (error) {
      console.error(error);
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const updatedTxn = await res.json();
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTxn : t
        ),
      }));
      // also refetch to sync balances if necessary, but this requires profile store
    } catch (error) {
      console.error(error);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  restoreTransaction: async (id) => {
    try {
      await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDeleted: false }),
      });
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  duplicateTransaction: (id) => {
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;
    get().addTransaction({
      ...transaction,
      date: new Date().toISOString(),
      title: `${transaction.title} (copy)`,
    });
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => set({ filters: defaultFilters }),

  getFilteredTransactions: () => {
    const { transactions, filters } = get();
    let filtered = [...transactions];

    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.note?.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    // Type filter
    if (filters.type !== "ALL") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Profile filter
    if (filters.profileIds.length > 0) {
      filtered = filtered.filter((t) =>
        filters.profileIds.includes(t.profileId)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((t) =>
        filters.categories.includes(t.category)
      );
    }

    // Date range filter
    if (filters.dateRange.from) {
      filtered = filtered.filter(
        (t) => new Date(t.date) >= filters.dateRange.from!
      );
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(
        (t) => new Date(t.date) <= filters.dateRange.to!
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  },
}));
