"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
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
      className="flex flex-col w-full bg-[#FFFFFF] rounded-[16px] overflow-hidden"
      style={{
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
        padding: "24px 28px"
      }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Side (65%) */}
        <div className="flex flex-col md:w-[65%]">
          <p className="text-[11px] font-medium tracking-[0.06em] text-[#9CA3AF] mb-2">
            Net balance
          </p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-mono text-3xl font-semibold text-[#111111]">{symbol}</span>
            <NumberTicker
              value={totalBalance}
              className="font-mono text-[52px] font-bold text-[#111111] tracking-tight"
              decimalPlaces={0}
              duration={1.5}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="px-[12px] py-[4px] rounded-[20px] bg-[#ECFDF5] text-[#059669] font-mono text-[12px] flex items-center gap-1 border border-[rgba(5,150,105,0.15)]">
              <span>↑</span>
              <span>{symbol}{totalIncome.toLocaleString()}</span>
            </div>
            <div className="px-[12px] py-[4px] rounded-[20px] bg-[#FEF2F2] text-[#DC2626] font-mono text-[12px] flex items-center gap-1 border border-[rgba(220,38,38,0.15)]">
              <span>↓</span>
              <span>{symbol}{totalExpense.toLocaleString()}</span>
            </div>
            <div className="px-[12px] py-[4px] rounded-[20px] bg-[#EEF2FF] text-[#4F46E5] font-mono text-[12px] flex items-center gap-1 border border-[rgba(79,70,229,0.15)]">
              <span>{savingsRate}% saved</span>
            </div>
          </div>
          
          <div className="mt-2 pt-[16px] border-t border-[rgba(0,0,0,0.05)]">
            <p className="text-[11px] text-[#9CA3AF]">
              Last updated just now
            </p>
          </div>
        </div>

        {/* Right Side (35%) - Sparkline */}
        <div className="mt-6 md:mt-0 md:w-[35%] flex items-center justify-end">
          <div className="h-[80px] w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSparklineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(124,58,237,0.15)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="rgba(124,58,237,0)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#7C3AED" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
