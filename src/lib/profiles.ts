export interface ProfileType {
  type: string;
  label: string;
  emoji: string;
  icon: string;
  color: string;
}

export const PROFILE_TYPES: ProfileType[] = [
  { type: "MONEYBAG",       label: "Moneybag",         emoji: "💰", icon: "Wallet",       color: "#7C3AED" },
  { type: "CASH",           label: "Cash",             emoji: "💵", icon: "Banknote",     color: "#10B981" },
  { type: "BANK",           label: "Bank Account",     emoji: "🏦", icon: "Landmark",     color: "#3B82F6" },
  { type: "MOBILE_BANKING", label: "Mobile Banking",   emoji: "📱", icon: "Smartphone",   color: "#F59E0B" },
  { type: "Bkash",          label: "bKash",            emoji: "🦅", icon: "Wallet",       color: "#E11471" },
  { type: "SAVINGS",        label: "Savings Account",  emoji: "🐷", icon: "PiggyBank",    color: "#EC4899" },
  { type: "INVESTMENT",     label: "Investment",       emoji: "📈", icon: "TrendingUp",   color: "#22C55E" },
  { type: "CRYPTO",         label: "Crypto Wallet",    emoji: "🔐", icon: "Bitcoin",      color: "#F97316" },
  { type: "CUSTOM",         label: "Custom",           emoji: "✨", icon: "Star",         color: "#A78BFA" },
];

export function getProfileType(type: string): ProfileType | undefined {
  return PROFILE_TYPES.find((p) => p.type === type);
}

export function getProfileIcon(type: string): string {
  return getProfileType(type)?.icon ?? "Wallet";
}

export function getProfileEmoji(type: string): string {
  return getProfileType(type)?.emoji ?? "💰";
}

export function getProfileColor(type: string): string {
  return getProfileType(type)?.color ?? "#7C3AED";
}
