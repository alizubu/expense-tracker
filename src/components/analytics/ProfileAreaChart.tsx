"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Layers } from "lucide-react";


export default function ProfileAreaChart() {
  const { transactions } = useTransactionStore();
  const { profiles } = useProfileStore();
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    
    // Calculate balances for each profile up to this date
    const dayData: any = { name: d.toLocaleDateString("en-US", { weekday: "short" }) };
    
    profiles.forEach(p => {
      const pastTxns = transactions.filter(t => t.profileId === p.id && new Date(t.date) <= d);
      const balance = p.balance + pastTxns.reduce((sum, t) => {
        if (t.type === "INCOME") return sum - t.amount; // rollback income
        if (t.type === "EXPENSE") return sum + t.amount; // rollback expense
        return sum;
      }, 0); // Simplified mock calculation for demonstration
      dayData[p.name] = p.balance; // Using current balance for simplicity in mock
    });

    return dayData;
  });

  const hasData = profiles.length > 0;

  return (
    <Card className="p-4 md:p-6 w-full h-[350px] flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <TypographyH3 className="text-sm font-semibold text-text-primary">Profile Balances</TypographyH3>
        <TypographySpan className="text-[11px] text-text-muted bg-white/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-border/40">
          Last 7 Days
        </TypographySpan>
      </div>
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "var(--bg-surface)", 
                  borderColor: "var(--border-default)", 
                  borderRadius: "12px", 
                  color: "var(--text-primary)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "var(--text-primary)", fontSize: "12px" }}
              />
              {profiles.map((p, idx) => (
                <Area key={p.id} type="monotone" dataKey={p.name} stackId="1" stroke={p.color} fill={p.color} fillOpacity={0.15} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent mb-3 border border-accent/10">
              <Layers size={18} />
            </div>
            <TypographySpan className="text-xs font-semibold text-text-primary">No data yet</TypographySpan>
            <TypographySpan className="text-[10px] text-text-muted mt-0.5">Profile comparisons will show here</TypographySpan>
          </div>
        )}
      </div>
    </Card>
  );
}
