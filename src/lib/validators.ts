import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive().max(999_999_999),
  title: z.string().min(1).max(100).trim(),
  category: z.string().min(1).max(50),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  date: z.string().datetime(),
  note: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  profileId: z.string().length(24),
  toProfileId: z.string().length(24).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  type: z.string().min(1).max(30),
  icon: z.string().optional(),
  color: z.string().optional(),
  balance: z.number().optional(),
  description: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().max(100).toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[A-Z])(?=.*[0-9!@#$%^&*])/, {
      message: "Password must contain uppercase and number/symbol",
    }),
});
