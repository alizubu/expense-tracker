"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProfile = profiles.find((p) => p.id === selectedId) || profiles[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(false);
    onAddNew?.();
  };

  return (
    <div className="flex flex-col w-full" ref={containerRef}>
      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none">
        {label}
      </label>

      <div className="relative">
        {/* Trigger Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full h-10 flex items-center justify-between px-3 rounded-xl transition-all text-xs font-semibold text-left cursor-pointer",
            "bg-card-elevated border border-border hover:bg-card-hover text-text-primary focus:border-accent focus:ring-2 focus:ring-accent-dim"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedProfile ? (
              <>
                {(() => {
                  const Icon = getIcon(selectedProfile.icon);
                  return <Icon className="w-4 h-4 flex-shrink-0" style={{ color: selectedProfile.color }} />;
                })()}
                <span className="truncate">{selectedProfile.name}</span>
              </>
            ) : (
              <span className="truncate text-text-muted">No accounts yet</span>
            )}
          </div>
          <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", isOpen && "rotate-180")} />
        </motion.button>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 top-full left-0 right-0 mt-1.5 p-1.5 bg-[#0f0f1a] border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto no-scrollbar"
            >
              <div className="flex flex-col gap-1">
                {profiles.map((p) => {
                  const Icon = getIcon(p.icon);
                  const isSelected = p.id === selectedId;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer select-none",
                        isSelected
                          ? "bg-accent-dim text-accent"
                          : "text-text-secondary hover:bg-card-hover hover:text-text-primary"
                      )}
                    >
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: p.color }}
                      />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}

                {onAddNew && (
                  <>
                    <div className="my-1 h-px bg-border" />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddNew}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-accent hover:bg-accent-dim transition-colors text-left cursor-pointer select-none"
                    >
                      <Plus className="w-4 h-4 flex-shrink-0" />
                      <span>Add new account</span>
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}