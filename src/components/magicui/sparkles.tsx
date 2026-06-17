"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  children: ReactNode;
  className?: string;
  color?: string;
  count?: number;
}

interface Sparkle {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}

function generateSparkle(id: number): Sparkle {
  return {
    id,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 2,
    duration: Math.random() * 1 + 0.5,
  };
}

export function Sparkles({
  children,
  className,
  color = "#10B981",
  count = 6,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: count }, (_, i) => generateSparkle(i));
    setSparkles(initial);

    const interval = setInterval(() => {
      setSparkles((prev) =>
        prev.map((s) => ({
          ...generateSparkle(s.id),
          id: s.id,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <span className={cn("relative inline-block", className)}>
      {sparkles.map((sparkle) => (
        <svg
          key={sparkle.id}
          className="pointer-events-none absolute animate-sparkle-spin"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            zIndex: 20,
          }}
          viewBox="0 0 160 160"
          fill="none"
        >
          <path
            d="M80 0C80 0 84.2846 41.2925 99.496 60.504C114.707 79.7154 160 80 160 80C160 80 114.707 80.2846 99.496 99.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 60.504 99.496C45.2925 80.2846 0 80 0 80C0 80 45.2925 79.7154 60.504 60.504C75.7154 41.2925 80 0 80 0Z"
            fill={color}
          />
        </svg>
      ))}
      <span className="relative z-10">{children}</span>
    </span>
  );
}
