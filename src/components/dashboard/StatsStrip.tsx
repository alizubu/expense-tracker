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
        whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.22)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        variants={cardVariants}
        className="col-span-2 xl:col-span-1 min-h-[76px] xl:h-[86px] rounded-[14px] px-[18px] py-[14px] flex items-center justify-between border-[1px] border-[rgba(255,255,255,0.055)] border-l-[3px] border-l-[#7c3aed] relative overflow-hidden card-hover"
        style={{
          background: "linear-gradient(145deg, #100e22 0%, #0c0b1a 100%)",
          boxShadow: "inset 0 1px 0 rgba(124,58,237,0.08), 0 0 20px rgba(124,58,237,0.06)"
        }}
      >
        <div className="flex flex-col h-full justify-center gap-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-[0.10em] uppercase text-[#334155]">Net Balance</span>
            <div className="h-[6px] w-[6px] rounded-full bg-[#10b981] shadow-[0_0_0_0_rgba(16,185,129,0.7)]" style={{ animation: "livePulse 2s ease-in-out infinite" }} />
          </div>
          <div className="flex items-baseline">
            <span className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] text-[#f1f5f9] font-amount mr-1">{symbol}</span>
            <NumberTicker value={netBalance} decimalPlaces={0} className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] text-[#f1f5f9] font-amount" />
          </div>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            className="h-[34px] w-[80px] z-10"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(124,58,237,0.25)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="rgba(124,58,237,0)" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={1.5} dot={false} isAnimationActive={false} fill="url(#sparklineGrad)" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </motion.div>

      {/* Card 2: Income */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.22)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        variants={cardVariants}
        className="col-span-1 min-h-[76px] xl:h-[86px] rounded-[14px] px-[18px] py-[14px] flex items-center justify-between border-[1px] border-[rgba(255,255,255,0.055)] border-l-[3px] border-l-[#10b981] card-hover"
        style={{
          background: "linear-gradient(145deg, #0f0f1e 0%, #0c0c18 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.25)"
        }}
      >
        <div className="flex flex-col h-full justify-center gap-1">
          <div className="text-[10px] font-medium tracking-[0.10em] uppercase text-[#334155]">Income</div>
          <div>
            <div className="flex items-baseline text-[#10b981]">
              <span className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] mr-1 font-amount">{symbol}</span>
              <NumberTicker value={income} decimalPlaces={0} className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] text-[#10b981] font-amount" />
            </div>
            <div className="text-[10px] text-[#475569]">This month</div>
          </div>
        </div>
        <TrendingUp size={14} color="#10b981" />
      </motion.div>

      {/* Card 3: Expenses */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.22)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        variants={cardVariants}
        className="col-span-1 min-h-[76px] xl:h-[86px] rounded-[14px] px-[18px] py-[14px] flex items-center justify-between border-[1px] border-[rgba(255,255,255,0.055)] border-l-[3px] border-l-[#f43f5e] card-hover"
        style={{
          background: "linear-gradient(145deg, #1a0e12 0%, #130b0e 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.25)"
        }}
      >
        <div className="flex flex-col h-full justify-center gap-1">
          <div className="text-[10px] font-medium tracking-[0.10em] uppercase text-[#334155]">Expenses</div>
          <div>
            <div className="flex items-baseline text-[#f43f5e]">
              <span className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] mr-1 font-amount">{symbol}</span>
              <NumberTicker value={expenses} decimalPlaces={0} className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] text-[#f43f5e] font-amount" />
            </div>
            <div className="text-[10px] text-[#475569]">This month</div>
          </div>
        </div>
        <TrendingDown size={14} color="#f43f5e" />
      </motion.div>

      {/* Card 4: Savings Rate */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.005, borderColor: 'rgba(124,58,237,0.22)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        variants={cardVariants}
        className="col-span-2 xl:col-span-1 min-h-[76px] xl:h-[86px] rounded-[14px] px-[18px] py-[14px] flex flex-col justify-center border-[1px] border-[rgba(255,255,255,0.055)] border-l-[3px] border-l-[#3b82f6] relative card-hover"
        style={{
          background: "linear-gradient(145deg, #0f0f1e 0%, #0c0c18 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.25)"
        }}
      >
        <div className="text-[10px] font-medium tracking-[0.10em] uppercase text-[#334155] mb-1">Savings Rate</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline text-[#f1f5f9]">
            <NumberTicker value={savingsRate} decimalPlaces={1} className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em] text-[#f1f5f9] font-amount" />
            <span className="text-[24px] xl:text-[28px] font-bold tracking-[-0.04em]">%</span>
          </div>
          <div className="text-[10px] text-[#475569]">of income saved</div>
        </div>
        <div className="absolute bottom-0 left-[18px] right-[18px] h-[2px] bg-[rgba(255,255,255,0.06)] rounded-[1px] overflow-hidden translate-y-[-14px]">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(100, savingsRate)}%` }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-[#3b82f6] rounded-[1px]"
          />
        </div>
      </motion.div>
    </>
  );
}
