"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { CURRENCIES } from "@/lib/currencies";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { Moon, Sun, Download, Globe, Palette, LogOut, Shield, User, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

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
    <div className="mx-auto max-w-[1000px] w-full px-3 py-3 pb-20 md:px-5 md:py-5 md:pb-6 space-y-4 md:space-y-6">
      <BlurFade delay={0}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-heading">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Manage your account preferences and app settings.</p>
        </div>
      </BlurFade>

      <div className="space-y-6">
        {/* Profile Information */}
        <BlurFade delay={0.05}>
          <Card className="p-5 md:p-6 bg-card border border-border">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border/20 pb-4">
              <User className="h-5 w-5 text-brand-purple" />
              Profile Information
            </h2>
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5 border-b border-border/20 pb-4 last:border-0 last:pb-0">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-text-primary">Full Name</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Your display name across the application.</p>
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  containerClassName="w-full md:w-64"
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5 border-b border-border/20 pb-4 last:border-0 last:pb-0">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-text-primary">Email Address</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Used for login and notifications (cannot be changed).</p>
                </div>
                <Input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  containerClassName="w-full md:w-64"
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  disabled={!name}
                  variant="primary"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </div>
          </Card>
        </BlurFade>

        {/* Preferences */}
        <BlurFade delay={0.1}>
          <Card className="p-5 md:p-6 bg-card border border-border">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border/20 pb-4">
              <Globe className="h-5 w-5 text-brand-purple" />
              Preferences
            </h2>
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5 border-b border-border/20 pb-4 last:border-0 last:pb-0">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-text-primary">Base Currency</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">Used for all calculations, reports, and displays.</p>
                </div>
                <Select 
                  value={selectedCurrency}
                  onChange={setCurrency}
                  options={currencyOptions}
                  containerClassName="w-full md:w-64"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5 last:border-0 last:pb-0">
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-text-primary">Timezone</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">For transaction dates and monthly reports sync.</p>
                </div>
                <Select 
                  value={timezone}
                  onChange={setTimezone}
                  options={timezoneOptions}
                  containerClassName="w-full md:w-64"
                />
              </div>
            </div>
          </Card>
        </BlurFade>

        {/* Appearance */}
        <BlurFade delay={0.2}>
          <Card className="p-5 md:p-6 bg-card border border-border">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border/20 pb-4">
              <Palette className="h-5 w-5 text-brand-purple" />
              Appearance
            </h2>
            <div className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm font-semibold text-text-primary">Theme</p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Choose between light and dark mode styling.</p>
              </div>
              <div className="flex bg-card-elevated border border-border/60 rounded-xl p-1">
                <button 
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${theme === "light" ? "bg-white dark:bg-zinc-800 text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${theme === "dark" ? "bg-zinc-800 dark:bg-white/[0.08] text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </div>
          </Card>
        </BlurFade>

        {/* Data Export */}
        <BlurFade delay={0.3}>
          <Card className="p-5 md:p-6 bg-card border border-border">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border/20 pb-4">
              <Download className="h-5 w-5 text-brand-purple" />
              Data Export
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5">
              <div>
                <p className="text-sm font-semibold text-text-primary">Export Transactions</p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Download all your transaction records as a standard CSV file.</p>
              </div>
              <Button 
                onClick={handleExportCSV}
                variant="secondary"
                className="gap-2"
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </Card>
        </BlurFade>

        {/* Account */}
        <BlurFade delay={0.4}>
          <Card className="p-5 md:p-6 bg-card border border-border">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border/20 pb-4">
              <Shield className="h-5 w-5 text-expense" />
              Account
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5">
              <div>
                <p className="text-sm font-semibold text-text-primary">Sign Out</p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Log out of your current session safely.</p>
              </div>
              <Button 
                onClick={() => import("next-auth/react").then(({ signOut }) => signOut())} 
                variant="destructive"
                className="gap-2 font-semibold"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </Card>
        </BlurFade>
      </div>
    </div>
  );
}
