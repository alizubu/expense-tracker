"use client";

import { signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
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

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInInput = z.infer<typeof signInSchema>;

function GridBackground() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute top-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20 opacity-40"></div>
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[100px]"></div>
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const lastSubmit = useRef(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: async (data) => {
      const result = signInSchema.safeParse(data);
      if (result.success) return { values: result.data, errors: {} };
      const formErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) formErrors[err.path[0]] = { type: err.code, message: err.message };
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
    <div className="relative min-h-screen flex items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground">
      <GridBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg mb-4">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <Card className="p-6 glass border-border/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {lockoutTimer && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-center text-xs font-medium text-destructive">
                Account locked. Try again later.
              </div>
            )}

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  disabled={loading || blocked}
                  className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={loading || blocked}
                  className="pl-9 pr-9 bg-background/50 border-border/50 focus-visible:ring-primary"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading || blocked}
              className="w-full mt-2"
            >
              {loading ? "Signing in..." : blocked ? `Try again in ${cooldown}s` : "Sign In"}
              {!loading && !blocked && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Don't have an account?</span>
            <Link
              href="/sign-up"
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}