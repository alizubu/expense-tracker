"use client";
import { TypographyLabel, TypographySpan, TypographyH1, TypographyP } from "@/components/ui/typography";

import { signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
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

function GridBackground() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute top-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20 opacity-40"></div>
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[100px]"></div>
    </div>
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
  { label: "Weak", color: "bg-destructive" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Strong", color: "bg-primary" },
] as const;

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
      if (result.success) return { values: result.data, errors: {} };
      const formErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) formErrors[err.path[0]] = { type: err.code, message: err.message };
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
          <TypographyH1 className="text-2xl font-semibold tracking-tight text-foreground">Create an account</TypographyH1>
          <TypographyP className="mt-2 text-sm text-muted-foreground">
            Start tracking your expenses today
          </TypographyP>
        </div>

        <Card className="p-6 glass border-border/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 relative">
              <TypographyLabel className="text-sm font-medium text-foreground">Full Name</TypographyLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="John Doe"
                  disabled={loading || blocked}
                  className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary"
                  {...register("name")}
                />
              </div>
              {errors.name && <TypographyP className="text-xs text-destructive mt-1">{errors.name.message}</TypographyP>}
            </div>

            <div className="space-y-2 relative">
              <TypographyLabel className="text-sm font-medium text-foreground">Email</TypographyLabel>
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
              {errors.email && <TypographyP className="text-xs text-destructive mt-1">{errors.email.message}</TypographyP>}
            </div>

            <div className="space-y-2 relative">
              <TypographyLabel className="text-sm font-medium text-foreground">Password</TypographyLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  disabled={loading || blocked}
                  className="pl-9 pr-9 bg-background/50 border-border/50 focus-visible:ring-primary"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <TypographyP className="text-xs text-destructive mt-1">{errors.password.message}</TypographyP>}

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
                            strength >= s ? meta.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {strength === 3 && <CheckCircle2 className="h-3 w-3 text-primary" />}
                      <TypographySpan className="text-[10px] text-muted-foreground">
                        {strength > 0 && (
                          <TypographySpan
                            className={
                              strength === 1
                                ? "text-destructive font-medium"
                                : strength === 2
                                ? "text-amber-500 font-medium"
                                : "text-primary font-medium"
                            }
                          >
                            {meta.label}{" "}
                          </TypographySpan>
                        )}
                        {strength < 3 && "Use 8+ chars, uppercase & a number"}
                      </TypographySpan>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <TypographyP className="text-[10px] leading-relaxed text-muted-foreground select-none">
              By creating an account you agree to our{" "}
              <Link href="#" className="font-medium text-foreground hover:underline transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-foreground hover:underline transition-colors">
                Privacy Policy
              </Link>
              .
            </TypographyP>

            <Button
              type="submit"
              disabled={loading || blocked}
              className="w-full mt-2"
            >
              {loading ? "Creating..." : blocked ? `Try again in ${cooldown}s` : "Create Account"}
              {!loading && !blocked && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <TypographySpan>Already have an account?</TypographySpan>
            <Link
              href="/sign-in"
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}