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

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
    <div className="flex flex-col w-full h-auto lg:h-full premium-card p-[16px] pb-2 overflow-visible lg:overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.055)] bg-[linear-gradient(145deg,#0f0f1e_0%,#0c0c18_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.25)] transition-all duration-200 card-hover">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 h-[32px] mb-2">
        <h2 className="text-[10px] font-medium text-[#334155] uppercase tracking-[0.10em]">
          RECENT TRANSACTIONS
        </h2>
        <Link 
          href="/transactions"
          className="text-[12px] font-medium text-[#7c3aed] hover:underline transition-colors flex items-center gap-[4px]"
        >
          <span>View all</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar min-h-0 relative px-1 pb-2">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-2">
              <Circle className="h-[16px] w-[16px] text-[#1e293b]" />
            </div>
            <span className="text-[12px] text-[#1e293b]">No transactions yet</span>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, txns], groupIndex) => (
            <div key={dateStr}>
              {/* Date Group Header */}
              <div className="sticky top-0 z-10 h-[26px] bg-[rgba(14,14,28,0.97)] backdrop-blur-md flex items-center gap-[10px] px-[2px] mb-1 rounded-sm">
                <span className="text-[10px] font-medium text-[#334155] uppercase tracking-[0.07em] flex-shrink-0">
                  {dateStr}
                </span>
                <div className="h-[1px] bg-[rgba(255,255,255,0.04)] flex-1" />
              </div>

              {/* Transactions */}
              {txns.map((t, index) => {
                const categoryDef = getCategoryById(t.category);
                const categoryLabel = categoryDef?.label || t.category;
                const catStyle = getCatStyle(t.type === "TRANSFER" ? "Transfer" : categoryLabel);
                const Icon = catStyle.icon;
                const profileName = profiles.find(p => p.id === t.profileId)?.name || "Unknown";
                
                let amountColor = "text-[#f1f5f9]";
                let prefix = "";
                if (t.type === "INCOME") {
                  amountColor = "text-[#10b981]";
                  prefix = "+";
                } else if (t.type === "EXPENSE") {
                  amountColor = "text-[#f43f5e]";
                  prefix = "−";
                } else if (t.type === "TRANSFER") {
                  amountColor = "text-[#3b82f6]";
                  prefix = "→";
                }

                // Calculate global index for staggered animation delay
                let globalIndex = index;
                for (let i = 0; i < groupIndex; i++) {
                  globalIndex += Object.values(groupedByDate)[i].length;
                }

                return (
                  <motion.div 
                    key={t.id}
                    initial={{ x: -8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: globalIndex * 0.035, duration: 0.3 }}
                    whileHover={{ x: 2, backgroundColor: "rgba(255,255,255,0.018)", borderRadius: "8px" }}
                    onClick={() => openModal("addTransaction")}
                    className="grid grid-cols-[30px_1fr_auto] gap-[10px] items-center h-[42px] px-[2px] cursor-pointer transition-colors border-b border-[rgba(255,255,255,0.035)] last:border-b-0"
                  >
                    {/* Icon */}
                    <div 
                      className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: catStyle.bg }}
                    >
                      <Icon size={13} color={catStyle.color} />
                    </div>

                    {/* Title + Sub */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium text-[#f1f5f9] truncate">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-[#475569] truncate">
                        {t.type === "TRANSFER" ? "Transfer" : categoryLabel} · {profileName}
                      </span>
                    </div>

                    {/* Amount (right-aligned, no date) */}
                    <div className="flex flex-col items-end justify-center flex-shrink-0">
                      <span className={`text-[13px] font-semibold font-amount ${amountColor}`}>
                        {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </motion.div>
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
                  <div className="w-[4px] h-[4px] bg-[#334155] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-[4px] h-[4px] bg-[#334155] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-[4px] h-[4px] bg-[#334155] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>

            {/* Mobile Load More Button */}
            <button 
              onClick={loadMore}
              disabled={isLoadingMore}
              className="md:hidden w-full h-[40px] rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[12px] font-medium text-[#94a3b8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f1f5f9] transition-all"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
