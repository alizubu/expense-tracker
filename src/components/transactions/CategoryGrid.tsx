"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/categories";

const iconMap: Record<string, string> = {
  "Groceries": "ShoppingCart",
  "Restaurant": "Utensils",
  "Drinks": "Coffee",
  "Food": "Pizza",
  "Ride Share": "Car",
  "Public Transit": "Bus",
  "Taxi": "CarTaxiFront",
  "Laundry": "WashingMachine",
  "Maintenance": "Wrench",
  "Medicine": "Pill",
  "Doctor / Hospital": "Stethoscope",
  "Clothing": "Shirt",
  "Electronics": "Cpu",
  "Home & Decor": "Home",
  "Gifts": "Gift",
  "Beauty & Care": "Sparkles",
  "Gaming": "Gamepad2",
  "Sports & Events": "Trophy",
  "Travel": "Plane",
  "Books": "BookOpen",
  "Online Courses": "Monitor",
  "Stationery": "PenLine"
};

function getIcon(categoryLabel: string, defaultIconName: string) {
  const iconName = iconMap[categoryLabel] || defaultIconName;
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.CircleDot;
}

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (cat: Category) => void;
}

export function CategoryGrid({ categories, selectedCategory, onSelect }: CategoryGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCategories = isExpanded ? categories : categories.slice(0, 9);
  const hasMore = categories.length > 9;

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence initial={false}>
          {visibleCategories.map((cat) => {
            const Icon = getIcon(cat.label, cat.icon);
            const isSelected = selectedCategory === cat.id;

            return (
              <motion.button
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(cat)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-[10px_8px] rounded-2xl transition-all duration-150 ease-in-out group border cursor-pointer",
                  isSelected
                    ? "bg-accent-dim border-[1.5px] border-accent/80 shadow-[inset_0_0_12px_var(--accent-glow)]"
                    : "bg-card-elevated border-border hover:bg-accent-dim hover:border-accent/30"
                )}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center shadow-sm"
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}

                <Icon
                  className={cn(
                    "w-[22px] h-[22px] mb-1.5 transition-colors duration-150",
                    isSelected ? "text-accent" : "group-hover:text-accent"
                  )}
                  style={!isSelected ? { color: cat.color } : undefined}
                  strokeWidth={2}
                />

                <span
                  className={cn(
                    "text-[11px] font-semibold text-center leading-tight",
                    isSelected ? "text-accent" : "text-text-secondary group-hover:text-accent"
                  )}
                >
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold text-text-muted hover:text-accent hover:bg-accent-dim transition-all cursor-pointer"
          >
            {isExpanded ? "Less" : "More"}
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </button>
        </div>
      )}
    </div>
  );
}