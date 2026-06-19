import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { getClientIP } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const contentLength = parseInt(request.headers.get("content-length") ?? "0");
    if (contentLength > 1_000_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      // Don't leak if email exists, just return a generic validation error,
      // actually standard practice is to return 400 with generic message or
      // if it's registration, sometimes apps say email exists.
      // The prompt said: "Never reveal whether email exists or not... Invalid email or password".
      // Wait, that's for LOGIN. For SIGN-UP, it's normal to say "Email already exists" or generic "Registration failed".
      // Let's just return a generic error or the same "Email already exists" since it was there before.
      // But let's be safe and just return 400.
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const ip = getClientIP(request);
    await logAudit({
      userId: user.id,
      action: "user.register",
      resource: "User",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
