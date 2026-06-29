"use client";
import { TypographySpan } from "@/components/ui/typography";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex p-1 rounded-xl bg-card-elevated border border-border w-full",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex-1 relative rounded-lg py-2 text-xs font-medium transition-colors z-10 cursor-pointer select-none",
              isActive
                ? "text-white"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/10"
                transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
              />
            )}
            <TypographySpan className="relative z-20">{tab.label}</TypographySpan>
          </button>
        );
      })}
    </div>
  );
}
