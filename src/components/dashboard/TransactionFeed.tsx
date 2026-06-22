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

const CATEGORY_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  "Food / Restaurant": { icon: Utensils,       color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "Groceries":         { icon: ShoppingCart,   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  "Gaming":            { icon: Gamepad2,       color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
  "Electronics":       { icon: Cpu,            color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  "Ride Share":        { icon: Car,            color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  "Tax / Fines":       { icon: AlertCircle,    color: "#f43f5e", bg: "rgba(243,67,94,0.12)" },
  "Transfer":          { icon: ArrowLeftRight, color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  "Clothing":          { icon: Shirt,          color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  "Fastfood":          { icon: Beef,           color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  "Medicine":          { icon: Pill,           color: "#14b8a6", bg: "rgba(20,184,166,0.12)" },
  "Travel":            { icon: Plane,          color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

function getCatStyle(label: string) {
  return CATEGORY_MAP[label] || { icon: Circle, color: "#64748b", bg: "rgba(100,116,139,0.12)" };
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
    }, 400); // Simulate network delay
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
    <div className="flex flex-col w-full h-auto md:h-full border border-border bg-card shadow-sm p-4 pb-2 overflow-visible md:overflow-hidden hover:border-accent/10 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 h-[32px] mb-2">
        <h2 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.08em]">
          Recent Transactions
        </h2>
        <Link 
          href="/transactions"
          className="text-xs font-semibold text-accent hover:text-brand-purple-light transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex flex-col md:flex-1 md:overflow-y-auto hide-scrollbar md:min-h-0 relative -mx-2 px-2 pb-2">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-[32px] h-[32px] rounded-xl bg-card-elevated flex items-center justify-center mb-2">
              <Circle className="h-[16px] w-[16px] text-text-muted/40 animate-pulse" />
            </div>
            <span className="text-xs text-text-muted">No transactions yet</span>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns]) => (
            <div key={dateStr}>
              {/* Date Group Header */}
              <div className="sticky top-0 z-10 h-[24px] bg-card flex items-center gap-2 pt-1 mb-1">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.06em] flex-shrink-0">
                  {dateStr}
                </span>
                <div className="h-[1px] bg-border/40 flex-1" />
              </div>

              {/* Transactions */}
              {txns.map((t) => {
                const categoryDef = getCategoryById(t.category);
                const categoryLabel = categoryDef?.label || t.category;
                const catStyle = getCatStyle(t.type === "TRANSFER" ? "Transfer" : categoryLabel);
                const Icon = catStyle.icon;
                const profileName = profiles.find(p => p.id === t.profileId)?.name || "Unknown";
                
                let amountColor = "text-text-primary";
                let prefix = "";
                if (t.type === "INCOME") {
                  amountColor = "text-income";
                  prefix = "+";
                } else if (t.type === "EXPENSE") {
                  amountColor = "text-expense";
                  prefix = "−";
                } else if (t.type === "TRANSFER") {
                  amountColor = "text-transfer";
                  prefix = "→";
                }

                return (
                  <div 
                    key={t.id}
                    onClick={() => openModal("addTransaction")}
                    className="grid grid-cols-[32px_1fr_auto] gap-[12px] items-center py-[10px] px-2 rounded-xl hover:bg-card-hover cursor-pointer transition-colors group border-b border-border/40 last:border-b-0"
                  >
                    {/* Icon */}
                    <div 
                      className="w-[32px] h-[32px] rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: catStyle.bg }}
                    >
                      <Icon size={14} color={catStyle.color} />
                    </div>

                    {/* Title + Sub */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-text-primary truncate">
                        {t.title}
                      </span>
                      <span className="text-[11px] text-text-secondary truncate mt-[1px]">
                        {t.type === "TRANSFER" ? "Transfer" : categoryLabel} · {profileName}
                      </span>
                    </div>

                    {/* Amount + Date */}
                    <div className="flex flex-col items-end justify-center flex-shrink-0">
                      <span className={`text-[13px] font-bold font-mono-amount ${amountColor}`}>
                        {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-text-muted mt-[2px]">
                        {format(new Date(t.date), "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {/* Infinite Scroll Target & Load More Button */}
        {hasMore && (
          <div className="mt-2 pb-2">
            {/* Desktop Auto-load Target */}
            <div ref={observerTarget} className="hidden md:flex h-[40px] items-center justify-center">
              {isLoadingMore && (
                <div className="flex gap-1">
                  <div className="w-[4px] h-[4px] bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-[4px] h-[4px] bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-[4px] h-[4px] bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>

            {/* Mobile Load More Button */}
            <button 
              onClick={loadMore}
              disabled={isLoadingMore}
              className="md:hidden w-full h-[40px] rounded-xl bg-card-elevated border border-border/80 text-[12px] font-medium text-text-secondary hover:bg-card-hover hover:text-text-primary transition-all cursor-pointer"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
