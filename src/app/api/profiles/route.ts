import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, type, icon, color, balance, description } = body;

  try {
    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        name,
        type: type ?? "CUSTOM",
        icon: icon ?? "💰",
        color: color ?? "#7C3AED",
        balance: balance ?? 0,
        description,
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Failed to create profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
