"use client";

import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function AnalyticsStatsRow() {
  const { transactions } = useTransactionStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const now = new Date();
  const currentMonthTxns = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthTxns.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const totalIncome = currentMonthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  
  const daysPassed = now.getDate();
  const avgDaily = daysPassed > 0 ? totalSpent / daysPassed : 0;
  
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <BlurFade delay={0.05}>
        <MagicCard className="p-4" gradientColor="rgba(239, 68, 68, 0.1)">
          <p className="text-xs text-text-muted mb-1">Spent This Month</p>
          <div className="text-2xl font-bold text-expense flex items-center tabular-nums">
            {symbol} <NumberTicker value={totalSpent} decimalPlaces={2} />
          </div>
        </MagicCard>
      </BlurFade>
      <BlurFade delay={0.1}>
        <MagicCard className="p-4" gradientColor="rgba(16, 185, 129, 0.1)">
          <p className="text-xs text-text-muted mb-1">Income This Month</p>
          <div className="text-2xl font-bold text-income flex items-center tabular-nums">
            {symbol} <NumberTicker value={totalIncome} decimalPlaces={2} />
          </div>
        </MagicCard>
      </BlurFade>
      <BlurFade delay={0.15}>
        <MagicCard className="p-4" gradientColor="rgba(124, 58, 237, 0.1)">
          <p className="text-xs text-text-muted mb-1">Avg Daily Spend</p>
          <div className="text-2xl font-bold text-text-primary flex items-center tabular-nums">
            {symbol} <NumberTicker value={avgDaily} decimalPlaces={2} />
          </div>
        </MagicCard>
      </BlurFade>
      <BlurFade delay={0.2}>
        <MagicCard className="p-4" gradientColor="rgba(167, 139, 250, 0.1)">
          <p className="text-xs text-text-muted mb-1">Savings Rate</p>
          <div className="text-2xl font-bold text-brand-purple-light flex items-center tabular-nums">
            <NumberTicker value={Math.max(0, savingsRate)} decimalPlaces={1} /> %
          </div>
        </MagicCard>
      </BlurFade>
    </div>
  );
}
