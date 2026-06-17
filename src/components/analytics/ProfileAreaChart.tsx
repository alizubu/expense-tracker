"use client";

import { useTransactionStore } from "@/store/useTransactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { MagicCard } from "@/components/magicui/magic-card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

  return (
    <MagicCard className="p-4 md:p-6 w-full h-[350px]">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Profile Balances</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${symbol}${val}`} />
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(22, 22, 30, 0.8)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }}
          />
          {profiles.map((p, idx) => (
            <Area key={p.id} type="monotone" dataKey={p.name} stackId="1" stroke={p.color} fill={p.color} fillOpacity={0.3} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </MagicCard>
  );
}
