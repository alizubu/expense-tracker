"use client";
import { TypographySpan, TypographyH2 } from "@/components/ui/typography";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeftRight, CircleDashed, ArrowRight } from "lucide-react";
import { icons } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById, getCategoryColor, getCategoryIconName } from "@/lib/categories";
import { Card } from "@/components/ui/card";

interface TransactionFeedProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
}

function getIconComponent(iconName: string) {
  const Icon = icons[iconName as keyof typeof icons];
  return Icon || CircleDashed;
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
      <div className="flex items-center justify-between mb-4">
        <TypographyH2 className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
          Recent Activity
        </TypographyH2>
        <Link 
          href="/transactions"
          className="group flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <Card className="flex flex-col flex-1 p-2 sm:p-3 rounded-xl shadow-sm border-white/[0.04] bg-surface-1/40 backdrop-blur-2xl transition-all">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-surface-2/50 border border-white/[0.04] flex items-center justify-center mb-3 ring-1 ring-white/5">
              <CircleDashed className="h-5 w-5 text-muted-foreground/40 animate-[spin_4s_linear_infinite]" />
            </div>
            <TypographySpan className="text-sm font-semibold text-muted-foreground">No recent activity</TypographySpan>
            <TypographySpan className="text-xs text-muted-foreground/40 mt-1">Your transactions will appear here</TypographySpan>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns]) => (
            <div key={dateStr} className="mb-3 last:mb-0">
              <div className="flex items-center gap-3 mb-2 px-2">
                <TypographySpan className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] flex-shrink-0">
                  {dateStr}
                </TypographySpan>
                <div className="h-px bg-gradient-to-r from-white/[0.04] to-transparent flex-1" />
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

                  const Icon = getIconComponent(iconName);
                  const profileName = profiles.find(p => p.id === t.profileId)?.name || "Unknown";
                  
                  // Type accent border color
                  let borderAccent = "border-l-rose-500/60";
                  let amountColor = "text-foreground";
                  let prefix = "";
                  if (t.type === "INCOME") {
                    borderAccent = "border-l-emerald-500/60";
                    amountColor = "text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.2)]";
                    prefix = "+";
                  } else if (t.type === "TRANSFER") {
                    borderAccent = "border-l-blue-500/60";
                    amountColor = "text-muted-foreground";
                    prefix = "→";
                  }

                  return (
                    <div 
                      key={t.id}
                      onClick={() => openModal("addTransaction")}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-all duration-200 group border-l-2 ${borderAccent} relative overflow-hidden`}
                    >
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ring-1 ring-white/5 relative z-10"
                        style={{ backgroundColor: `${catColor}15`, color: catColor }}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1 relative z-10">
                        <TypographySpan className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
                          {t.title}
                        </TypographySpan>
                        <TypographySpan className="text-[10px] text-muted-foreground/50 truncate mt-0.5 font-medium">
                          {t.type === "TRANSFER" ? "Transfer" : categoryLabel} <TypographySpan className="opacity-40 mx-0.5">·</TypographySpan> {profileName}
                        </TypographySpan>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0 text-right relative z-10">
                        <TypographySpan className={`text-[13px] font-bold tabular-money tracking-tight ${amountColor}`}>
                          {prefix}<span className="currency-symbol">{symbol}</span>{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TypographySpan>
                        <div className="flex items-center gap-1 mt-0.5">
                          <TypographySpan className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-wider">
                            {format(new Date(t.date), "h:mm a")}
                          </TypographySpan>
                          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/0 group-hover:text-primary/60 transition-all -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
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
