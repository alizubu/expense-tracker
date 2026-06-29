"use client";
import { TypographySpan } from "@/components/ui/typography";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  error?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Select option...",
  className,
  containerClassName,
  error,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full relative", containerClassName)} ref={containerRef}>
      {label && (
        <TypographySpan className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">
          {label}
        </TypographySpan>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full h-10 rounded-xl border bg-white/[0.02] dark:bg-white/[0.02] px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 flex items-center justify-between cursor-pointer",
            "border-border select-none",
            "focus:border-brand-purple focus:bg-brand-purple/[0.02] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-red-500/50",
            className
          )}
        >
          <TypographySpan className={cn(!selectedOption && "text-text-muted/60")}>
            {selectedOption ? selectedOption.label : placeholder}
          </TypographySpan>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-muted transition-transform duration-200",
              isOpen && "transform rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 w-full mt-1.5 rounded-xl border border-border bg-[#0f0f1a] dark:bg-[#0f0f1a] p-1.5 shadow-[0_10px_32px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto no-scrollbar"
            >
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left flex items-center justify-between h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer select-none",
                      isSelected
                        ? "text-brand-purple-light bg-brand-purple/10 font-medium"
                        : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                    )}
                  >
                    <TypographySpan>{opt.label}</TypographySpan>
                    {isSelected && <Check className="h-4 w-4 text-brand-purple-light" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <TypographySpan className="text-[11px] text-red-500 font-medium tracking-wide">
          {error}
        </TypographySpan>
      )}
    </div>
  );
}
