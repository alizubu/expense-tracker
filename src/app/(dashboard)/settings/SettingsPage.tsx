"use client";
import { TypographyH1, TypographyP, TypographyH2 } from "@/components/ui/typography";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { CURRENCIES } from "@/lib/currencies";
import { Globe, LogOut, Shield } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { selectedCurrency, setCurrency } = useUIStore();
  const { data: session } = useSession();
  const [timezone, setTimezone] = useState("Asia/Dhaka");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          if (data.currency) setCurrency(data.currency);
        }
      } catch (error) {
        console.error("Failed to fetch user settings", error);
      }
    };
    if (session?.user) {
      fetchUser();
    }
  }, [session, setCurrency]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currencyOptions = CURRENCIES.map((c: any) => ({
    value: c.code,
    label: `${c.code} (${c.symbol}) - ${c.name}`
  }));

  const timezoneOptions = [
    { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
    { value: "UTC", label: "UTC (GMT+0)" },
    { value: "America/New_York", label: "Eastern Time (GMT-4)" }
  ];

  return (
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-[1000px] mx-auto w-full relative">
      {/* Ambient Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="mb-10 relative z-10">
        <TypographyH1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">Settings</TypographyH1>
        <TypographyP className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">Manage your account preferences and application settings.</TypographyP>
      </div>

      <div className="space-y-8 relative z-10">
        {/* Preferences */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
          <Card className="p-8 lg:p-10 border rounded-[32px] overflow-hidden border-white/[0.08] bg-surface-1/40 hover:bg-surface-1/60 hover:border-white/[0.12] hover:shadow-2xl backdrop-blur-2xl transition-all duration-500 relative group">
            {/* Internal Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000" />
            
            <TypographyH2 className="text-[14px] font-bold uppercase tracking-widest text-primary flex items-center gap-3 mb-8 border-b border-white/[0.04] pb-6 relative z-10">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              Preferences
            </TypographyH2>
            
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 -mx-4 rounded-2xl hover:bg-surface-2/40 transition-colors">
                <div className="max-w-md">
                  <TypographyP className="text-base font-bold text-foreground tracking-tight">Base Currency</TypographyP>
                  <TypographyP className="text-[13px] font-medium text-muted-foreground/80 mt-1 leading-relaxed">Used for all calculations, reports, and dashboard displays across the application.</TypographyP>
                </div>
                <div className="w-full md:w-72">
                  <Select 
                    value={selectedCurrency}
                    onChange={setCurrency}
                    options={currencyOptions}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 -mx-4 rounded-2xl hover:bg-surface-2/40 transition-colors">
                <div className="max-w-md">
                  <TypographyP className="text-base font-bold text-foreground tracking-tight">Timezone</TypographyP>
                  <TypographyP className="text-[13px] font-medium text-muted-foreground/80 mt-1 leading-relaxed">Determines how transaction dates and monthly analytics reports are synchronized.</TypographyP>
                </div>
                <div className="w-full md:w-72">
                  <Select 
                    value={timezone}
                    onChange={setTimezone}
                    options={timezoneOptions}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Security */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
          <Card className="p-8 lg:p-10 border rounded-[32px] overflow-hidden border-destructive/20 bg-surface-1/40 hover:bg-surface-1/60 hover:border-destructive/30 hover:shadow-2xl hover:shadow-destructive/5 backdrop-blur-2xl transition-all duration-500 relative group">
            {/* Internal Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-destructive/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-destructive/20 transition-colors duration-1000" />
            
            <TypographyH2 className="text-[14px] font-bold uppercase tracking-widest text-destructive flex items-center gap-3 mb-8 border-b border-destructive/10 pb-6 relative z-10">
              <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 shadow-sm">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              Account Security
            </TypographyH2>
            
            <div className="relative z-10 p-4 -mx-4 rounded-2xl hover:bg-destructive/5 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-md">
                  <TypographyP className="text-base font-bold text-foreground tracking-tight">Sign Out</TypographyP>
                  <TypographyP className="text-[13px] font-medium text-muted-foreground/80 mt-1 leading-relaxed">Securely end your current session and log out of the application on this device.</TypographyP>
                </div>
                <Button 
                  onClick={() => import("next-auth/react").then(({ signOut }) => signOut())} 
                  variant="destructive"
                  className="gap-2 font-bold w-full md:w-auto h-11 px-8 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
