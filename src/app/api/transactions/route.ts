import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { getClientIP } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const trash = searchParams.get("trash") === "true";

    const where: any = { userId: session.user.id, isDeleted: trash };
    if (profileId) where.profileId = profileId;
    if (type) where.type = type;
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        profile: true,
        toProfile: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = parseInt(req.headers.get("content-length") ?? "0");
    if (contentLength > 1_000_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { profileId, toProfileId, type, amount, category, title, note, date, tags } = parsed.data;

    // Verify profile ownership
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });
    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        profileId,
        toProfileId: toProfileId ?? null,
        type,
        amount,
        category,
        title,
        note: note ?? null,
        tags: tags ?? [],
        date: date ? new Date(date) : new Date(),
      },
    });

    if (type === "INCOME") {
      await prisma.profile.update({
        where: { id: profileId },
        data: { balance: { increment: amount } },
      });
    } else if (type === "EXPENSE") {
      await prisma.profile.update({
        where: { id: profileId },
        data: { balance: { decrement: amount } },
      });
    } else if (type === "TRANSFER" && toProfileId) {
      await prisma.profile.update({
        where: { id: profileId },
        data: { balance: { decrement: amount } },
      });
      await prisma.profile.update({
        where: { id: toProfileId },
        data: { balance: { increment: amount } },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: "transaction.create",
      resource: `Transaction:${transaction.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      metadata: { amount, type },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (transaction.type === "INCOME") {
      await prisma.profile.update({
        where: { id: transaction.profileId },
        data: { balance: { decrement: transaction.amount } },
      });
    } else if (transaction.type === "EXPENSE") {
      await prisma.profile.update({
        where: { id: transaction.profileId },
        data: { balance: { increment: transaction.amount } },
      });
    } else if (transaction.type === "TRANSFER" && transaction.toProfileId) {
      await prisma.profile.update({
        where: { id: transaction.profileId },
        data: { balance: { increment: transaction.amount } },
      });
      await prisma.profile.update({
        where: { id: transaction.toProfileId },
        data: { balance: { decrement: transaction.amount } },
      });
    }

    await prisma.transaction.update({ where: { id }, data: { isDeleted: true } });

    await logAudit({
      userId: session.user.id,
      action: "transaction.delete",
      resource: `Transaction:${transaction.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const contentLength = parseInt(req.headers.get("content-length") ?? "0");
    if (contentLength > 1_000_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const oldTxn = await prisma.transaction.findUnique({ where: { id } });
    if (!oldTxn || oldTxn.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Handle Restore
    if (data.isDeleted === false && oldTxn.isDeleted === true) {
      if (oldTxn.type === "INCOME") {
        await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { increment: oldTxn.amount } } });
      } else if (oldTxn.type === "EXPENSE") {
        await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { decrement: oldTxn.amount } } });
      } else if (oldTxn.type === "TRANSFER" && oldTxn.toProfileId) {
        await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { decrement: oldTxn.amount } } });
        await prisma.profile.update({ where: { id: oldTxn.toProfileId }, data: { balance: { increment: oldTxn.amount } } });
      }
      const updated = await prisma.transaction.update({ where: { id }, data: { isDeleted: false } });

      await logAudit({
        userId: session.user.id,
        action: "transaction.restore",
        resource: `Transaction:${updated.id}`,
        ipAddress: getClientIP(req),
        userAgent: req.headers.get("user-agent") ?? "unknown",
      });

      return NextResponse.json(updated);
    }

    // Parse with Zod for edit
    const parsed = transactionSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const validData = parsed.data;

    // Verify profile ownership if changed
    if (validData.profileId && validData.profileId !== oldTxn.profileId) {
      const p = await prisma.profile.findUnique({ where: { id: validData.profileId }, select: { userId: true } });
      if (!p || p.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!oldTxn.isDeleted && (validData.amount !== undefined || validData.type !== undefined || validData.profileId !== undefined)) {
      if (oldTxn.type === "INCOME") {
        await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { decrement: oldTxn.amount } } });
      } else if (oldTxn.type === "EXPENSE") {
        await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { increment: oldTxn.amount } } });
      } else if (oldTxn.type === "TRANSFER" && oldTxn.toProfileId) {
        await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { increment: oldTxn.amount } } });
        await prisma.profile.update({ where: { id: oldTxn.toProfileId }, data: { balance: { decrement: oldTxn.amount } } });
      }

      const newType = validData.type ?? oldTxn.type;
      const newAmount = validData.amount ?? oldTxn.amount;
      const newProfileId = validData.profileId ?? oldTxn.profileId;
      const newToProfileId = validData.toProfileId !== undefined ? validData.toProfileId : oldTxn.toProfileId;

      if (newType === "INCOME") {
        await prisma.profile.update({ where: { id: newProfileId }, data: { balance: { increment: newAmount } } });
      } else if (newType === "EXPENSE") {
        await prisma.profile.update({ where: { id: newProfileId }, data: { balance: { decrement: newAmount } } });
      } else if (newType === "TRANSFER" && newToProfileId) {
        await prisma.profile.update({ where: { id: newProfileId }, data: { balance: { decrement: newAmount } } });
        await prisma.profile.update({ where: { id: newToProfileId }, data: { balance: { increment: newAmount } } });
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...validData,
        date: validData.date ? new Date(validData.date) : undefined,
      }
    });

    await logAudit({
      userId: session.user.id,
      action: "transaction.update",
      resource: `Transaction:${updated.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
