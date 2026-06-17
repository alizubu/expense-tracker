import { create } from "zustand";

export interface RecurringRule {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category: string;
  profileId: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDate: string;
  isActive: boolean;
}

interface RecurringState {
  rules: RecurringRule[];
  addRule: (rule: Omit<RecurringRule, "id" | "userId">) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
}

export const useRecurringStore = create<RecurringState>((set) => ({
  rules: [],
  addRule: (rule) => set((state) => ({
    rules: [
      ...state.rules,
      {
        ...rule,
        id: `rec_${Date.now()}`,
        userId: "user_1",
      }
    ]
  })),
  toggleRule: (id) => set((state) => ({
    rules: state.rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r)
  })),
  deleteRule: (id) => set((state) => ({
    rules: state.rules.filter((r) => r.id !== id)
  }))
}));
