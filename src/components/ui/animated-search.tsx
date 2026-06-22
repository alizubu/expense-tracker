"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholders?: string[];
  className?: string;
}

export function AnimatedSearch({ 
  value, 
  onChange, 
  placeholders = [
    "Search transactions...",
    "Search 'Groceries'...",
    "Search 'Salary'...",
    "Search by amount...",
    "Search by date..."
  ], 
  className 
}: AnimatedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (!isFocused && !value) {
      interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isFocused, value, placeholders.length]);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isFocused || value ? 380 : 300,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative flex items-center h-12 rounded-full bg-surface-1 border transition-colors overflow-hidden mx-auto shadow-sm",
        isFocused ? "border-primary/50 shadow-[0_0_20px_var(--primary-glow)] ring-2 ring-primary/20" : "border-white/[0.06] hover:border-white/[0.1]",
        className
      )}
    >
      <Search 
        size={18} 
        className={cn(
          "absolute left-4 transition-colors duration-200 z-10",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} 
      />
      
      <div className="relative w-full h-full flex items-center">
        {/* Animated Placeholders */}
        <AnimatePresence mode="popLayout">
          {!value && !isFocused && (
            <motion.p
              key={currentPlaceholder}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-10 text-sm text-muted-foreground pointer-events-none whitespace-nowrap"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full pl-10 pr-10 bg-transparent border-none text-sm text-foreground focus:outline-none rounded-full relative z-20"
        />
      </div>

      <AnimatePresence>
        {value.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors focus:outline-none z-30"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
