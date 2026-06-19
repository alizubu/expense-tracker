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
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
      {/* Card 1: Net Balance (HERO) */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="h-[96px] rounded-[14px] py-4 px-5 flex flex-col justify-between border-l-[3px] border-l-[#7c3aed] relative overflow-hidden cursor-pointer hover:border-[rgba(139,92,246,0.4)] transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, #13111e 0%, #0f0d1a 100%)",
          borderTop: "1px solid rgba(139, 92, 246, 0.2)",
          borderRight: "1px solid rgba(139, 92, 246, 0.2)",
          borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
          boxShadow: "0 0 40px rgba(124, 58, 237, 0.08)"
        }}
      >
        <div className="flex justify-between items-center z-10">
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#475569]">Net Balance</span>
          <div className="flex items-center gap-1.5">
            <div className="h-[6px] w-[6px] rounded-full bg-[#10b981]" />
            <span className="text-[10px] text-[#10b981]">Live</span>
          </div>
        </div>
        <div className="flex justify-between items-end z-10">
          <div className="flex items-baseline">
            <span className="text-[28px] font-bold tracking-[-0.03em] text-[#f8fafc] mr-1">{symbol}</span>
            <NumberTicker value={netBalance} decimalPlaces={0} className="text-[28px] font-bold tracking-[-0.03em] text-[#f8fafc]" />
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-[32px] w-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Card 2: Income */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="h-[96px] rounded-[14px] py-4 px-5 flex flex-col justify-between bg-[#111118] border border-[rgba(255,255,255,0.06)] border-l-[3px] border-l-[#10b981] hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200 cursor-pointer"
      >
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#475569]">Income</div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[28px] font-bold tracking-[-0.03em] text-[#10b981] flex items-baseline">
              <span className="mr-1">{symbol}</span>
              <NumberTicker value={income} decimalPlaces={0} />
            </span>
            <TrendingUp className="h-[14px] w-[14px] text-[#10b981] mb-1" />
          </div>
          <div className="text-[11px] text-[#475569]">This month</div>
        </div>
      </motion.div>

      {/* Card 3: Expenses */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="h-[96px] rounded-[14px] py-4 px-5 flex flex-col justify-between bg-[#111118] border border-[rgba(255,255,255,0.06)] border-l-[3px] border-l-[#f43f5e] hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200 cursor-pointer"
      >
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#475569]">Expenses</div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[28px] font-bold tracking-[-0.03em] text-[#f43f5e] flex items-baseline">
              <span className="mr-1">{symbol}</span>
              <NumberTicker value={expenses} decimalPlaces={0} />
            </span>
            <TrendingDown className="h-[14px] w-[14px] text-[#f43f5e] mb-1" />
          </div>
          <div className="text-[11px] text-[#475569]">This month</div>
        </div>
      </motion.div>

      {/* Card 4: Savings Rate */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="h-[96px] rounded-[14px] py-4 px-5 flex flex-col justify-between bg-[#111118] border border-[rgba(255,255,255,0.06)] border-l-[3px] border-l-[#3b82f6] hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200 cursor-pointer relative"
      >
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#475569]">Savings Rate</div>
        <div className="mb-[6px]">
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold tracking-[-0.03em] text-[#f8fafc]">
              <NumberTicker value={savingsRate} decimalPlaces={1} />
            </span>
            <span className="text-[20px] font-bold text-[#f8fafc]">%</span>
          </div>
          <div className="text-[11px] text-[#475569]">of income saved</div>
        </div>
        <div className="absolute bottom-[16px] left-[20px] right-[20px] h-[3px] bg-[#1e293b] rounded-[1px] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, savingsRate)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-[#3b82f6] rounded-[1px]"
          />
        </div>
      </motion.div>
    </div>
  );
}
