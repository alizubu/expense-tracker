import { create } from "zustand";


export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: "monthly" | "weekly";
  spent: number;
  month: number;
  year: number;
}

interface BudgetState {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, "id" | "userId" | "spent">) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  addBudget: (budget) => set((state) => ({
    budgets: [
      ...state.budgets,
      {
        ...budget,
        id: `budget_${Date.now()}`,
        userId: "user_1",
        spent: 0,
      }
    ]
  })),
  updateBudget: (id, updates) => set((state) => ({
    budgets: state.budgets.map((b) => b.id === id ? { ...b, ...updates } : b)
  })),
  deleteBudget: (id) => set((state) => ({
    budgets: state.budgets.filter((b) => b.id !== id)
  }))
}));
