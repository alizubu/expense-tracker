"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Utensils, ShoppingCart, Gamepad2, Cpu, Car, 
  AlertCircle, ArrowLeftRight, Shirt, Beef, Pill, Plane, Circle, ArrowRight
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getCategoryById } from "@/lib/categories";
import { Button } from "@heroui/react";

const CATEGORY_MAP: Record<string, { icon: any, color: string }> = {
  "Food / Restaurant": { icon: Utensils,       color: "var(--accent-brass)" },
  "Groceries":         { icon: ShoppingCart,   color: "var(--accent-teal)" },
  "Gaming":            { icon: Gamepad2,       color: "var(--accent-violet)" },
  "Electronics":       { icon: Cpu,            color: "var(--text-muted)" },
  "Ride Share":        { icon: Car,            color: "var(--accent-brass)" },
  "Tax / Fines":       { icon: AlertCircle,    color: "var(--accent-clay)" },
  "Transfer":          { icon: ArrowLeftRight, color: "var(--text-muted)" },
  "Clothing":          { icon: Shirt,          color: "var(--accent-violet)" },
  "Fastfood":          { icon: Beef,           color: "var(--accent-brass)" },
  "Medicine":          { icon: Pill,           color: "var(--accent-teal)" },
  "Travel":            { icon: Plane,          color: "var(--accent-violet)" },
};

function getCatStyle(label: string) {
  return CATEGORY_MAP[label] || { icon: Circle, color: "var(--text-muted)" };
}

interface TransactionFeedProps {
  transactions: any[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const { selectedCurrency, openModal } = useUIStore();
  const { profiles } = useProfileStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  
  const [displayCount, setDisplayCount] = useState(15);
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedTransactions = sortedTransactions.slice(0, displayCount);
  const hasMore = displayCount < sortedTransactions.length;

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 15);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-[var(--bg-surface)] p-[16px] rounded-[16px] border border-[var(--border-hair)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-4">
        <h2 className="text-[11px] font-ui text-[var(--text-muted)] uppercase tracking-[0.08em]">
          RECENT TRANSACTIONS
        </h2>
        <Link 
          href="/transactions"
          className="text-[12px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-brass)] transition-colors flex items-center gap-[4px]"
        >
          <span>View all</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="bg-[var(--bg-raised)] text-[var(--text-muted)] border-b border-[var(--border-hair)] text-[10px] uppercase font-ui tracking-wide px-2 h-8 font-normal">DETAILS</th>
              <th className="bg-[var(--bg-raised)] text-[var(--text-muted)] border-b border-[var(--border-hair)] text-[10px] uppercase font-ui tracking-wide px-2 h-8 font-normal hidden sm:table-cell">DATE</th>
              <th className="bg-[var(--bg-raised)] text-[var(--text-muted)] border-b border-[var(--border-hair)] text-[10px] uppercase font-ui tracking-wide px-2 h-8 font-normal text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-[var(--text-muted)] text-[12px]">No transactions yet</td>
              </tr>
            ) : (
              displayedTransactions.map((t) => {
                const categoryDef = getCategoryById(t.category);
                const categoryLabel = categoryDef?.label || t.category;
                const catStyle = getCatStyle(t.type === "TRANSFER" ? "Transfer" : categoryLabel);
                const Icon = catStyle.icon;
                const profileName = profiles.find(p => p.id === t.profileId)?.name || "Unknown";
                
                let amountColor = "text-[var(--text-primary)]";
                let prefix = "";
                if (t.type === "INCOME") {
                  amountColor = "text-[var(--accent-teal)]";
                  prefix = "+";
                } else if (t.type === "EXPENSE") {
                  amountColor = "text-[var(--accent-clay)]";
                  prefix = "−";
                } else if (t.type === "TRANSFER") {
                  amountColor = "text-[var(--text-muted)]";
                  prefix = "→";
                }

                return (
                  <tr 
                    key={t.id} 
                    className="hover:bg-[var(--bg-raised)] transition-colors cursor-pointer group"
                    onClick={() => openModal("addTransaction")}
                  >
                    <td className="px-2 py-3 border-b border-[var(--border-hair)]">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[6px] bg-[var(--bg-raised)] border border-[var(--border-hair)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--accent-dim)] transition-colors">
                          <Icon size={12} color={catStyle.color} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                            {t.title}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                            {t.type === "TRANSFER" ? "Transfer" : categoryLabel} · {profileName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 border-b border-[var(--border-hair)] hidden sm:table-cell">
                      <span className="text-[12px] font-mono text-[var(--text-muted)]">
                        {format(new Date(t.date), "MMM d")}
                      </span>
                    </td>
                    <td className="px-2 py-3 border-b border-[var(--border-hair)] text-right">
                      <span className={`text-[14px] font-medium font-mono ${amountColor}`}>
                        {prefix}{symbol}{Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {hasMore && (
          <div className="mt-4 flex justify-center pb-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onPress={loadMore}
              className="bg-[var(--bg-raised)] text-[var(--text-primary)] hover:bg-[var(--border-hair)] border-none"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
