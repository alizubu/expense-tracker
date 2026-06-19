"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function ConfirmButton({ onClick, disabled, label = "Confirm Transaction" }: ConfirmButtonProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes btnGlow {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(124, 58, 237, 0.5) }
          50%      { box-shadow: 0 0 24px 8px rgba(139, 92, 246, 0.8) }
        }
        @keyframes btnGlowHover {
          0%, 100% { box-shadow: 0 0 16px 4px rgba(139, 92, 246, 0.7) }
          50%      { box-shadow: 0 0 32px 12px rgba(167, 139, 250, 0.9) }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-btn, .shimmer-btn:hover {
            animation: none !important;
          }
        }
        .shimmer-btn {
          background-size: 200% auto;
          background-image: linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6, #7c3aed, #6d28d9);
          animation: shimmer 3s linear infinite, btnGlow 2s ease-in-out infinite;
        }
        .shimmer-btn:hover {
          animation: shimmer 3s linear infinite, btnGlowHover 2s ease-in-out infinite;
        }
        .shimmer-btn-disabled {
          background-image: linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6);
        }
      `}</style>

      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 10 } }}
        className={cn(
          "w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2 text-white text-[14px] font-semibold transition-all",
          disabled 
            ? "shimmer-btn-disabled opacity-40 cursor-not-allowed" 
            : "shimmer-btn cursor-pointer"
        )}
      >
        <CheckCircle className="h-[18px] w-[18px]" />
        {label}
      </motion.button>
    </>
  );
}
