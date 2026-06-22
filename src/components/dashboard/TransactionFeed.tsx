"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  
  const [displayCount, setDisplayCount] = useState(30);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedTransactions = sortedTransactions.slice(0, displayCount);
  const hasMore = displayCount < sortedTransactions.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 30);
      setIsLoadingMore(false);
    }, 400);
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMore]);

  const groupedByDate: Record<string, any[]> = {};
  displayedTransactions.forEach(t => {
    const d = new Date(t.date);
    const dateStr = format(d, "MMM d");
    if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
    groupedByDate[dateStr].push(t);
  });

  return (
    <Card className="flex flex-col w-full h-auto md:h-full p-4 pb-2 border-border rounded-xl shadow-sm overflow-visible md:overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0 h-8 mb-2">
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

      <div className="flex flex-col md:flex-1 md:overflow-y-auto hide-scrollbar md:min-h-0 relative px-2 pb-2">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Circle className="h-5 w-5 text-muted-foreground/50 animate-pulse" />
            </div>
            <span className="text-sm text-muted-foreground">No transactions yet</span>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns]) => (
            <div key={dateStr} className="mb-4">
              <div className="sticky top-0 z-10 h-6 bg-card/95 backdrop-blur-sm flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex-shrink-0">
                  {dateStr}
                </span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="space-y-1">
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
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${catStyle.bg}`}>
                        <Icon size={18} className={catStyle.color} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {t.title}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {t.type === "TRANSFER" ? "Transfer" : categoryLabel} · {profileName}
                        </span>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className={`text-sm font-bold font-mono ${amountColor}`}>
                          {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
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
        
        {hasMore && (
          <div className="mt-2 pb-2">
            <div ref={observerTarget} className="hidden md:flex h-10 items-center justify-center">
              {isLoadingMore && (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>

            <button 
              onClick={loadMore}
              disabled={isLoadingMore}
              className="md:hidden w-full h-10 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
