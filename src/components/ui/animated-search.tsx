"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AnimatedSearch({ value, onChange, placeholder = "Search...", className }: AnimatedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isFocused || value ? 320 : 240,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative flex items-center h-10 rounded-xl bg-surface-1 border transition-colors",
        isFocused ? "border-primary/50 shadow-[0_0_15px_var(--primary-glow)] ring-1 ring-primary/20" : "border-white/[0.04]",
        className
      )}
    >
      <Search 
        size={16} 
        className={cn(
          "absolute left-3 transition-colors duration-200",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} 
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full h-full pl-9 pr-9 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-xl"
      />
      <AnimatePresence>
        {value.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors focus:outline-none"
          >
            <X size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
