import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from "date-fns";
import { formatCurrency } from "./currencies";

/**
 * Format an amount with currency symbol and sign indicator
 */
export function formatAmount(
  amount: number,
  currencyCode: string = "BDT",
  showSign: boolean = false
): string {
  const formatted = formatCurrency(Math.abs(amount), currencyCode);
  if (!showSign) return formatted;
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatStr: string = "MMM dd, yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date with relative labeling
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d)) return format(d, "EEEE"); // Day name
  if (isThisMonth(d)) return format(d, "MMM dd");
  if (isThisYear(d)) return format(d, "MMM dd");
  return format(d, "MMM dd, yyyy");
}

/**
 * Format a date as "X ago" style
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format date for transaction grouping headers
 */
export function formatGroupDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d)) return format(d, "EEEE, MMM dd");
  if (isThisYear(d)) return format(d, "EEEE, MMM dd");
  return format(d, "MMM dd, yyyy");
}

/**
 * Format percentage with optional sign
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/**
 * Format a number for compact display
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
