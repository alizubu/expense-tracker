import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getDbUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getDbUser(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getDbUser(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { name, type, icon, color, balance, description } = body;

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      name,
      type: type ?? "CUSTOM",
      icon: icon ?? "💰",
      color: color ?? "#7C3AED",
      balance: balance ?? 0,
      description,
    },
  });

  return NextResponse.json(profile);
}
