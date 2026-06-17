"use client";

import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Camera } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useUIStore } from "@/store/useUIStore";

const actions = [
  {
    id: "income",
    label: "Add Income",
    icon: ArrowDownLeft,
    color: "#10B981",
    bgColor: "bg-income/10",
    textColor: "text-income",
    type: "INCOME" as const,
  },
  {
    id: "expense",
    label: "Add Expense",
    icon: ArrowUpRight,
    color: "#EF4444",
    bgColor: "bg-expense/10",
    textColor: "text-expense",
    type: "EXPENSE" as const,
    shimmer: true,
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: ArrowLeftRight,
    color: "#3B82F6",
    bgColor: "bg-transfer/10",
    textColor: "text-transfer",
    type: "TRANSFER" as const,
  },
  {
    id: "scan",
    label: "Scan Receipt",
    icon: Camera,
    color: "#A78BFA",
    bgColor: "bg-brand-purple/10",
    textColor: "text-brand-purple-light",
    type: null,
  },
];

export function QuickActions() {
  const { openModal } = useUIStore();

  const handleAction = (action: typeof actions[0]) => {
    if (action.type) {
      // Open modal with pre-filled type
      openModal("addTransaction");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;

        if (action.shimmer) {
          return (
            <ShimmerButton
              key={action.id}
              onClick={() => handleAction(action)}
              shimmerColor="#EF4444"
              background="rgba(239, 68, 68, 0.1)"
              className="w-full"
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{action.label}</span>
            </ShimmerButton>
          );
        }

        return (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className={`flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] ${action.bgColor} px-4 py-3 text-sm font-medium ${action.textColor} transition-all hover:border-white/[0.12] hover:scale-[1.02] active:scale-[0.98]`}
          >
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
