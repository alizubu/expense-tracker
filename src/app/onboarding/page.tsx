"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useUIStore } from "@/store/useUIStore";
import { useProfileStore } from "@/store/useProfileStore";
import { CURRENCIES } from "@/lib/currencies";
import { ArrowRight, Check, Target, Wallet, Sparkles } from "lucide-react";

const STEPS = [
  { id: 1, title: "Welcome" },
  { id: 2, title: "Preferences" },
  { id: 3, title: "First Profile" },
  { id: 4, title: "Ready" }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const { selectedCurrency, setCurrency } = useUIStore();
  const { addProfile } = useProfileStore();
  
  const [profileName, setProfileName] = useState("Main Wallet");
  const [profileType, setProfileType] = useState<any>("MONEYBAG");

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Create first profile on completion
      addProfile({
        userId: "user_1",
        name: profileName,
        type: profileType,
        icon: "Wallet",
        color: "#7C3AED",
        balance: 0,
        description: "My primary wallet",
        isDefault: true,
        sortOrder: 0
      });
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-primary p-4">
      <div className="w-full max-w-md">
        <BlurFade delay={0} key={`header-${step}`}>
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className={`h-2.5 w-8 rounded-full transition-colors duration-500 ${step >= s.id ? "bg-brand-purple" : "bg-white/[0.08]"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>

        {step === 1 && (
          <BlurFade delay={0.1}>
            <MagicCard className="p-8 text-center border-brand-purple/20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple/10 mb-6">
                <Sparkles className="h-8 w-8 text-brand-purple" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to your Tracker</h2>
              <p className="text-text-muted mb-8">Let's set up your personal finance workspace in just a few quick steps.</p>
              <ShimmerButton className="w-full" onClick={handleNext}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </MagicCard>
          </BlurFade>
        )}

        {step === 2 && (
          <BlurFade delay={0.1}>
            <MagicCard className="p-8">
              <h2 className="text-xl font-bold text-text-primary mb-1">Set your currency</h2>
              <p className="text-sm text-text-muted mb-6">Choose your primary currency for tracking.</p>
              
              <div className="space-y-4 mb-8">
                {CURRENCIES.slice(0, 4).map((c: any) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCurrency === c.code ? "border-brand-purple bg-brand-purple/5" : "border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{c.symbol}</span>
                      <span className="font-medium text-text-primary">{c.name}</span>
                    </div>
                    {selectedCurrency === c.code && <Check className="h-5 w-5 text-brand-purple" />}
                  </button>
                ))}
              </div>
              
              <ShimmerButton className="w-full" onClick={handleNext}>Continue</ShimmerButton>
            </MagicCard>
          </BlurFade>
        )}

        {step === 3 && (
          <BlurFade delay={0.1}>
            <MagicCard className="p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-income/10 mb-4">
                <Wallet className="h-6 w-6 text-income" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1 text-center">Create first profile</h2>
              <p className="text-sm text-text-muted mb-6 text-center">Where do you keep your money?</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm text-text-muted block mb-2">Wallet Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-3 text-text-primary outline-none focus:border-brand-purple"
                  />
                </div>
              </div>
              
              <ShimmerButton className="w-full" onClick={handleNext}>Create Profile</ShimmerButton>
            </MagicCard>
          </BlurFade>
        )}

        {step === 4 && (
          <BlurFade delay={0.1}>
            <MagicCard className="p-8 text-center border-income/20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-income/10 mb-6">
                <Target className="h-8 w-8 text-income" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">You're all set!</h2>
              <p className="text-text-muted mb-8">Your dashboard is ready. Start adding your transactions to track your spending.</p>
              <ShimmerButton className="w-full" onClick={handleNext}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </MagicCard>
          </BlurFade>
        )}
      </div>
    </div>
  );
}
