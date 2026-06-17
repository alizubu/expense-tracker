import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({
    netBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    savingsRate: 0,
    profiles: [],
    recentTransactions: [],
  });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [profiles, monthTransactions, recentTransactions] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { profile: true, toProfile: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const netBalance = profiles.reduce((sum, p) => sum + p.balance, 0);
  const totalIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    : 0;

  return NextResponse.json({
    netBalance,
    totalIncome,
    totalExpense,
    savingsRate,
    profiles,
    recentTransactions,
  });
}
