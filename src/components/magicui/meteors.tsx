"use client";

import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 12, className }: MeteorsProps) {
  const meteors = Array.from({ length: number }, (_, i) => i);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {meteors.map((i) => {
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const size = Math.random() * 1 + 0.5;

        return (
          <span
            key={i}
            className="absolute top-0 h-0.5 rotate-[215deg] animate-meteor rounded-full bg-gradient-to-r from-[#7C3AED] to-transparent"
            style={{
              left: `${left}%`,
              top: `-5%`,
              width: `${Math.random() * 80 + 40}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: size * 0.6,
            }}
          >
            <span
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 w-1 rounded-full bg-[#A78BFA]"
              style={{
                boxShadow: `0 0 ${size * 4}px ${size * 2}px rgba(124, 58, 237, 0.6)`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
