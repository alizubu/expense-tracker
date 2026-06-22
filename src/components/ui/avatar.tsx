"use client";

import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: "sm" | "md" | "lg";
  gradientFrom?: string;
  gradientTo?: string;
}

export function Avatar({
  className,
  name = "User",
  size = "md",
  gradientFrom = "#7c3aed",
  gradientTo = "#4f46e5",
  ...props
}: AvatarProps) {
  const initials = getInitials(name);

  const sizes = {
    sm: "h-8 w-8 text-xs font-semibold",
    md: "h-10 w-10 text-sm font-semibold",
    lg: "h-12 w-12 text-base font-bold",
  };

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full text-white select-none border border-white/10 shadow-sm",
        sizes[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
      {...props}
    >
      {initials}
    </div>
  );
}
