import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await prisma.profile.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("[GET /api/profiles] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[POST /api/profiles] body:", body);

    const { name, type, icon, color, balance, description } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Profile name is required" }, { status: 400 });
    }

    const existingCount = await prisma.profile.count({
      where: { userId: session.user.id },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type: type ?? "CUSTOM",
        icon: icon ?? "💰",
        color: color ?? "#7C3AED",
        balance: typeof balance === "number" ? balance : parseFloat(balance) || 0,
        description: description ?? null,
        sortOrder: existingCount,
      },
    });

    console.log("[POST /api/profiles] Created:", profile);
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("[POST /api/profiles] Error:", error);
    return NextResponse.json(
      { error: "Failed to create profile", details: String(error) },
      { status: 500 }
    );
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
    if (!id) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.profile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/profiles] Error:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
