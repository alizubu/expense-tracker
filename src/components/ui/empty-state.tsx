"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-2xl bg-card/40 max-w-md mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-accent mb-4 border border-accent/10">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-text-muted leading-relaxed max-w-[280px] mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
