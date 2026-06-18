"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";

const mockSparklineData = [
  { value: 100 }, { value: 120 }, { value: 115 }, { value: 130 }, { value: 140 }, { value: 135 }, { value: 150 }
];

export function NetBalanceCard() {
  const { selectedCurrency, selectedMonth, selectedYear } = useUIStore();
  const { getTotalBalance } = useProfileStore();
  const { transactions } = useTransactionStore();
  
  const symbol = getCurrencySymbol(selectedCurrency);
  const totalBalance = getTotalBalance();

  const { totalIncome, totalExpense, savingsRate } = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const inc = monthTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const exp = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    const rate = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
    
    return { totalIncome: inc, totalExpense: exp, savingsRate: rate };
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden hover:border-[var(--border-strong)] transition-colors duration-150"
    >
      <div className="flex flex-col md:flex-row p-6 md:p-8">
        {/* Left Side (70%) */}
        <div className="flex-1 md:w-[70%]">
          <p className="text-[10px] font-medium tracking-[0.1em] text-[var(--text-muted)] uppercase mb-2">
            Net Balance
          </p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-mono text-2xl text-[var(--text-secondary)]">{symbol}</span>
            <NumberTicker
              value={totalBalance}
              className="font-mono text-[48px] font-semibold text-[var(--text-primary)] tracking-tight"
              decimalPlaces={0}
              duration={1.2}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-[10px] py-[4px] rounded-[20px] bg-[var(--green-dim)] text-[var(--green)] font-mono text-[13px] flex items-center gap-1">
              <span>↑</span>
              <span>{symbol}{totalIncome.toLocaleString()}</span>
            </div>
            <div className="px-[10px] py-[4px] rounded-[20px] bg-[var(--red-dim)] text-[var(--red)] font-mono text-[13px] flex items-center gap-1">
              <span>↓</span>
              <span>{symbol}{totalExpense.toLocaleString()}</span>
            </div>
            <div className="px-[10px] py-[4px] rounded-[20px] bg-[rgba(124,58,237,0.12)] text-[var(--accent-light)] font-mono text-[13px] flex items-center gap-1">
              <span>%</span>
              <span>{savingsRate}%</span>
            </div>
          </div>
        </div>

        {/* Right Side (30%) - Sparkline */}
        <div className="mt-6 md:mt-0 md:w-[30%] flex items-center justify-end">
          <div className="h-[60px] w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent)" 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-[var(--border-subtle)] px-6 md:px-8 py-2 bg-[var(--bg-base)]">
        <p className="text-[11px] text-[var(--text-muted)]">
          Last updated just now
        </p>
      </div>
    </motion.div>
  );
}
