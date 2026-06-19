import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { getClientIP } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
    const parsed = profileSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, type, icon, color, balance, description } = parsed.data;

    const existingCount = await prisma.profile.count({
      where: { userId: session.user.id },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        name,
        type: type ?? "CUSTOM",
        icon: icon ?? "Wallet",
        color: color ?? "#7C3AED",
        balance: balance ?? 0,
        description: description ?? null,
        sortOrder: existingCount,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "profile.create",
      resource: `Profile:${profile.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      metadata: { name, type },
    });

    return NextResponse.json(profile, { status: 201 });
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
    if (!id) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.profile.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "profile.delete",
      resource: `Profile:${profile.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const parsed = profileSchema.partial().safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      userId: session.user.id,
      action: "profile.update",
      resource: `Profile:${profile.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
