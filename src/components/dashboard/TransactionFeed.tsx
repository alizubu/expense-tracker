"use client";

import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowLeftRight, CircleDashed, Circle
} from "lucide-react";
import * as Icons from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById, getCategoryColor, getCategoryIconName } from "@/lib/categories";
import { Card } from "@/components/ui/card";

interface TransactionFeedProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const { selectedCurrency, openModal } = useUIStore();
  const { profiles } = useProfileStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedTransactions = sortedTransactions.slice(0, 5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedByDate: Record<string, any[]> = {};
  displayedTransactions.forEach(t => {
    const d = new Date(t.date);
    const dateStr = format(d, "MMM d");
    if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
    groupedByDate[dateStr].push(t);
  });

  return (
    <Card className="flex flex-col w-full h-full p-4 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1 overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between flex-shrink-0 h-[32px] mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Recent Transactions
        </h2>
        <Link 
          href="/transactions"
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg"
        >
          View all →
        </Link>
      </div>

      <div className="flex flex-col flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 pb-2">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-white/[0.04] flex items-center justify-center mb-3">
              <Circle className="h-5 w-5 text-muted-foreground/50 animate-pulse" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">No transactions yet</span>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns]) => (
            <div key={dateStr}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex-shrink-0">
                  {dateStr}
                </span>
                <div className="h-px bg-white/[0.04] flex-1" />
              </div>

              <div className="space-y-0.5">
                {txns.map((t) => {
                  const categoryDef = getCategoryById(t.category);
                  const categoryLabel = categoryDef?.label || t.category;
                  
                  let catColor = getCategoryColor(t.category);
                  let iconName = getCategoryIconName(t.category);
                  
                  if (t.type === "TRANSFER") {
                    catColor = "hsl(var(--muted-foreground))";
                    iconName = "ArrowLeftRight";
                  }

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const Icon = (Icons as any)[iconName] || CircleDashed;
                  const profileName = profiles.find(p => p.id === t.profileId)?.name || "Unknown";
                  
                  let amountColor = "text-foreground";
                  let prefix = "";
                  if (t.type === "INCOME") {
                    amountColor = "text-emerald-500";
                    prefix = "+";
                  } else if (t.type === "EXPENSE") {
                    amountColor = "text-foreground";
                  } else if (t.type === "TRANSFER") {
                    amountColor = "text-muted-foreground";
                    prefix = "→";
                  }

                  return (
                    <div 
                      key={t.id}
                      onClick={() => openModal("addTransaction")} // Ideally open an edit modal
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-surface-2 cursor-pointer transition-colors group border border-transparent hover:border-white/[0.04]"
                    >
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${catColor}1a`, color: catColor }}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {t.type === "TRANSFER" ? "Transfer" : categoryLabel} <span className="opacity-50 mx-1">·</span> {profileName}
                        </span>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0 text-right">
                        <span className={`text-[13px] font-semibold tabular-money ${amountColor}`}>
                          {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">
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
