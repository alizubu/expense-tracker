"use client";

import { MagicCard } from "@/components/magicui/magic-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/useProfileStore";
import { useUIStore } from "@/store/useUIStore";
import { getCurrencySymbol } from "@/lib/currencies";
import { getProfileType } from "@/lib/profiles";
import { Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, any>)[iconName];
  return Icon || LucideIcons.Wallet;
}

export function ProfileCards() {
  const { profiles, activeProfileId, setActiveProfile } = useProfileStore();
  const { selectedCurrency, openModal } = useUIStore();
  const symbol = getCurrencySymbol(selectedCurrency);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
      {profiles.map((profile) => {
        const isActive = activeProfileId === profile.id;
        const profileType = getProfileType(profile.type);
        const Icon = getIcon(profile.icon);

        return (
          <button
            key={profile.id}
            onClick={() => setActiveProfile(isActive ? null : profile.id)}
            className="flex-shrink-0"
          >
            <MagicCard
              className={cn(
                "relative w-44 cursor-pointer p-4 transition-all duration-200",
                isActive ? "ring-1 ring-brand-purple/30" : "opacity-80 hover:opacity-100"
              )}
              gradientColor={profile.color}
              gradientOpacity={0.12}
            >
              {isActive && <BorderBeam colorFrom={profile.color} colorTo={profile.color + "80"} />}

              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: profile.color + "20" }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: profile.color }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary truncate max-w-[80px]">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {profileType?.label || profile.type}
                  </p>
                </div>
              </div>

              <p className="text-lg font-bold text-text-primary tabular-nums text-left">
                {symbol} {profile.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </p>
            </MagicCard>
          </button>
        );
      })}

      {/* Add Profile Card */}
      <button
        onClick={() => openModal("createProfile")}
        className="flex-shrink-0"
      >
        <div className="flex h-full w-44 items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]">
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <Plus className="h-6 w-6" />
            <span className="text-xs font-medium">Add Profile</span>
          </div>
        </div>
      </button>
    </div>
  );
}
