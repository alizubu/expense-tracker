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

const MOCK_RECURRING: RecurringRule[] = [
  {
    id: "rec_1",
    userId: "user_1",
    title: "Netflix Subscription",
    amount: 14.99,
    type: "EXPENSE",
    category: "streaming",
    profileId: "prof_1",
    frequency: "monthly",
    nextDate: new Date(new Date().setDate(15)).toISOString(),
    isActive: true,
  },
  {
    id: "rec_2",
    userId: "user_1",
    title: "Salary",
    amount: 4500,
    type: "INCOME",
    category: "salary",
    profileId: "prof_2",
    frequency: "monthly",
    nextDate: new Date(new Date().setDate(1)).toISOString(),
    isActive: true,
  }
];

interface RecurringState {
  rules: RecurringRule[];
  addRule: (rule: Omit<RecurringRule, "id" | "userId">) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
}

export const useRecurringStore = create<RecurringState>((set) => ({
  rules: MOCK_RECURRING,
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
