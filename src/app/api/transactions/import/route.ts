import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { getClientIP } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const contentLength = parseInt(req.headers.get("content-length") ?? "0");
    if (contentLength > 5_000_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transactions } = body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify profile ownership for all profiles involved
    const profileIds = [...new Set(transactions.map((t) => t.profileId))];
    const profiles = await prisma.profile.findMany({
      where: { id: { in: profileIds } },
      select: { id: true, userId: true },
    });

    for (const pid of profileIds) {
      const p = profiles.find((prof) => prof.id === pid);
      if (!p || p.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized profile usage" }, { status: 403 });
      }
    }

    // Prepare operations for transaction
    const operations = [];
    const profileBalanceChanges: Record<string, number> = {};

    for (const t of transactions) {
      const parsed = transactionSchema.safeParse(t);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid transaction data", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { profileId, toProfileId, type, amount, category, title, note, date, tags } = parsed.data;

      operations.push(
        prisma.transaction.create({
          data: {
            userId: session.user.id,
            profileId,
            toProfileId: toProfileId ?? null,
            type,
            amount,
            category,
            title: title ?? "Imported Transaction",
            note: note ?? null,
            tags: tags ?? [],
            date: date ? new Date(date) : new Date(),
          },
        })
      );

      // Accumulate balance changes
      if (!profileBalanceChanges[profileId]) profileBalanceChanges[profileId] = 0;
      
      if (type === "INCOME") {
        profileBalanceChanges[profileId] += amount;
      } else if (type === "EXPENSE") {
        profileBalanceChanges[profileId] -= amount;
      } else if (type === "TRANSFER" && toProfileId) {
        if (!profileBalanceChanges[toProfileId]) profileBalanceChanges[toProfileId] = 0;
        profileBalanceChanges[profileId] -= amount;
        profileBalanceChanges[toProfileId] += amount;
      }
    }

    // Update balances
    for (const [pid, change] of Object.entries(profileBalanceChanges)) {
      if (change === 0) continue;
      operations.push(
        prisma.profile.update({
          where: { id: pid },
          data: { balance: { increment: change } },
        })
      );
    }

    await prisma.$transaction(operations);

    await logAudit({
      userId: session.user.id,
      action: "transaction.import",
      resource: `User:${session.user.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      metadata: { count: transactions.length },
    });

    return NextResponse.json({ success: true, count: transactions.length });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
