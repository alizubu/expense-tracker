"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error,
      label,
      leftIcon,
      rightIcon,
      containerClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const fallbackId = React.useId();
    const inputId = id || fallbackId;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-text-muted flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            disabled={disabled}
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-white/[0.02] dark:bg-white/[0.02] px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-200",
              "border-border placeholder:text-text-muted/60",
              "focus:border-brand-purple focus:bg-brand-purple/[0.02]",
              "focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-[11px] text-red-500 font-medium tracking-wide">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
