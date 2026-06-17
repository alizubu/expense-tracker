import { create } from "zustand";
import { Transaction } from "@/lib/types";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { generateId } from "@/lib/utils";

interface TransactionFilters {
  search: string;
  type: "ALL" | "INCOME" | "EXPENSE" | "TRANSFER";
  profileIds: string[];
  categories: string[];
  dateRange: { from: Date | null; to: Date | null };
  sortBy: "date" | "amount" | "category";
  sortOrder: "asc" | "desc";
}

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;
  // Actions
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
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
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: MOCK_TRANSACTIONS,
  filters: defaultFilters,
  isLoading: false,

  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
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
