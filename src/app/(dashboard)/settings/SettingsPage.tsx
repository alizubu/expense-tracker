"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useUIStore } from "@/store/useUIStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { CURRENCIES } from "@/lib/currencies";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { Moon, Sun, Download, Globe, Palette, LogOut, Shield, User, Save, Loader2 } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-3xl px-3 py-3 pb-20 md:px-5 md:py-5 md:pb-6 space-y-6">
      <BlurFade delay={0}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-heading">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Manage your account preferences and app settings.</p>
        </div>
      </BlurFade>

      <div className="space-y-6">
        <BlurFade delay={0.05}>
          <MagicCard className="p-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-brand-purple" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-white/[0.05]">
                <div>
                  <p className="font-medium text-text-primary">Full Name</p>
                  <p className="text-sm text-text-muted">Your display name</p>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2 text-text-primary outline-none focus:border-brand-purple w-full md:w-64"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-white/[0.05]">
                <div>
                  <p className="font-medium text-text-primary">Email Address</p>
                  <p className="text-sm text-text-muted">Used for login (cannot be changed)</p>
                </div>
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2 text-text-muted outline-none cursor-not-allowed w-full md:w-64"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple/20 text-brand-purple-light hover:bg-brand-purple/30 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        <BlurFade delay={0.1}>
          <MagicCard className="p-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-brand-purple" />
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-white/[0.05]">
                <div>
                  <p className="font-medium text-text-primary">Base Currency</p>
                  <p className="text-sm text-text-muted">Used for all calculations and displays</p>
                </div>
                <select 
                  value={selectedCurrency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2 text-text-primary outline-none focus:border-brand-purple"
                >
                  {CURRENCIES.map((c: any) => (
                    <option key={c.code} value={c.code} className="bg-background-card">
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-text-primary">Timezone</p>
                  <p className="text-sm text-text-muted">For transaction dates and reminders</p>
                </div>
                <select 
                  className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2 text-text-primary outline-none focus:border-brand-purple"
                  defaultValue="Asia/Dhaka"
                >
                  <option value="Asia/Dhaka" className="bg-background-card">Asia/Dhaka (GMT+6)</option>
                  <option value="UTC" className="bg-background-card">UTC (GMT+0)</option>
                  <option value="America/New_York" className="bg-background-card">Eastern Time (GMT-4)</option>
                </select>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        <BlurFade delay={0.2}>
          <MagicCard className="p-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-brand-purple" />
              Appearance
            </h2>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-text-primary">Theme</p>
                <p className="text-sm text-text-muted">Choose between light and dark mode</p>
              </div>
              <div className="flex bg-white/[0.05] rounded-xl p-1">
                <button 
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === "light" ? "bg-white text-black" : "text-text-muted hover:text-text-primary"}`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === "dark" ? "bg-[#1C1C27] text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </div>
          </MagicCard>
        </BlurFade>

        <BlurFade delay={0.3}>
          <MagicCard className="p-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Download className="h-5 w-5 text-brand-purple" />
              Data Export
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-text-primary">Export Transactions</p>
                <p className="text-sm text-text-muted">Download all your data as a CSV file</p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.1] hover:bg-white/[0.05] text-text-primary transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </MagicCard>
        </BlurFade>

        <BlurFade delay={0.4}>
          <MagicCard className="p-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-expense" />
              Account
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-text-primary">Sign Out</p>
                <p className="text-sm text-text-muted">Log out of your current session</p>
              </div>
              <button onClick={() => import("next-auth/react").then(({ signOut }) => signOut())} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-expense/10 text-expense hover:bg-expense/20 transition-colors text-sm font-medium">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    </div>
  );
}
