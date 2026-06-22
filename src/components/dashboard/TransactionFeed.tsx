"use client";

import Link from "next/link";
import { format } from "date-fns";
import { 
  Utensils, ShoppingCart, Gamepad2, Cpu, Car, 
  AlertCircle, ArrowLeftRight, Shirt, Beef, Pill, Plane, Circle 
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById } from "@/lib/categories";
import { Card } from "@/components/ui/card";

const CATEGORY_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  "Food / Restaurant": { icon: Utensils,       color: "text-amber-500", bg: "bg-amber-500/10" },
  "Groceries":         { icon: ShoppingCart,   color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "Gaming":            { icon: Gamepad2,       color: "text-violet-500", bg: "bg-violet-500/10" },
  "Electronics":       { icon: Cpu,            color: "text-blue-500", bg: "bg-blue-500/10" },
  "Ride Share":        { icon: Car,            color: "text-cyan-500", bg: "bg-cyan-500/10" },
  "Tax / Fines":       { icon: AlertCircle,    color: "text-rose-500", bg: "bg-rose-500/10" },
  "Transfer":          { icon: ArrowLeftRight, color: "text-slate-500", bg: "bg-slate-500/10" },
  "Clothing":          { icon: Shirt,          color: "text-pink-500", bg: "bg-pink-500/10" },
  "Fastfood":          { icon: Beef,           color: "text-orange-500", bg: "bg-orange-500/10" },
  "Medicine":          { icon: Pill,           color: "text-teal-500", bg: "bg-teal-500/10" },
  "Travel":            { icon: Plane,          color: "text-purple-500", bg: "bg-purple-500/10" },
};

function getCatStyle(label: string) {
  return CATEGORY_MAP[label] || { icon: Circle, color: "text-slate-500", bg: "bg-slate-500/10" };
}

interface TransactionFeedProps {
  transactions: any[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const { selectedCurrency, openModal } = useUIStore();
  const { profiles } = useProfileStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedTransactions = sortedTransactions.slice(0, 5);

  const groupedByDate: Record<string, any[]> = {};
  displayedTransactions.forEach(t => {
    const d = new Date(t.date);
    const dateStr = format(d, "MMM d");
    if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
    groupedByDate[dateStr].push(t);
  });

  return (
    <Card className="flex flex-col w-full h-auto md:h-full p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0 h-[32px] mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Transactions
        </h2>
        <Link 
          href="/transactions"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="flex flex-col flex-1 space-y-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Circle className="h-5 w-5 text-muted-foreground/50 animate-pulse" />
            </div>
            <span className="text-sm text-muted-foreground">No transactions yet</span>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns]) => (
            <div key={dateStr}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex-shrink-0">
                  {dateStr}
                </span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="space-y-2">
                {txns.map((t) => {
                  const categoryDef = getCategoryById(t.category);
                  const categoryLabel = categoryDef?.label || t.category;
                  const catStyle = getCatStyle(t.type === "TRANSFER" ? "Transfer" : categoryLabel);
                  const Icon = catStyle.icon;
                  const profileName = profiles.find(p => p.id === t.profileId)?.name || "Unknown";
                  
                  let amountColor = "text-foreground";
                  let prefix = "";
                  if (t.type === "INCOME") {
                    amountColor = "text-emerald-500";
                    prefix = "+";
                  } else if (t.type === "EXPENSE") {
                    amountColor = "text-destructive";
                    prefix = "−";
                  } else if (t.type === "TRANSFER") {
                    amountColor = "text-slate-500";
                    prefix = "→";
                  }

                  return (
                    <div 
                      key={t.id}
                      onClick={() => openModal("addTransaction")}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group border border-transparent hover:border-white/[0.04]"
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${catStyle.bg}`}>
                        <Icon size={20} className={catStyle.color} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {t.title}
                        </span>
                        <span className="text-xs text-muted-foreground truncate mt-0.5">
                          {t.type === "TRANSFER" ? "Transfer" : categoryLabel} · {profileName}
                        </span>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0 text-right">
                        <span className={`text-sm font-bold font-mono ${amountColor}`}>
                          {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                          {format(new Date(t.date), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
