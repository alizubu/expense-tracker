"use client";

import { motion, Variants } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";

interface StatsStripProps {
  netBalance: number;
  income: number;
  expenses: number;
  sparklineData?: { value: number }[];
}

export function StatsStrip({ netBalance, income, expenses, sparklineData }: StatsStripProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.07,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <>
      {/* Card 1: Net Balance */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="col-span-2 xl:col-span-1 min-h-[76px] xl:h-[88px] rounded-[14px] px-[14px] py-[12px] xl:px-[18px] xl:py-[14px] flex items-center justify-between border-l-[3px] border-l-[#7c3aed] premium-card group"
        style={{
          background: "linear-gradient(135deg, #131028, #0e0d1c)",
          boxShadow: "0 0 20px rgba(124,58,237,0.08), 0 1px 0 rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(0,0,0,0.3) inset",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <div className="flex flex-col h-full justify-between gap-[4px] xl:gap-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#475569]">Net Balance</span>
            <div className="flex items-center gap-[4px]">
              <div className="h-[6px] w-[6px] rounded-full bg-[#10b981] animate-pulse" />
              <span className="hidden sm:inline text-[10px] text-[#10b981]">Live</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] text-[#f1f5f9] mr-[2px]">{symbol}</span>
            <NumberTicker value={netBalance} decimalPlaces={0} className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] text-[#f1f5f9] font-mono" />
          </div>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="hidden md:block h-[36px] w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(124,58,237,0.2)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="rgba(124,58,237,0)" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Card 2: Income */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="col-span-1 min-h-[76px] xl:h-[88px] rounded-[14px] px-[14px] py-[12px] xl:px-[18px] xl:py-[14px] flex items-center justify-between border-l-[3px] border-l-[#10b981] bg-[linear-gradient(145deg,#111120_0%,#0d0d18_100%)] border border-white/[0.06] border-l-[#10b981] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset] hover:border-[rgba(124,58,237,0.25)] hover:shadow-[0_0_0_1px_rgba(124,58,237,0.08)_inset,0_1px_0_rgba(255,255,255,0.04)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset] transition-all duration-200"
      >
        <div className="flex flex-col h-full justify-between gap-[4px] xl:gap-0">
          <div className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#475569]">Income</div>
          <div>
            <div className="flex items-baseline text-[#10b981]">
              <span className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] mr-[2px]">{symbol}</span>
              <NumberTicker value={income} decimalPlaces={0} className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] text-[#10b981] font-mono" />
            </div>
            <div className="hidden sm:block text-[10px] text-[#475569]">This month</div>
          </div>
        </div>
        <TrendingUp className="hidden sm:block h-[14px] w-[14px] text-[#10b981]" />
      </motion.div>

      {/* Card 3: Expenses */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="col-span-1 min-h-[76px] xl:h-[88px] rounded-[14px] px-[14px] py-[12px] xl:px-[18px] xl:py-[14px] flex items-center justify-between border-l-[3px] border-l-[#f43f5e] bg-[linear-gradient(145deg,#111120_0%,#0d0d18_100%)] border border-white/[0.06] border-l-[#f43f5e] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset] hover:border-[rgba(124,58,237,0.25)] hover:shadow-[0_0_0_1px_rgba(124,58,237,0.08)_inset,0_1px_0_rgba(255,255,255,0.04)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset] transition-all duration-200"
      >
        <div className="flex flex-col h-full justify-between gap-[4px] xl:gap-0">
          <div className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#475569]">Expenses</div>
          <div>
            <div className="flex items-baseline text-[#f43f5e]">
              <span className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] mr-[2px]">{symbol}</span>
              <NumberTicker value={expenses} decimalPlaces={0} className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] text-[#f43f5e] font-mono" />
            </div>
            <div className="hidden sm:block text-[10px] text-[#475569]">This month</div>
          </div>
        </div>
        <TrendingDown className="hidden sm:block h-[14px] w-[14px] text-[#f43f5e]" />
      </motion.div>

      {/* Card 4: Savings Rate */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="col-span-2 xl:col-span-1 min-h-[76px] xl:h-[88px] rounded-[14px] px-[14px] py-[12px] xl:px-[18px] xl:py-[14px] flex flex-col justify-between border-l-[3px] border-l-[#3b82f6] bg-[linear-gradient(145deg,#111120_0%,#0d0d18_100%)] border border-white/[0.06] border-l-[#3b82f6] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset] hover:border-[rgba(124,58,237,0.25)] hover:shadow-[0_0_0_1px_rgba(124,58,237,0.08)_inset,0_1px_0_rgba(255,255,255,0.04)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset] transition-all duration-200 relative pb-[20px]"
      >
        <div className="flex justify-between w-full">
          <div className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#475569]">Savings Rate</div>
        </div>
        <div className="flex flex-col gap-[2px] xl:gap-0">
          <div className="flex items-baseline text-[#f1f5f9]">
            <NumberTicker value={savingsRate} decimalPlaces={1} className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em] text-[#f1f5f9] font-mono" />
            <span className="text-[20px] sm:text-[22px] xl:text-[26px] font-bold tracking-[-0.04em]">%</span>
          </div>
          <div className="hidden sm:block text-[10px] text-[#475569]">of income saved</div>
        </div>
        <div className="absolute bottom-[10px] xl:bottom-[14px] left-[14px] right-[14px] xl:left-[18px] xl:right-[18px] h-[2px] bg-[#1e293b] rounded-[1px] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, savingsRate)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-[#3b82f6] rounded-[1px]"
          />
        </div>
      </motion.div>
    </>
  );
}
