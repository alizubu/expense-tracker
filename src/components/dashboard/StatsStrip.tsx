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
        className="col-span-2 xl:col-span-1 min-h-[76px] xl:h-[88px] rounded-2xl px-4 py-3 xl:px-5 xl:py-3.5 flex items-center justify-between border border-border bg-card shadow-sm hover:border-accent/20 hover:shadow-md transition-all duration-200 border-l-[3.5px] border-l-accent group"
      >
        <div className="flex flex-col h-full justify-between gap-[4px] xl:gap-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">Net Balance</span>
            <div className="flex items-center gap-[4px]">
              <div className="h-[6px] w-[6px] rounded-full bg-income animate-pulse" />
              <span className="hidden sm:inline text-[9px] font-semibold text-income uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] text-text-primary mr-[2px]">{symbol}</span>
            <NumberTicker value={netBalance} decimalPlaces={0} className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] text-text-primary font-mono" />
          </div>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="hidden md:block h-[36px] w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="value" stroke="var(--accent-color)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
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
        className="col-span-1 min-h-[76px] xl:h-[88px] rounded-2xl px-4 py-3 xl:px-5 xl:py-3.5 flex items-center justify-between border border-border bg-card shadow-sm hover:border-income/20 hover:shadow-md transition-all duration-200 border-l-[3.5px] border-l-income"
      >
        <div className="flex flex-col h-full justify-between gap-[4px] xl:gap-0">
          <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">Income</div>
          <div>
            <div className="flex items-baseline text-income">
              <span className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] mr-[2px]">{symbol}</span>
              <NumberTicker value={income} decimalPlaces={0} className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] text-income font-mono" />
            </div>
            <div className="hidden sm:block text-[9px] font-semibold uppercase text-text-muted mt-0.5">This month</div>
          </div>
        </div>
        <TrendingUp className="hidden sm:block h-[15px] w-[15px] text-income" />
      </motion.div>

      {/* Card 3: Expenses */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="col-span-1 min-h-[76px] xl:h-[88px] rounded-2xl px-4 py-3 xl:px-5 xl:py-3.5 flex items-center justify-between border border-border bg-card shadow-sm hover:border-expense/20 hover:shadow-md transition-all duration-200 border-l-[3.5px] border-l-expense"
      >
        <div className="flex flex-col h-full justify-between gap-[4px] xl:gap-0">
          <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">Expenses</div>
          <div>
            <div className="flex items-baseline text-expense">
              <span className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] mr-[2px]">{symbol}</span>
              <NumberTicker value={expenses} decimalPlaces={0} className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] text-expense font-mono" />
            </div>
            <div className="hidden sm:block text-[9px] font-semibold uppercase text-text-muted mt-0.5">This month</div>
          </div>
        </div>
        <TrendingDown className="hidden sm:block h-[15px] w-[15px] text-expense" />
      </motion.div>

      {/* Card 4: Savings Rate */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="col-span-2 xl:col-span-1 min-h-[76px] xl:h-[88px] rounded-2xl px-4 py-3 xl:px-5 xl:py-3.5 flex flex-col justify-between border border-border bg-card shadow-sm hover:border-transfer/20 hover:shadow-md transition-all duration-200 border-l-[3.5px] border-l-transfer relative pb-5"
      >
        <div className="flex justify-between w-full">
          <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">Savings Rate</div>
        </div>
        <div className="flex flex-col gap-[2px] xl:gap-0">
          <div className="flex items-baseline text-text-primary">
            <NumberTicker value={savingsRate} decimalPlaces={1} className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em] text-text-primary font-mono" />
            <span className="text-[20px] sm:text-[22px] xl:text-[24px] font-bold tracking-[-0.04em]">%</span>
          </div>
          <div className="hidden sm:block text-[9px] font-semibold uppercase text-text-muted mt-0.5">of income saved</div>
        </div>
        <div className="absolute bottom-[8px] xl:bottom-[10px] left-4 right-4 xl:left-5 xl:right-5 h-[3px] bg-card-elevated rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, savingsRate)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-transfer rounded-full"
          />
        </div>
      </motion.div>
    </>
  );
}
