"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Wallet, ArrowRight, Eye, EyeOff, User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ─── MagicUI imports ─────────────────────────────────────────────────────── */
import { Meteors } from "@/components/magicui/meteors";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Sparkles } from "@/components/magicui/sparkles";

/* ─── Custom validation schema ───────────────────────────────────────────── */
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9!@#$%^&*]/, "Password must contain at least one number or special character"),
});

type SignUpInput = z.infer<typeof signUpSchema>;

function GridLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid-su" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-su)" className="text-text-primary" />
    </svg>
  );
}

function Orbs() {
  return (
    <>
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -right-32 h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-[120px] dark:bg-violet-600/25"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.22, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-pink-600/15 blur-[100px] dark:bg-pink-600/20"
      />
    </>
  );
}

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

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease, delay },
});

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const lastSubmit = useRef(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: async (data) => {
      const result = signUpSchema.safeParse(data);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      const formErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          formErrors[err.path[0]] = {
            type: err.code,
            message: err.message,
          };
        }
      });
      return { values: {}, errors: formErrors };
    },
  });

  const passwordValue = watch("password", "");
  const strength = strengthScore(passwordValue);
  const meta = strengthMeta[strength];

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

  const onSubmit = async (data: SignUpInput) => {
    if (loading || blocked) return;

    const now = Date.now();
    if (now - lastSubmit.current < 300) return;
    lastSubmit.current = now;

    setLoading(true);
    try {
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const resData = await registerRes.json();
      if (!registerRes.ok) {
        toast.error(resData.error || "Failed to register");
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          setBlocked(true);
          setCooldown(60);
          toast.error("Too many failed attempts. Please wait 60 seconds.");
        }
        return;
      }

      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

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
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-page flex items-center justify-center p-4">
      <GridLines />
      <Orbs />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Meteors number={12} />
      </div>

      <motion.div {...fadeUp(0)} className="relative z-10 w-full max-w-[440px]">
        {/* Glow border ring */}
        <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-violet-600/30 via-transparent to-pink-600/20 blur-[1px]" />

        <Card className="relative rounded-[22px] border border-border/80 bg-card/90 px-8 py-8 shadow-2xl backdrop-blur-2xl">
          <BorderBeam
            size={180}
            duration={12}
            colorFrom="var(--accent-color)"
            colorTo="#db2777"
            borderWidth={1.2}
          />

          {/* Header */}
          <div className="mb-5 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="relative mb-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 shadow-lg shadow-violet-500/25">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="pointer-events-none absolute -inset-3">
                <Sparkles count={5} color="#f0abfc">
                  <span />
                </Sparkles>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="mb-3">
              <AnimatedGradientText className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-0.5 text-[10px] font-semibold tracking-wider text-pink-600 dark:text-pink-300 uppercase animate-pulse">
                Get Started Free
              </AnimatedGradientText>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-2xl font-bold tracking-tight text-text-primary"
            >
              Create an account
            </motion.h1>
            <motion.p {...fadeUp(0.25)} className="mt-1 text-xs text-text-secondary">
              Start tracking your expenses today
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <Input
                label="Full Name"
                placeholder="John Doe"
                disabled={loading || blocked}
                error={errors.name?.message}
                leftIcon={<User className="h-4 w-4" />}
                {...register("name")}
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                disabled={loading || blocked}
                error={errors.email?.message}
                leftIcon={<Mail className="h-4 w-4" />}
                {...register("email")}
              />
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Min. 8 characters"
                disabled={loading || blocked}
                error={errors.password?.message}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-text-muted hover:text-text-secondary cursor-pointer focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register("password")}
              />

              {/* Password strength indicators */}
              <AnimatePresence>
                {passwordValue.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2"
                  >
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            strength >= s ? meta.color : "bg-white/[0.08]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {strength === 3 && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                      <span className="text-[10px] text-text-muted">
                        {strength > 0 && (
                          <span
                            className={
                              strength === 1
                                ? "text-rose-400 font-semibold"
                                : strength === 2
                                ? "text-amber-400 font-semibold"
                                : "text-emerald-400 font-semibold"
                            }
                          >
                            {meta.label}{" "}
                          </span>
                        )}
                        {strength < 3 && "Use 8+ chars, uppercase & a number"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Terms */}
            <p className="text-[10px] leading-relaxed text-text-muted select-none">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-accent font-medium hover:text-brand-purple-light transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-accent font-medium hover:text-brand-purple-light transition-colors">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Submit */}
            <div className="pt-1">
              <Button
                type="submit"
                isLoading={loading}
                disabled={blocked}
                className="w-full font-semibold"
              >
                {blocked ? `Try again in ${cooldown}s` : "Create Account"}
                {!loading && !blocked && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] tracking-wider uppercase font-semibold text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-xs text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-accent hover:text-brand-purple-light transition-colors underline underline-offset-2 decoration-accent/40"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}