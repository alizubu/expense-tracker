import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "income" | "expense" | "transfer";
  color?: string; // Custom color (hex) for profiles/categories
}

export function Badge({
  className,
  variant = "default",
  color,
  children,
  style,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border";

  const variants = {
    default:
      "bg-brand-purple/10 text-brand-purple-light border-brand-purple/20",
    secondary:
      "bg-white/[0.04] dark:bg-white/[0.04] text-text-secondary border-border",
    income:
      "bg-income/10 text-income border-income/20",
    expense:
      "bg-expense/10 text-expense border-expense/20",
    transfer:
      "bg-transfer/10 text-transfer border-transfer/20",
  };

  const customStyle = color
    ? {
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
        ...style,
      }
    : style;

  return (
    <span
      className={cn(
        baseStyles,
        !color && variants[variant],
        className
      )}
      style={customStyle}
      {...props}
    >
      {children}
    </span>
  );
}
