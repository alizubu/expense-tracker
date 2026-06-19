"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
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
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(cat)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-[10px_8px] rounded-[12px] transition-all duration-150 ease-in-out group",
                  isSelected
                    ? "bg-[rgba(109,40,217,0.2)] border-[1.5px] border-[rgba(139,92,246,0.7)] shadow-[inset_0_0_12px_rgba(139,92,246,0.15)]"
                    : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(139,92,246,0.1)] hover:border-[rgba(139,92,246,0.3)]"
                )}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}

                <Icon 
                  className={cn(
                    "w-[22px] h-[22px] mb-1.5 transition-colors duration-150",
                    isSelected ? "text-[#c4b5fd]" : "group-hover:text-[#a78bfa]"
                  )} 
                  style={!isSelected ? { color: cat.color } : undefined}
                  strokeWidth={2}
                />
                
                <span 
                  className={cn(
                    "text-[11px] font-medium text-center leading-tight",
                    isSelected ? "text-[#c4b5fd]" : "text-[var(--text-secondary)] group-hover:text-[#a78bfa]"
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium text-[var(--text-muted)] hover:text-[#a78bfa] hover:bg-[rgba(139,92,246,0.08)] transition-all"
          >
            {isExpanded ? (
              <>Less <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>More <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
