"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";

function getCategoryStyle(category: string) {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("tax")) return { bg: "#FEF3C7", color: "#D97706", icon: LucideIcons.Receipt };
  if (cat.includes("gam")) return { bg: "#EDE9FE", color: "#7C3AED", icon: LucideIcons.Gamepad2 };
  if (cat.includes("transfer")) return { bg: "#ECFDF5", color: "#059669", icon: LucideIcons.ArrowLeftRight };
  if (cat.includes("food") || cat.includes("dining") || cat.includes("restaurant")) return { bg: "#FEF2F2", color: "#DC2626", icon: LucideIcons.Utensils };
  return { bg: "#F3F4F6", color: "#6B7280", icon: LucideIcons.CreditCard };
}

interface TransactionFeedProps {
  transactions: any[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const { selectedCurrency, openModal } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  return (
    <div 
      className="flex flex-col w-full bg-[#FFFFFF] rounded-[14px] overflow-hidden"
      style={{
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)"
      }}
    >
      <div className="flex items-center justify-between" style={{ padding: "18px 20px 0" }}>
        <h2 className="text-[14px] font-semibold text-[#111111]">
          Recent transactions
        </h2>
        <Link 
          href="/transactions"
          className="text-[13px] font-medium text-[#7C3AED] hover:underline"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="mt-[18px]">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 0" }}>
            <LucideIcons.Inbox className="w-[32px] h-[32px] text-[#D1D5DB] mb-3" />
            <p className="text-[14px] text-[#6B7280] mb-4">No transactions yet</p>
            <button 
              onClick={() => openModal("addTransaction")}
              className="h-[32px] px-[16px] text-[13px] font-medium rounded-[8px] bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors"
            >
              + Add your first
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {transactions.slice(0, 10).map((txn, index) => {
              const catStyle = getCategoryStyle(txn.category);
              const TxnIcon = catStyle.icon;
              const isExpense = txn.type === "EXPENSE";
              const isIncome = txn.type === "INCOME";

              // Truncate title
              const displayTitle = txn.title?.length > 20 ? txn.title.substring(0, 20) + "..." : txn.title;
              // Format Date
              const dateStr = new Date(txn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className="group flex items-center border-b border-[rgba(0,0,0,0.05)] last:border-0 hover:bg-[#FAFAF8] transition-colors duration-100"
                  style={{ height: "56px", padding: "12px 20px" }}
                >
                  {/* Left */}
                  <div className="flex items-center gap-[12px] flex-1 min-w-0">
                    <div
                      className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: catStyle.bg, color: catStyle.color }}
                    >
                      <TxnIcon className="h-[16px] w-[16px]" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-medium text-[#111111] truncate">
                        {displayTitle}
                      </span>
                      <span className="text-[12px] text-[#9CA3AF] truncate mt-[2px]">
                        {txn.category} &middot; {txn.profile?.name}
                      </span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-end flex-shrink-0 ml-[12px]">
                    <span
                      className={`font-mono text-[14px] font-semibold ${
                        isIncome ? "text-[#059669]" : isExpense ? "text-[#DC2626]" : "text-[#6B7280]"
                      }`}
                    >
                      {isIncome ? "↑ " : isExpense ? "↓ " : ""}
                      {symbol}{Math.abs(txn.amount).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] mt-[2px]">
                      {dateStr}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
