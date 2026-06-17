"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  delay?: number;
}

export function AnimatedList({ children, className, delay = 100 }: AnimatedListProps) {
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalItems = children.length;
    if (visibleItems >= totalItems) return;

    const timer = setTimeout(() => {
      setVisibleItems((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleItems, children.length, delay]);

  return (
    <div ref={listRef} className={cn("flex flex-col gap-2", className)}>
      {children.slice(0, visibleItems).map((child, index) => (
        <div
          key={index}
          className="animate-slide-in"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
