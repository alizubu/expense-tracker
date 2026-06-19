// ── Core Types for the Expense Tracker ──────────────────────

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type ProfileType =
  | "MONEYBAG"
  | "CASH"
  | "BANK"
  | "MOBILE_BANKING"
  | "Bkash"
  | "SAVINGS"
  | "INVESTMENT"
  | "CRYPTO"
  | "CUSTOM";

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  type: ProfileType;
  icon: string;
  color: string;
  balance: number;
  description?: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  profileId: string;
  toProfileId?: string;
  type: TransactionType;
  amount: number;
  category: string;
  subCategory?: string;
  title: string;
  note?: string;
  date: string;
  attachmentUrl?: string;
  tags: string[];
  createdAt: string;
}



// ── Chart / Analytics Types ────────────────────────────────

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface CategoryBreakdown {
  category: string;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}

export interface DailySpend {
  date: string;
  amount: number;
  cumulative: number;
}
