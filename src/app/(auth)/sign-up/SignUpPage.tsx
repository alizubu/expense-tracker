"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Wallet, ArrowRight, Loader2,
  Eye, EyeOff, User, Mail, Lock, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── MagicUI imports ─────────────────────────────────────────────────────── */
import { Meteors } from "@/components/magicui/meteors";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Sparkles } from "@/components/magicui/sparkles";

/* ─── Subtle grid background ─────────────────────────────────────────────── */
function GridLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid-su" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-su)" />
    </svg>
  );
}

/* ─── Orbs — violet top-right + pink bottom-left ────────────────────────── */
function Orbs() {
  return (
    <>
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -right-32 h-[460px] w-[460px] rounded-full bg-violet-600/25 blur-[120px]"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.22, 1], opacity: [0.18, 0.36, 0.18] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-pink-600/20 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/15 blur-[80px]"
      />
    </>
  );
}

/* ─── Password strength ──────────────────────────────────────────────────── */
function strengthScore(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  return s as 0 | 1 | 2 | 3;
}
const strengthMeta = [
  { label: "", color: "bg-transparent" },
  { label: "Weak", color: "bg-rose-500" },
  { label: "Fair", color: "bg-amber-400" },
  { label: "Strong", color: "bg-emerald-500" },
] as const;

/* ─── Animation presets ──────────────────────────────────────────────────── */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease, delay } });
const fadeLeft = (delay = 0) => ({ initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.40, ease, delay } });

/* ════════════════════════════════════════════════════════════════════════════
   SIGN-UP PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState<"name" | "email" | "password" | null>(null);

  const strength = strengthScore(password);
  const meta = strengthMeta[strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await registerRes.json();
      if (!registerRes.ok) {
        toast.error(data.error || "Failed to register");
        return;
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        toast.error("Failed to sign in automatically");
      } else {
        toast.success("Account created successfully!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  /* animated underline per focused field */
  const FocusLine = ({ field }: { field: typeof focused }) => (
    <AnimatePresence>
      {focused === field && (
        <motion.div
          key={`line-${field}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-0 left-4 right-4 h-[1.5px] origin-left rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
        />
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080f] flex items-center justify-center p-4">

      {/* ── Backgrounds ─────────────────────────────────────── */}
      <GridLines />
      <Orbs />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Meteors number={14} />
      </div>

      {/* ── Card ────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative z-10 w-full max-w-[420px]">

        {/* outer glow: violet top-right → pink bottom-left */}
        <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-violet-600/35 via-transparent to-pink-600/28 blur-[2px]" />

        <div className="relative rounded-[26px] border border-white/[0.08] bg-[#0f0f1a]/92 px-8 py-8 shadow-2xl backdrop-blur-2xl overflow-hidden">

          {/* BorderBeam — violet → pink (distinct from SignIn's violet → indigo) */}
          <BorderBeam
            size={220}
            duration={10}
            colorFrom="#7c3aed"
            colorTo="#db2777"
            borderWidth={1.2}
          />

          {/* ── Header ─────────────────────────────────────── */}
          <div className="mb-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="relative mb-5"
            >
              {/* gradient: violet → purple → pink */}
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 shadow-[0_0_32px_rgba(124,58,237,0.45)]">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div className="pointer-events-none absolute -inset-3">
                <Sparkles count={6} color="#f0abfc"><span /></Sparkles>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.18)} className="mb-3">
              <AnimatedGradientText className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[11px] font-medium tracking-widest text-pink-300 uppercase">
                Get Started Free
              </AnimatedGradientText>
            </motion.div>

            <motion.h1 {...fadeUp(0.24)} className="text-[24px] font-bold tracking-tight text-white">
              Create an account
            </motion.h1>
            <motion.p {...fadeUp(0.3)} className="mt-1.5 text-[13px] text-slate-500">
              Start tracking your expenses today
            </motion.p>
          </div>

          {/* ── Progress dots (fills as each field is typed) ── */}
          <motion.div {...fadeUp(0.32)} className="mb-6 flex items-center justify-center gap-2">
            {[name, email, password].map((val, i) => (
              <motion.div
                key={i}
                animate={{
                  width: val.length > 0 ? 20 : 6,
                  backgroundColor: val.length > 0 ? "#7c3aed" : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.3 }}
                className="h-[6px] rounded-full"
              />
            ))}
          </motion.div>

          {/* ── Form ───────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <motion.div {...fadeLeft(0.36)}>
              <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="John Doe"
                  className="
                    w-full rounded-xl border bg-white/[0.03] py-3 pl-9 pr-4
                    text-[14px] text-white placeholder:text-slate-600
                    outline-none transition-all duration-200
                    border-white/[0.08]
                    focus:border-violet-500/60 focus:bg-violet-500/[0.04]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
                  "
                />
                <FocusLine field="name" />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div {...fadeLeft(0.42)}>
              <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                  inputMode="email"
                  placeholder="you@example.com"
                  className="
                    w-full rounded-xl border bg-white/[0.03] py-3 pl-9 pr-4
                    text-[14px] text-white placeholder:text-slate-600
                    outline-none transition-all duration-200
                    border-white/[0.08]
                    focus:border-violet-500/60 focus:bg-violet-500/[0.04]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
                  "
                />
                <FocusLine field="email" />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div {...fadeLeft(0.48)}>
              <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-slate-600" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="Min. 8 characters"
                  className="
                    w-full rounded-xl border bg-white/[0.03] py-3 pl-9 pr-11
                    text-[14px] text-white placeholder:text-slate-600
                    outline-none transition-all duration-200
                    border-white/[0.08]
                    focus:border-violet-500/60 focus:bg-violet-500/[0.04]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <FocusLine field="password" />
              </div>

              {/* Strength meter */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2.5 overflow-hidden"
                  >
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${strength >= s ? meta.color : "bg-white/[0.08]"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {strength === 3 && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                      <span className="text-[11px] text-slate-500">
                        {strength > 0 && (
                          <span className={
                            strength === 1 ? "text-rose-400" :
                              strength === 2 ? "text-amber-400" :
                                "text-emerald-400"
                          }>{meta.label} </span>
                        )}
                        {strength < 3 && "Use 8+ chars, uppercase & a number"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Terms */}
            <motion.p {...fadeUp(0.52)} className="text-[11px] leading-relaxed text-slate-600">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-violet-500 transition-colors hover:text-violet-400">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="text-violet-500 transition-colors hover:text-violet-400">Privacy Policy</Link>.
            </motion.p>

            {/* Submit */}
            <motion.div {...fadeUp(0.56)} className="pt-1">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
                type="submit"
                disabled={loading}
                className="
                  group relative w-full overflow-hidden rounded-xl py-3
                  bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600
                  text-[14px] font-semibold text-white
                  shadow-[0_0_24px_rgba(124,58,237,0.35)]
                  hover:shadow-[0_0_38px_rgba(124,58,237,0.55)]
                  disabled:cursor-not-allowed disabled:opacity-50
                  transition-shadow duration-300
                "
              >
                {/* shimmer sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* ── Divider ──────────────────────────────────────── */}
          <motion.div {...fadeUp(0.62)} className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] tracking-widest uppercase text-slate-600">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </motion.div>

          {/* ── Sign in link ──────────────────────────────────── */}
          <motion.p {...fadeUp(0.68)} className="text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-violet-400 underline underline-offset-2 decoration-violet-500/40 hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}