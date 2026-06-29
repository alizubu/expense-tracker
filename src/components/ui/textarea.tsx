"use client";
import { TypographyLabel, TypographySpan } from "@/components/ui/typography";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, containerClassName, disabled, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const textareaId = id || fallbackId;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <TypographyLabel
            htmlFor={textareaId}
            className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary select-none"
          >
            {label}
          </TypographyLabel>
        )}
        <textarea
          id={textareaId}
          disabled={disabled}
          ref={ref}
          className={cn(
            "w-full rounded-xl border bg-white/[0.02] dark:bg-white/[0.02] px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 min-h-[80px] resize-y",
            "border-border placeholder:text-text-muted/60",
            "focus:border-brand-purple focus:bg-brand-purple/[0.02]",
            "focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]",
            className
          )}
          {...props}
        />
        {error && (
          <TypographySpan className="text-[11px] text-red-500 font-medium tracking-wide">
            {error}
          </TypographySpan>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
