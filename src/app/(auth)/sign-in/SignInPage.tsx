"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Wallet, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── MagicUI imports ─────────────────────────────────────────────────────── */
import { Meteors } from "@/components/magicui/meteors";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Sparkles } from "@/components/magicui/sparkles";

/* ─── Tiny shimmer-line component (inline, no extra file needed) ─────────── */
function GridLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

/* ─── Floating orb blobs ─────────────────────────────────────────────────── */
function Orbs() {
  return (
    <>
      {/* top-left purple */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-600/25 blur-[120px]"
      />
      {/* bottom-right indigo */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="pointer-events-none absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[100px]"
      />
      {/* center accent */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/15 blur-[80px]"
      />
    </>
  );
}

/* ─── Stagger helpers ────────────────────────────────────────────────────── */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease, delay },
});

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease, delay },
});

/* ════════════════════════════════════════════════════════════════════════════
   SIGN-IN PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const lastSubmit = useRef(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (blocked && cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    } else if (blocked && cooldown === 0) {
      setBlocked(false);
      setAttempts(0);
    }
    return () => clearTimeout(timer);
  }, [blocked, cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || lockoutTimer || blocked) return;

    const now = Date.now();
    if (now - lastSubmit.current < 300) return;
    lastSubmit.current = now;
    
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        if (res.error.includes("Account locked")) {
          setLockoutTimer(15 * 60); // 15 mins
          toast.error("Account locked due to multiple failed attempts. Try again later.");
        } else {
          toast.error("Invalid email or password"); // Sanitized error
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= 5) {
            setBlocked(true);
            setCooldown(60);
            toast.error("Too many failed attempts. Please wait 60 seconds.");
          }
        }
      } else {
        toast.success("Signed in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred during sign in");
    } finally {
      // Small throttle/debounce
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080f] flex items-center justify-center p-4">

      {/* ── Background layers ─────────────────────────────────────── */}
      <GridLines />
      <Orbs />

      {/* MagicUI meteors — subtle, not overwhelming */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Meteors number={14} />
      </div>

      {/* ── Card ─────────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0)}
        className="relative z-10 w-full max-w-[460px]"
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-violet-600/40 via-transparent to-indigo-600/30 blur-[2px]" />

        {/* Card body */}
        <div className="relative rounded-[26px] border border-white/[0.08] bg-[#0f0f1a]/90 px-8 py-7 shadow-2xl backdrop-blur-2xl">

          {/* BorderBeam — MagicUI animated conic border */}
          <BorderBeam
            size={220}
            duration={10}
            colorFrom="#7c3aed"
            colorTo="#4f46e5"
            borderWidth={1.2}
          />

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="mb-6 flex flex-col items-center">
            {/* Logo icon with Sparkles */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="relative mb-4"
            >
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-[0_0_32px_rgba(124,58,237,0.45)]">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              {/* Sparkles around the logo */}
              <div className="pointer-events-none absolute -inset-3">
                <Sparkles
                  count={6}
                  color="#a78bfa"
                >
                  <span />
                </Sparkles>
              </div>
            </motion.div>

            {/* Animated gradient badge */}
            <motion.div {...fadeUp(0.18)} className="mb-3">
              <AnimatedGradientText className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium tracking-widest text-violet-300 uppercase">
                ExpenseTracker
              </AnimatedGradientText>
            </motion.div>

            <motion.h1
              {...fadeUp(0.24)}
              className="text-[26px] font-bold tracking-tight text-white"
            >
              Welcome back
            </motion.h1>
            <motion.p {...fadeUp(0.3)} className="mt-1.5 text-[13px] text-slate-500">
              Sign in to continue to your account
            </motion.p>
          </div>

          {/* ── Form ────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {lockoutTimer && (
              <motion.div {...fadeUp(0)} className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
                Account locked. Try again later.
              </motion.div>
            )}

            {/* Email */}
            <motion.div {...fadeLeft(0.36)}>
              <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-slate-400">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading || blocked}
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="
                    w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-[14px] text-white
                    placeholder:text-slate-600 outline-none transition-all duration-200
                    border-white/[0.08]
                    focus:border-violet-500/60 focus:bg-violet-500/[0.04]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
                  "
                />
                {/* animated underline when focused */}
                <AnimatePresence>
                  {focusedField === "email" && (
                    <motion.div
                      key="email-line"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute bottom-0 left-4 right-4 h-[1.5px] origin-left rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div {...fadeLeft(0.42)}>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[12px] font-medium uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] text-violet-400 transition-colors hover:text-violet-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading || blocked}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="
                    w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 pr-11 text-[14px] text-white
                    placeholder:text-slate-600 outline-none transition-all duration-200
                    border-white/[0.08]
                    focus:border-violet-500/60 focus:bg-violet-500/[0.04]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
                  "
                />
                {/* show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {focusedField === "password" && (
                    <motion.div
                      key="pw-line"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute bottom-0 left-4 right-4 h-[1.5px] origin-left rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div {...fadeUp(0.5)} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
                type="submit"
                disabled={loading}
                className="
                  group relative w-full overflow-hidden rounded-xl py-2.5
                  bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600
                  text-[14px] font-semibold text-white
                  shadow-[0_0_24px_rgba(124,58,237,0.35)]
                  hover:shadow-[0_0_36px_rgba(124,58,237,0.55)]
                  disabled:cursor-not-allowed disabled:opacity-50
                  transition-shadow duration-300
                "
              >
                {/* shimmer sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : blocked ? (
                    `Try again in ${cooldown}s`
                  ) : (
                    <>
                      Sign In
                      <motion.span
                        initial={false}
                        className="inline-flex"
                        animate={{ x: 0, opacity: 1 }}
                      >
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* ── Divider ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.56)} className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] text-slate-600 tracking-widest uppercase">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </motion.div>

          {/* ── Sign up link ─────────────────────────────────────── */}
          <motion.p {...fadeUp(0.62)} className="text-center text-[13px] text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-violet-400 transition-colors hover:text-violet-300 underline underline-offset-2 decoration-violet-500/40"
            >
              Create one free
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}