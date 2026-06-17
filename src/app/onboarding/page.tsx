"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PROFILE_TYPES = [
  { type: "MONEYBAG", label: "Moneybag", emoji: "💰", color: "#7C3AED" },
  { type: "CASH", label: "Cash", emoji: "💵", color: "#10B981" },
  { type: "BANK", label: "Bank Account", emoji: "🏦", color: "#3B82F6" },
  { type: "MOBILE_BANKING", label: "Mobile Banking", emoji: "📱", color: "#F59E0B" },
  { type: "SAVINGS", label: "Savings", emoji: "🐷", color: "#EC4899" },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const handleFinish = async () => {
    setLoading(true);

    // Create user in DB
    await fetch("/api/user", { method: "POST" });

    // Create selected profiles
    for (const type of selectedProfiles) {
      const profile = PROFILE_TYPES.find((p) => p.type === type);
      if (!profile) continue;
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.label,
          type: profile.type,
          icon: profile.emoji,
          color: profile.color,
          balance: balances[type] ?? 0,
        }),
      });
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#16161E] border border-white/10 rounded-2xl p-8">

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Welcome, {session?.user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-400 mb-8">
              Let's set up your wallet profiles. Select the ones you use:
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {PROFILE_TYPES.map((p) => (
                <button
                  key={p.type}
                  onClick={() =>
                    setSelectedProfiles((prev) =>
                      prev.includes(p.type)
                        ? prev.filter((x) => x !== p.type)
                        : [...prev, p.type]
                    )
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    selectedProfiles.includes(p.type)
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-white font-medium">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedProfiles.length === 0}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-medium rounded-xl transition"
            >
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Set starting balances
            </h2>
            <p className="text-slate-400 mb-6">
              How much money do you currently have in each wallet?
            </p>
            <div className="space-y-3 mb-8">
              {selectedProfiles.map((type) => {
                const profile = PROFILE_TYPES.find((p) => p.type === type);
                if (!profile) return null;
                return (
                  <div key={type} className="flex items-center gap-4 bg-[#1C1C27]
                                              rounded-xl p-4 border border-white/10">
                    <span className="text-2xl">{profile.emoji}</span>
                    <span className="text-white flex-1">{profile.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">৳</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={balances[type] ?? ""}
                        onChange={(e) =>
                          setBalances((prev) => ({
                            ...prev,
                            [type]: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-28 bg-[#0A0A0F] border border-white/10 rounded-lg
                                   px-3 py-2 text-white text-right focus:outline-none
                                   focus:border-violet-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-white/10 text-slate-400
                           hover:border-white/20 rounded-xl transition"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700
                           disabled:opacity-60 text-white font-medium rounded-xl transition"
              >
                {loading ? "Setting up..." : "Get Started 🚀"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
