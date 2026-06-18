"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

interface TransactionFeedProps {
  transactions: any[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const { selectedCurrency, openModal } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  return (
    <div className="flex flex-col w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-medium text-[var(--text-primary)]">
          Recent transactions
        </h2>
        <Link 
          href="/transactions"
          className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
            <LucideIcons.Receipt className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <p className="text-[13px] text-[var(--text-muted)] mb-4">No transactions yet</p>
          <button 
            onClick={() => openModal("addTransaction")}
            className="h-8 px-4 text-[12px] font-medium rounded-md bg-[var(--accent)] text-white hover:bg-[#6D28D9] transition-colors"
          >
            + Add your first
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {transactions.slice(0, 10).map((txn, index) => {
            const TxnIcon = getIcon(txn.profile?.icon);
            const isExpense = txn.type === "EXPENSE";
            const isIncome = txn.type === "INCOME";

            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                className="group flex h-[52px] items-center border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] hover:rounded-[var(--radius-sm)] transition-colors px-2 -mx-2 cursor-pointer"
              >
                {/* Left */}
                <div className="flex items-center gap-3 w-[60%]">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${txn.profile?.color}15` }}
                  >
                    <TxnIcon className="h-4 w-4" style={{ color: txn.profile?.color }} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                      {txn.title}
                    </span>
                    <span className="text-[12px] text-[var(--text-muted)] truncate">
                      {txn.category} · {txn.profile?.name}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex-1 flex justify-end">
                  <span
                    className={`font-mono text-[14px] font-medium ${
                      isIncome
                        ? "text-[var(--green)]"
                        : isExpense
                        ? "text-[var(--red)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {isIncome ? "+" : isExpense ? "-" : ""}
                    {symbol}{Math.abs(txn.amount).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
