import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = { id: session.user.id };

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");
    
    // Use validation
    let month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
    let year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    if (isNaN(month) || month < 1 || month > 12) month = new Date().getMonth() + 1;
    if (isNaN(year) || year < 2000 || year > 2100) year = new Date().getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [profiles, monthTransactions, recentTransactions] = await Promise.all([
      prisma.profile.findMany({
        where: { userId: user.id },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: start, lte: end }, isDeleted: false },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id, isDeleted: false },
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
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
