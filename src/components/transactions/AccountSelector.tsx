"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile } from "@/lib/types";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

interface AccountSelectorProps {
  profiles: Profile[];
  selectedId: string;
  onChange: (id: string) => void;
  label: string;
  onAddNew?: () => void;
}

export function AccountSelector({ profiles, selectedId, onChange, label, onAddNew }: AccountSelectorProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">
        {label}
      </label>

      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
        {profiles.map((p) => {
          const Icon = getIcon(p.icon);
          const isSelected = p.id === selectedId;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  : "bg-surface-1 border-white/[0.04] text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isSelected ? "inherit" : p.color }}
              />
              <span>{p.name}</span>
            </button>
          );
        })}

        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-dashed border-white/[0.2] text-text-muted hover:text-text-primary hover:bg-surface-2 hover:border-white/[0.4] transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}