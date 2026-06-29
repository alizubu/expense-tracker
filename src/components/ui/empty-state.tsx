"use client";
import { TypographyH3, TypographyP } from "@/components/ui/typography";

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
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-2xl bg-background/40 max-w-md mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
        <Icon className="h-5 w-5" />
      </div>
      <TypographyH3 className="text-sm font-semibold text-foreground mb-1">
        {title}
      </TypographyH3>
      <TypographyP className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mb-5">
        {description}
      </TypographyP>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
