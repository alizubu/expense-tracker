"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#A78BFA",
  shimmerSize = "0.1em",
  borderRadius = "0.75rem",
  shimmerDuration = "2s",
  background = "rgba(124, 58, 237, 0.15)",
  onClick,
  disabled = false,
  type = "button",
}: ShimmerButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 font-medium text-white transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        borderRadius,
        ["--shimmer-color" as string]: shimmerColor,
        ["--speed" as string]: shimmerDuration,
      }}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0"
          style={{ background }}
        />
        <div
          className="absolute inset-0 animate-shimmer-slide"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${shimmerColor}33 40%, ${shimmerColor}66 50%, ${shimmerColor}33 60%, transparent 100%)`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      {/* Border */}
      <div
        className="absolute inset-0 border border-white/10"
        style={{ borderRadius }}
      />
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
