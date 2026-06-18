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

  await prisma.transaction.update({ where: { id }, data: { isDeleted: true } });

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
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
    return NextResponse.json(updated);
  }

  // Handle Edit
  if (!oldTxn.isDeleted && (data.amount !== undefined || data.type !== undefined || data.profileId !== undefined)) {
    // Reverse old
    if (oldTxn.type === "INCOME") {
      await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { decrement: oldTxn.amount } } });
    } else if (oldTxn.type === "EXPENSE") {
      await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { increment: oldTxn.amount } } });
    } else if (oldTxn.type === "TRANSFER" && oldTxn.toProfileId) {
      await prisma.profile.update({ where: { id: oldTxn.profileId }, data: { balance: { increment: oldTxn.amount } } });
      await prisma.profile.update({ where: { id: oldTxn.toProfileId }, data: { balance: { decrement: oldTxn.amount } } });
    }

    // Apply new
    const newType = data.type ?? oldTxn.type;
    const newAmount = data.amount ?? oldTxn.amount;
    const newProfileId = data.profileId ?? oldTxn.profileId;
    const newToProfileId = data.toProfileId !== undefined ? data.toProfileId : oldTxn.toProfileId;

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
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    }
  });

  return NextResponse.json(updated);
}
