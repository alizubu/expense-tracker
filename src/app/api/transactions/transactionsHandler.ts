import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");
  const type = searchParams.get("type");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: any = { userId: session.user.id };
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
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { profileId, toProfileId, type, amount, category, title, note, date } = body;

  // Create transaction
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
      date: date ? new Date(date) : new Date(),
    },
  });

  // Update profile balance
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

  return NextResponse.json(transaction);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  // Get transaction first to reverse balance
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify ownership
  if (transaction.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reverse the balance effect
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

  await prisma.transaction.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
