"use client";
import { TypographySpan, TypographyH2 } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { icons } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

function getIcon(iconName: string) {
  const Icon = icons[iconName as keyof typeof icons];
  return Icon || icons.Wallet;
}

function getProfileAccent(type: string) {
  switch (type.toLowerCase()) {
    case "cash":
      return { dot: "bg-emerald-500", border: "hover:border-emerald-500/30", glow: "group-hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.3)]" };
    case "bank":
    case "bank account":
      return { dot: "bg-blue-500", border: "hover:border-blue-500/30", glow: "group-hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]" };
    case "wallet":
    case "custom":
      return { dot: "bg-violet-500", border: "hover:border-violet-500/30", glow: "group-hover:shadow-[0_4px_20px_-4px_rgba(139,92,246,0.3)]" };
    case "moneybag":
      return { dot: "bg-amber-500", border: "hover:border-amber-500/30", glow: "group-hover:shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)]" };
    default:
      return { dot: "bg-slate-400", border: "hover:border-slate-400/30", glow: "group-hover:shadow-[0_4px_20px_-4px_rgba(100,116,139,0.3)]" };
  }
}

interface ProfileListCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles: any[];
  netBalance: number;
  onAdd: () => void;
}

export function ProfileCard({ profiles, netBalance, onAdd }: ProfileListCardProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const router = useRouter();

  return (
    <div className="flex flex-col w-full h-auto">
      <div className="flex items-center justify-between mb-4">
        <TypographyH2 className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
          Your Wallets
        </TypographyH2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {profiles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-28 text-center rounded-xl border border-dashed border-white/10 bg-surface-2/20 backdrop-blur-sm">
            <icons.CreditCard className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <TypographySpan className="text-xs font-medium text-muted-foreground/60">No wallets connected</TypographySpan>
          </div>
        ) : (
          profiles.map((profile, i) => {
            const Icon = getIcon(profile.icon);
            const percentage = netBalance > 0 ? Math.max(0, Math.min(100, (profile.balance / netBalance) * 100)) : 0;
            const accent = getProfileAccent(profile.type);
            
            return (
              <motion.div 
                key={profile.id}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className={`group flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150 border border-white/[0.05] ${accent.border} bg-surface-1/30 hover:bg-surface-1/50 ${accent.glow} backdrop-blur-xl`}
              >
                {/* Icon */}
                <div 
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                  style={{ backgroundColor: profile.color ? `${profile.color}1a` : undefined }}
                >
                  <Icon size={18} style={{ color: profile.color }} />
                </div>

                {/* Name + Balance (stacked, center) */}
                <div className="flex flex-col flex-1 min-w-0">
                  <TypographySpan className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors tracking-tight leading-tight">
                    {profile.name}
                  </TypographySpan>
                  <TypographySpan className="text-lg font-bold text-foreground tabular-money tracking-tighter leading-tight mt-0.5">
                    <span className="currency-symbol text-muted-foreground/50 text-sm">{symbol}</span>
                    {profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TypographySpan>
                </div>

                {/* Percentage dot + text */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                  <TypographySpan className="text-[10px] font-bold text-muted-foreground/50 tabular-nums">
                    {percentage.toFixed(1)}%
                  </TypographySpan>
                </div>
              </motion.div>
            );
          })
        )}
        
        {/* Add Profile Card */}
        <motion.div 
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3, delay: profiles.length * 0.05, ease: [0.23, 1, 0.32, 1] }}
          onClick={onAdd}
          className="group flex items-center justify-center gap-2 p-3.5 rounded-xl hover:bg-primary/5 border border-dashed border-white/[0.08] hover:border-primary/30 cursor-pointer transition-all duration-150 backdrop-blur-sm bg-white/[0.02]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <Plus size={16} />
          </div>
          <TypographySpan className="text-xs font-semibold text-muted-foreground/60 group-hover:text-primary transition-colors">Add Wallet</TypographySpan>
        </motion.div>
      </div>
    </div>
  );
}
