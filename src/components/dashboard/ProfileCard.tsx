"use client";
import { TypographySpan, TypographyH2 } from "@/components/ui/typography";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";

function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

function getProfileColors(type: string) {
  switch (type.toLowerCase()) {
    case "cash":
      return { 
        bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-500", glow: "group-hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.4)]",
        gradient: "from-emerald-500/20 via-surface-1/40 to-surface-1/80"
      };
    case "bank":
    case "bank account":
      return { 
        bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-500", glow: "group-hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.4)]",
        gradient: "from-blue-500/20 via-surface-1/40 to-surface-1/80"
      };
    case "wallet":
    case "custom":
      return { 
        bg: "bg-violet-500/10", border: "border-violet-500/30", icon: "text-violet-500", glow: "group-hover:shadow-[0_8px_32px_-8px_rgba(139,92,246,0.4)]",
        gradient: "from-violet-500/20 via-surface-1/40 to-surface-1/80"
      };
    case "moneybag":
      return { 
        bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-500", glow: "group-hover:shadow-[0_8px_32px_-8px_rgba(245,158,11,0.4)]",
        gradient: "from-amber-500/20 via-surface-1/40 to-surface-1/80"
      };
    default:
      return { 
        bg: "bg-slate-500/10", border: "border-slate-500/30", icon: "text-slate-500", glow: "group-hover:shadow-[0_8px_32px_-8px_rgba(100,116,139,0.4)]",
        gradient: "from-slate-500/20 via-surface-1/40 to-surface-1/80"
      };
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
      <div className="flex items-center justify-between mb-6">
        <TypographyH2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Your Wallets
        </TypographyH2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {profiles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-48 text-center py-6 rounded-3xl border border-dashed border-white/10 bg-surface-2/30 backdrop-blur-sm">
            <LucideIcons.CreditCard className="h-10 w-10 text-muted-foreground/50 mb-4 animate-pulse" />
            <TypographySpan className="text-sm font-medium text-muted-foreground">No wallets connected</TypographySpan>
          </div>
        ) : (
          profiles.map((profile, i) => {
            const Icon = getIcon(profile.icon);
            const percentage = netBalance > 0 ? Math.max(0, Math.min(100, (profile.balance / netBalance) * 100)) : 0;
            const colors = getProfileColors(profile.type);
            
            return (
              <motion.div 
                key={profile.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ y: -6, scale: 1.03, rotateX: 2, rotateY: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className={`group flex flex-col justify-between p-6 rounded-[24px] cursor-pointer transition-all relative border border-white/[0.05] hover:${colors.border} bg-gradient-to-br ${colors.gradient} backdrop-blur-2xl ${colors.glow} overflow-hidden min-h-[200px] shadow-lg`}
                style={{ perspective: "1000px" }}
              >
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
                
                {/* Glass sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-x-full group-hover:translate-x-full ease-in-out" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] shadow-sm ${colors.bg} ring-1 ring-white/10 group-hover:ring-white/20 transition-all backdrop-blur-md`}>
                    <Icon size={22} className={colors.icon} />
                  </div>
                  <div className={`flex items-center justify-center text-[10px] font-bold px-3 py-1.5 rounded-full bg-background/40 backdrop-blur-md ${colors.icon} uppercase tracking-wider border border-white/10 shadow-inner`}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex flex-col flex-1 min-w-0 relative z-10 justify-end">
                  <TypographySpan className="text-xs text-muted-foreground/80 truncate uppercase tracking-widest mb-1 font-semibold">{profile.type.toLowerCase()}</TypographySpan>
                  <TypographySpan className="text-xl font-semibold text-foreground truncate group-hover:text-primary transition-colors tracking-tight mb-4">{profile.name}</TypographySpan>
                  
                  <div className="mt-auto">
                    <TypographySpan className="text-3xl font-bold text-foreground tabular-money tracking-tighter drop-shadow-sm">
                      {symbol}{profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TypographySpan>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        
        {/* Add Profile Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.5, delay: profiles.length * 0.1, type: "spring", stiffness: 300, damping: 20 }}
          onClick={onAdd}
          className="group flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-primary/5 border border-dashed border-white/[0.1] hover:border-primary/40 cursor-pointer transition-all min-h-[200px] relative overflow-hidden backdrop-blur-sm shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-sm ring-1 ring-primary/20">
            <LucideIcons.Plus size={26} />
          </div>
          <TypographySpan className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors tracking-wide">Add Wallet</TypographySpan>
        </motion.div>
      </div>
    </div>
  );
}
