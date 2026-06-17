"use client";

import { useState } from "react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetBudgetModal({ isOpen, onClose }: SetBudgetModalProps) {
  const { addBudget } = useBudgetStore();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || isNaN(Number(limit))) {
      toast.error("Please enter a valid amount");
      return;
    }

    const now = new Date();
    addBudget({
      category,
      limit: Number(limit),
      period,
      month: now.getMonth(),
      year: now.getFullYear()
    });
    
    toast.success("Budget created successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-background-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/[0.05] p-4">
          <h2 className="text-lg font-semibold text-text-primary">Set Budget</h2>
          <button onClick={onClose} className="rounded-full p-2 text-text-muted hover:bg-white/[0.05] hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2.5 text-text-primary outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-background-card">{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Budget Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2.5 text-text-primary outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple tabular-nums"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Period</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${period === "monthly" ? "border-brand-purple bg-brand-purple/10 text-brand-purple-light" : "border-white/[0.1] bg-white/[0.02] text-text-muted hover:bg-white/[0.05]"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriod("weekly")}
                className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${period === "weekly" ? "border-brand-purple bg-brand-purple/10 text-brand-purple-light" : "border-white/[0.1] bg-white/[0.02] text-text-muted hover:bg-white/[0.05]"}`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="pt-4">
            <ShimmerButton type="submit" className="w-full font-semibold">Save Budget</ShimmerButton>
          </div>
        </form>
      </div>
    </div>
  );
}
