"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { getCategoryById } from "@/lib/categories";
import { cn } from "@/lib/utils";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

interface TransactionFeedProps {
  transactions: any[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const { selectedCurrency, openModal } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  const visibleTransactions = transactions.slice(0, 8);

  return (
    <div className="flex flex-col w-full bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-[16px] py-5 px-6 hover:border-[rgba(139,92,246,0.25)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium text-[#475569] uppercase tracking-[0.08em]">
          Recent Transactions
        </h2>
        <Link 
          href="/transactions"
          className="text-[12px] font-medium text-[#7c3aed] hover:text-[#a78bfa] transition-colors p-1 active:scale-[0.97]"
        >
          <span className="hidden sm:inline">View all &rarr;</span>
          <span className="sm:hidden">&rarr;</span>
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-[40px] w-[40px] flex items-center justify-center text-[#1e293b] mb-2">
            <LucideIcons.Receipt className="w-6 h-6" />
          </div>
          <p className="text-[13px] text-[#334155] mb-4">No data yet</p>
          <button 
            onClick={() => openModal("addTransaction")}
            className="h-8 px-4 text-[12px] font-medium rounded-[8px] bg-[rgba(124,58,237,0.1)] text-[#a78bfa] hover:bg-[rgba(124,58,237,0.2)] transition-colors"
          >
            + Add Transaction
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          <AnimatePresence>
            {visibleTransactions.map((txn, index) => {
              const category = getCategoryById(txn.category);
              const TxnIcon = category ? getIcon(category.icon) : LucideIcons.CircleDot;
              const isExpense = txn.type === "EXPENSE";
              const isIncome = txn.type === "INCOME";

              return (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className={cn(
                    "group grid grid-cols-[auto_1fr_auto] gap-3 items-center h-[48px] md:h-[44px] border-b border-[rgba(255,255,255,0.03)] last:border-b-0 hover:bg-[rgba(255,255,255,0.015)] hover:rounded-[8px] px-2 -mx-2 transition-all cursor-pointer active:scale-[0.98]",
                    index >= 5 && "hidden sm:grid"
                  )}
                >
                  {/* Column 1: Icon */}
                  <div className="flex h-[28px] w-[28px] md:h-[32px] md:w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                    <TxnIcon className="h-[12px] w-[12px] md:h-[14px] md:w-[14px] text-[#94a3b8]" />
                  </div>

                  {/* Column 2: Details */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] md:text-[13px] font-medium text-[#f8fafc] truncate">
                      {txn.title}
                    </span>
                    <span className="text-[10px] md:text-[11px] text-[#475569] truncate">
                      {category?.label || txn.category} · {txn.profile?.name || "Unknown"}
                    </span>
                  </div>

                  {/* Column 3: Amount + Date */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={`text-[12px] md:text-[13px] font-semibold tracking-tight ${
                        isIncome
                          ? "text-[#10b981]"
                          : isExpense
                          ? "text-[#f43f5e]"
                          : "text-[#3b82f6]"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "−" : "→"}
                      {symbol}{Math.abs(txn.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="hidden sm:block text-[10px] md:text-[11px] text-[#475569]">
                      {new Date(txn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {transactions.length > 8 && (
            <Link href="/transactions" className="mt-4">
              <button className="w-full h-[44px] md:h-[36px] bg-transparent border border-[rgba(255,255,255,0.06)] rounded-[10px] text-[12px] text-[#94a3b8] hover:border-[rgba(139,92,246,0.3)] hover:text-[#a78bfa] transition-colors active:scale-[0.98]">
                Show more
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
