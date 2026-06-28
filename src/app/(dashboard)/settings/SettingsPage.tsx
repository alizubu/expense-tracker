"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { CURRENCIES } from "@/lib/currencies";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { Globe, LogOut, Shield, User, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { selectedCurrency, setCurrency } = useUIStore();
  const { transactions } = useTransactionStore();
  const { data: session, update: updateSession } = useSession();
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
    <div className="flex flex-col min-h-screen p-4 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and app settings.</p>
      </div>

      <div className="space-y-6">
        {/* Preferences */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-white/[0.04] bg-surface-1 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <Globe className="h-4 w-4 text-primary" />
              Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-foreground">Base Currency</p>
                  <p className="text-xs text-muted-foreground mt-1">Used for all calculations, reports, and displays.</p>
                </div>
                <div className="w-full md:w-64">
                  <Select 
                    value={selectedCurrency}
                    onChange={setCurrency}
                    options={currencyOptions}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-foreground">Timezone</p>
                  <p className="text-xs text-muted-foreground mt-1">For transaction dates and monthly reports sync.</p>
                </div>
                <div className="w-full md:w-64">
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

        {/* Account */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-destructive/20 bg-surface-1 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-destructive flex items-center gap-2 mb-6 border-b border-destructive/10 pb-4">
              <Shield className="h-4 w-4" />
              Account Security
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-foreground">Sign Out</p>
                <p className="text-xs text-muted-foreground mt-1">Log out of your current session safely.</p>
              </div>
              <Button 
                onClick={() => import("next-auth/react").then(({ signOut }) => signOut())} 
                variant="destructive"
                className="gap-2 font-medium w-full md:w-auto"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
