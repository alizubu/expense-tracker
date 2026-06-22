"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getIcon(iconName: string) {
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
  profiles: any[];
  netBalance: number;
  onAdd: () => void;
}

export function ProfileCard({ profiles, netBalance, onAdd }: ProfileListCardProps) {
  const { selectedCurrency } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);
  const router = useRouter();

  return (
    <Card className="flex flex-col w-full h-auto lg:h-full p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card">
      <div className="flex items-center justify-between h-[32px] mb-4 flex-shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Your Profiles
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAdd}
          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
        >
          <LucideIcons.Plus size={14} className="mr-1" />
          <span className="hidden sm:inline">Add New</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-1 lg:overflow-y-auto hide-scrollbar lg:min-h-0 space-y-4">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <LucideIcons.Wallet className="h-8 w-8 text-muted-foreground/50 mb-3 animate-pulse" />
            <span className="text-sm text-muted-foreground">No profiles yet</span>
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
                className="group flex flex-col justify-center p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors relative border border-white/[0.04] bg-background/50 flex-shrink-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
                    <Icon size={20} className={colors.icon} />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{profile.name}</span>
                    <span className="text-xs text-muted-foreground truncate capitalize">{profile.type.toLowerCase()}</span>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0 text-right">
                    <span className="text-sm font-bold text-foreground font-mono tracking-tight">
                      {symbol}{profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="hidden sm:block text-xs text-muted-foreground font-medium mt-0.5">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/50 rounded-b-xl m-0 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-b-xl ${colors.bar}`}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}
