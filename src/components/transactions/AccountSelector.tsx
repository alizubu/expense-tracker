"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
}

export function AccountSelector({ profiles, selectedId, onChange, label }: AccountSelectorProps) {
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

  return (
    <div className="flex flex-col w-full" ref={containerRef}>
      <style>{`
        @keyframes accountGlow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(139,92,246,0.4) }
          50%      { box-shadow: 0 0 18px 6px rgba(167,139,250,0.7) }
        }
        .account-glow-active {
          animation: accountGlow 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .account-glow-active {
            animation: none !important;
          }
        }
      `}</style>
      
      <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
      </label>

      <div className="relative">
        {/* Trigger Button */}
        {selectedProfile && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full h-10 flex items-center justify-between px-3 rounded-[var(--radius-sm)] transition-all text-[13px] font-medium text-left",
              "bg-[rgba(109,40,217,0.15)] border border-[rgba(139,92,246,0.8)] account-glow-active"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {(() => {
                const Icon = getIcon(selectedProfile.icon);
                return <Icon className="w-4 h-4 text-[#c4b5fd] flex-shrink-0" />;
              })()}
              <span className="text-[#c4b5fd] truncate">{selectedProfile.name}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-[#c4b5fd] transition-transform", isOpen && "rotate-180")} />
          </motion.button>
        )}

        {/* Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-50 top-full left-0 right-0 mt-2 p-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[12px] shadow-xl max-h-48 overflow-y-auto no-scrollbar"
            >
              <div className="flex flex-col gap-1">
                {profiles.map((p) => {
                  const Icon = getIcon(p.icon);
                  const isSelected = p.id === selectedId;

                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p.id)}
                      whileTap={{ scale: 1.04, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px] transition-colors text-left",
                        isSelected
                          ? "bg-[rgba(109,40,217,0.15)] border border-[rgba(139,92,246,0.8)] text-[#c4b5fd]"
                          : "bg-[rgba(255,255,255,0.02)] border border-transparent text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]"
                      )}
                    >
                      <Icon 
                        className="w-4 h-4 flex-shrink-0" 
                        style={!isSelected ? { color: p.color } : { color: "#c4b5fd" }} 
                      />
                      <span className="truncate">{p.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
