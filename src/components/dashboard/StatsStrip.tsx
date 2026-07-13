"use client";
import { TypographySpan, TypographyH3 } from "@/components/ui/typography";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { Card } from "@/components/ui/card";
import { useRef, useEffect, useState } from "react";

interface StatsStripProps {
  netBalance: number;
  income: number;
  expenses: number;
  sparklineData?: { value: number }[];
}

/** Tiny inline sparkline SVG with draw-in animation */
function Sparkline({ data, color, className }: { data: { value: number }[]; color: string; className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(200);

  const width = 80;
  const height = 36;
  const padding = 2;

  if (data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => ({
    x: padding + (i / (values.length - 1)) * (width - padding * 2),
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  // Smooth curve through points using catmull-rom → cubic bezier
  const d = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const p0 = arr[Math.max(0, i - 2)];
    const p1 = arr[i - 1];
    const p2 = point;
    const p3 = arr[Math.min(arr.length - 1, i + 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }, "");

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width, height }}
      fill="none"
    >
      <defs>
        <linearGradient id={`spark-grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path
        d={`${d} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`}
        fill={`url(#spark-grad-${color.replace(/[^a-z0-9]/gi, '')})`}
        opacity="0.5"
      />
      {/* Line */}
      <path
        ref={pathRef}
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          animation: `sparkline-draw 1.2s ease-out 0.3s forwards`,
        }}
      />
    </svg>
  );
}

export function StatsStrip({ netBalance, income, expenses, sparklineData }: StatsStripProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  // Generate mini sparkline data for income/expense from main sparkline data
  const incomeSparkline = sparklineData && sparklineData.length > 1
    ? sparklineData.map((_, i) => ({ value: income * (0.7 + Math.sin(i * 0.8) * 0.3) }))
    : [{ value: 0 }, { value: income }];
  const expenseSparkline = sparklineData && sparklineData.length > 1
    ? sparklineData.map((_, i) => ({ value: expenses * (0.6 + Math.cos(i * 0.6) * 0.4) }))
    : [{ value: 0 }, { value: expenses }];

  return (
    <>
      {/* Total Balance Card */}
      <Card className="p-4 rounded-xl border border-white/[0.04] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group hover:bg-surface-1/50 transition-all duration-300 min-h-[110px]">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary ring-1 ring-primary/20">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <TypographyH3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              Net Worth
            </TypographyH3>
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></span>
          </div>
          
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-0.5 text-foreground">
                <TypographySpan className="text-lg font-medium text-muted-foreground/50 currency-symbol">{symbol}</TypographySpan>
                <TypographySpan className="text-2xl lg:text-3xl font-bold tracking-tighter tabular-money leading-none">
                  {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
            </div>
            {sparklineData && sparklineData.length > 1 && (
              <Sparkline data={sparklineData} color="hsl(172, 66%, 50%)" className="opacity-80 flex-shrink-0" />
            )}
          </div>
        </div>
      </Card>

      {/* Income Card */}
      <Card className="p-4 rounded-xl border border-white/[0.04] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group hover:bg-surface-1/50 transition-all duration-300 min-h-[110px]">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 ring-1 ring-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <TypographyH3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              Total Income
            </TypographyH3>
          </div>
          
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-0.5 text-emerald-500">
                <TypographySpan className="text-base font-medium opacity-50 currency-symbol">{symbol}</TypographySpan>
                <TypographySpan className="text-xl lg:text-2xl font-bold tracking-tighter tabular-money leading-none">
                  {income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
              <TypographySpan className="text-[10px] text-muted-foreground/50 font-medium mt-1 block">This month</TypographySpan>
            </div>
            <Sparkline data={incomeSparkline} color="#10B981" className="opacity-70 flex-shrink-0" />
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-4 rounded-xl border border-white/[0.04] bg-surface-1/30 backdrop-blur-2xl relative overflow-hidden group hover:bg-surface-1/50 transition-all duration-300 min-h-[110px]">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500 ring-1 ring-rose-500/20">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <TypographyH3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              Total Expenses
            </TypographyH3>
          </div>
          
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-0.5 text-rose-500">
                <TypographySpan className="text-base font-medium opacity-50 currency-symbol">{symbol}</TypographySpan>
                <TypographySpan className="text-xl lg:text-2xl font-bold tracking-tighter tabular-money leading-none">
                  {expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TypographySpan>
              </div>
              <TypographySpan className="text-[10px] text-muted-foreground/50 font-medium mt-1 block">This month</TypographySpan>
            </div>
            <Sparkline data={expenseSparkline} color="#F43F5E" className="opacity-70 flex-shrink-0" />
          </div>
        </div>
      </Card>
    </>
  );
}
