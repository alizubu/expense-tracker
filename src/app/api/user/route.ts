import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getClientIP } from "@/lib/security";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  currency: z.string().length(3).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
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
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, currency } = parsed.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(currency && { currency }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        createdAt: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "user.update",
      resource: `User:${session.user.id}`,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      metadata: { name, currency },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
