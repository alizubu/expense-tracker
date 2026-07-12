"use client";
import { TypographySpan, TypographyH2 } from "@/components/ui/typography";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeftRight, CircleDashed, ArrowRight } from "lucide-react";
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
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <TypographyH2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Recent Activity
        </TypographyH2>
        <Link 
          href="/transactions"
          className="group flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <Card className="flex flex-col flex-1 p-2 sm:p-4 rounded-[24px] shadow-sm border-white/[0.03] bg-surface-1/40 backdrop-blur-2xl transition-all">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center py-6">
            <div className="w-14 h-14 rounded-full bg-surface-2/50 border border-white/[0.04] flex items-center justify-center mb-4 ring-1 ring-white/5">
              <CircleDashed className="h-6 w-6 text-muted-foreground/40 animate-[spin_4s_linear_infinite]" />
            </div>
            <TypographySpan className="text-sm font-semibold text-muted-foreground">No recent activity</TypographySpan>
            <TypographySpan className="text-xs text-muted-foreground/60 mt-1">Your transactions will appear here</TypographySpan>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns]) => (
            <div key={dateStr} className="mb-4 last:mb-0">
              <div className="flex items-center gap-4 mb-3 px-2">
                <TypographySpan className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em] flex-shrink-0">
                  {dateStr}
                </TypographySpan>
                <div className="h-px bg-gradient-to-r from-white/[0.05] to-transparent flex-1" />
              </div>

              <div className="space-y-1">
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
                    amountColor = "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";
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
                      onClick={() => openModal("addTransaction")}
                      className="flex items-center gap-4 py-3 px-3 sm:px-4 rounded-[16px] hover:bg-surface-2/60 cursor-pointer transition-all duration-300 group border border-transparent hover:border-white/[0.04] relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div 
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ring-1 ring-white/5 group-hover:ring-white/10 relative z-10"
                        style={{ backgroundColor: `${catColor}1a`, color: catColor }}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1 relative z-10">
                        <TypographySpan className="text-[14px] font-semibold text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
                          {t.title}
                        </TypographySpan>
                        <TypographySpan className="text-[11px] text-muted-foreground/80 truncate mt-0.5 font-medium">
                          {t.type === "TRANSFER" ? "Transfer" : categoryLabel} <TypographySpan className="opacity-40 mx-1">·</TypographySpan> {profileName}
                        </TypographySpan>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0 text-right relative z-10">
                        <TypographySpan className={`text-[15px] font-bold tabular-money tracking-tight ${amountColor}`}>
                          {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TypographySpan>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TypographySpan className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                            {format(new Date(t.date), "h:mm a")}
                          </TypographySpan>
                          <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-primary/70 transition-all -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
