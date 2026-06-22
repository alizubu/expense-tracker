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
import { Moon, Sun, Download, Globe, Palette, LogOut, Shield, User, Save, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { selectedCurrency, setCurrency } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { transactions } = useTransactionStore();
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Dhaka");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
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

  const handleSaveProfile = async () => {
    if (!name) { toast.error("Name is required"); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency: selectedCurrency }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      await updateSession({ name });
      toast.success("Settings updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["ID", "Date", "Type", "Category", "Amount", "Title", "Note"];
    const rows = transactions.map(t => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === t.category);
      return [
        t.id,
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        cat?.label || t.category,
        t.amount,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.note ? t.note.replace(/"/g, '""') : ''}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Transactions exported successfully");
  };

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
        {/* Profile Information */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-foreground">Full Name</p>
                  <p className="text-xs text-muted-foreground mt-1">Your display name across the application.</p>
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full md:w-64 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:shadow-[0_0_15px_hsl(var(--primary)/0.1)] transition-shadow"
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-foreground">Email Address</p>
                  <p className="text-xs text-muted-foreground mt-1">Used for login and notifications (cannot be changed).</p>
                </div>
                <Input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="w-full md:w-64 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:shadow-[0_0_15px_hsl(var(--primary)/0.1)] transition-shadow"
                />
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-white/[0.04]">
                <Button
                  onClick={handleSaveProfile}
                  disabled={!name || isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <Globe className="h-5 w-5 text-primary" />
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

        {/* Appearance */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground mt-1">Choose between light and dark mode styling.</p>
              </div>
              <div className="flex bg-muted rounded-lg p-1 w-full md:w-auto">
                <button 
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Data Export */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-white/[0.06] bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <Download className="h-5 w-5 text-primary" />
              Data Export
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-foreground">Export Transactions</p>
                <p className="text-xs text-muted-foreground mt-1">Download all your transaction records as a standard CSV file.</p>
              </div>
              <Button 
                onClick={handleExportCSV}
                variant="outline"
                className="gap-2 w-full md:w-auto"
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.3 }}>
          <Card className="p-6 rounded-2xl shadow-sm border border-destructive/20 bg-card">
            <h2 className="text-lg font-bold text-destructive flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
              <Shield className="h-5 w-5" />
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
