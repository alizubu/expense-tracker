"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Wallet, ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ─── MagicUI imports ─────────────────────────────────────────────────────── */
import { Meteors } from "@/components/magicui/meteors";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Sparkles } from "@/components/magicui/sparkles";

/* ─── Custom validation schema ───────────────────────────────────────────── */
const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInInput = z.infer<typeof signInSchema>;

function GridLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" className="text-text-primary" />
    </svg>
  );
}

function Orbs() {
  return (
    <>
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[120px] dark:bg-violet-600/25"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="pointer-events-none absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-[100px] dark:bg-indigo-500/20"
      />
    </>
  );
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease, delay },
});

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const lastSubmit = useRef(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Custom Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: async (data) => {
      const result = signInSchema.safeParse(data);
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

  const onSubmit = async (data: SignInInput) => {
    if (loading || lockoutTimer || blocked) return;

    const now = Date.now();
    if (now - lastSubmit.current < 300) return;
    lastSubmit.current = now;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("Account locked")) {
          setLockoutTimer(15 * 60);
          toast.error("Account locked due to multiple failed attempts. Try again later.");
        } else {
          toast.error("Invalid email or password");
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
        <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-violet-600/30 via-transparent to-indigo-600/20 blur-[1px]" />

        <Card className="relative rounded-[22px] border border-border/80 bg-card/90 px-8 py-8 shadow-2xl backdrop-blur-2xl">
          <BorderBeam
            size={180}
            duration={12}
            colorFrom="var(--accent-color)"
            colorTo="var(--accent-light)"
            borderWidth={1.2}
          />

          {/* Header */}
          <div className="mb-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="relative mb-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/25">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="pointer-events-none absolute -inset-3">
                <Sparkles count={5} color="var(--accent-light)">
                  <span />
                </Sparkles>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="mb-3">
              <AnimatedGradientText className="rounded-full border border-violet-500/20 bg-violet-500/10 dark:bg-violet-500/10 px-3 py-0.5 text-[10px] font-semibold tracking-wider text-violet-600 dark:text-violet-300 uppercase">
                ExpenseTracker
              </AnimatedGradientText>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-2xl font-bold tracking-tight text-text-primary"
            >
              Welcome back
            </motion.h1>
            <motion.p {...fadeUp(0.25)} className="mt-1 text-xs text-text-secondary">
              Sign in to continue to your account
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {lockoutTimer && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center text-xs font-semibold text-red-500">
                Account locked. Try again later.
              </div>
            )}

            {/* Email */}
            <div className="relative">
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
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={loading || blocked}
                error={errors.password?.message}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-text-muted hover:text-text-secondary cursor-pointer focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register("password")}
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={loading}
                disabled={blocked}
                className="w-full font-semibold"
              >
                {blocked ? `Try again in ${cooldown}s` : "Sign In"}
                {!loading && !blocked && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-text-muted tracking-wider uppercase font-semibold">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-xs text-text-secondary">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-accent hover:text-brand-purple-light transition-colors underline underline-offset-2 decoration-accent/40"
            >
              Create one free
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}