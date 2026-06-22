"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag" | "onDragStart" | "onDragEnd"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:brightness-110 border border-violet-500/20",
      secondary:
        "bg-white/[0.04] dark:bg-white/[0.04] text-text-primary border border-border hover:bg-white/[0.08] dark:hover:bg-white/[0.08]",
      outline:
        "border border-border bg-transparent text-text-primary hover:bg-white/[0.04]",
      ghost:
        "bg-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text-primary",
      destructive:
        "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 shadow-sm",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    const isBtnDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isBtnDisabled}
        whileTap={isBtnDisabled ? undefined : { scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
