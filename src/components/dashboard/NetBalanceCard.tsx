"use client";

import { MagicCard } from "@/components/magicui/magic-card";
import { Meteors } from "@/components/magicui/meteors";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { TrendingUp, TrendingDown, Percent, ChevronDown } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function NetBalanceCard() {
  const { selectedCurrency, selectedMonth, selectedYear, setSelectedMonth } = useUIStore();
  const { getTotalBalance } = useProfileStore();
  const { transactions } = useTransactionStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const totalBalance = getTotalBalance();

  // Calculate this month's income/expense
  const now = new Date();
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <MagicCard className="relative overflow-hidden p-6 lg:p-8" gradientColor="#7C3AED" gradientOpacity={0.1}>
      {/* Meteors background */}
      <Meteors number={15} />

      <div className="relative z-10">
        {/* Month selector */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-sm text-text-secondary hover:bg-white/[0.08] transition-colors">
              {months[selectedMonth - 1]} {selectedYear}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {["BDT", "USD", "EUR"].map((cur) => (
              <button
                key={cur}
                onClick={() => useUIStore.getState().setCurrency(cur)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  selectedCurrency === cur
                    ? "bg-brand-purple/20 text-brand-purple-light"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {getCurrencySymbol(cur)} {cur}
              </button>
            ))}
          </div>
        </div>

        {/* Main balance */}
        <div className="mb-1">
          <p className="text-sm font-medium text-text-secondary mb-1">Net Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-text-secondary">{symbol}</span>
            <NumberTicker
              value={totalBalance}
              className="text-4xl font-bold text-text-primary lg:text-5xl"
              decimalPlaces={2}
              duration={800}
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Income pill */}
          <div className="flex items-center gap-2 rounded-full bg-income/10 px-4 py-2">
            <TrendingUp className="h-4 w-4 text-income" />
            <div>
              <p className="text-[10px] font-medium text-income/70 uppercase tracking-wider">Income</p>
              <p className="text-sm font-semibold text-income tabular-nums">
                {symbol} {totalIncome.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Expense pill */}
          <div className="flex items-center gap-2 rounded-full bg-expense/10 px-4 py-2">
            <TrendingDown className="h-4 w-4 text-expense" />
            <div>
              <p className="text-[10px] font-medium text-expense/70 uppercase tracking-wider">Expense</p>
              <p className="text-sm font-semibold text-expense tabular-nums">
                {symbol} {totalExpense.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Savings rate pill */}
          <div className="flex items-center gap-2 rounded-full bg-brand-purple/10 px-4 py-2">
            <Percent className="h-4 w-4 text-brand-purple-light" />
            <div>
              <p className="text-[10px] font-medium text-brand-purple-light/70 uppercase tracking-wider">Savings</p>
              <p className="text-sm font-semibold text-brand-purple-light tabular-nums">
                {savingsRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </MagicCard>
  );
}
