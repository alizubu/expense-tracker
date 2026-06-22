"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
}: DialogProps) {
  // Prevent background scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className={cn(
              "relative z-10 w-full bg-card border-t md:border border-border rounded-t-3xl md:rounded-2xl max-h-[90vh] md:max-w-[480px] flex flex-col shadow-2xl",
              className
            )}
          >
            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-white/[0.15] dark:bg-white/[0.15]" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex-none sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-6 py-4">
                <h2 className="text-base font-semibold text-text-primary">
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="rounded-full p-1.5 text-text-muted hover:bg-card-hover hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Confirmation Dialog Shortcut Component
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} showCloseButton={false}>
      <div className="space-y-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-text-secondary hover:bg-card-hover transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl text-white transition-all cursor-pointer shadow-sm",
              isDestructive
                ? "bg-red-600 hover:bg-red-500 shadow-red-500/10"
                : "bg-brand-purple hover:bg-violet-600 shadow-violet-500/10"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
