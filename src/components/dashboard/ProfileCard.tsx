"use client";
import { TypographySpan, TypographyH2 } from "@/components/ui/typography";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";


function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

function getProfileColors(type: string) {
  switch (type.toLowerCase()) {
    case "cash":
      return { bg: "bg-emerald-500/10", icon: "text-emerald-500", bar: "bg-emerald-500" };
    case "bank":
    case "bank account":
      return { bg: "bg-blue-500/10", icon: "text-blue-500", bar: "bg-blue-500" };
    case "wallet":
    case "custom":
      return { bg: "bg-violet-500/10", icon: "text-violet-500", bar: "bg-violet-500" };
    case "moneybag":
      return { bg: "bg-amber-500/10", icon: "text-amber-500", bar: "bg-amber-500" };
    default:
      return { bg: "bg-slate-500/10", icon: "text-slate-500", bar: "bg-slate-500" };
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
    <Card className="flex flex-col w-full h-auto lg:h-full p-5 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <TypographyH2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Your Profiles
        </TypographyH2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-fr">
        {profiles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-32 text-center py-6">
            <LucideIcons.Wallet className="h-8 w-8 text-muted-foreground/50 mb-3 animate-pulse" />
            <TypographySpan className="text-sm font-medium text-muted-foreground">No profiles yet</TypographySpan>
          </div>
        ) : (
          profiles.map((profile, i) => {
            const Icon = getIcon(profile.icon);
            const percentage = netBalance > 0 ? Math.max(0, Math.min(100, (profile.balance / netBalance) * 100)) : 0;
            const colors = getProfileColors(profile.type);
            
            return (
              <motion.div 
                key={profile.id}
                initial={{ y: 4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className="group flex flex-col justify-between p-4 rounded-xl hover:bg-surface-2 cursor-pointer transition-colors relative border border-white/[0.02] bg-surface-1/50 flex-shrink-0 h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${colors.bg}`}>
                    <Icon size={20} className={colors.icon} />
                  </div>
                  <div className={`flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.icon} uppercase tracking-wider`}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <TypographySpan className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">{profile.name}</TypographySpan>
                  <TypographySpan className="text-xs text-muted-foreground truncate capitalize mb-2">{profile.type.toLowerCase()}</TypographySpan>
                  <div className="mt-auto">
                    <TypographySpan className="text-lg font-bold text-foreground tabular-money tracking-tight">
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
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: profiles.length * 0.05 }}
          onClick={onAdd}
          className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-primary/5 border border-dashed border-white/[0.1] hover:border-primary/30 cursor-pointer transition-colors flex-shrink-0 h-full min-h-[120px]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
            <LucideIcons.Plus size={20} />
          </div>
          <TypographySpan className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">Add Profile</TypographySpan>
        </motion.div>
      </div>
    </Card>
  );
}
