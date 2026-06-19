import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "./audit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh every 24h
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const forwarded = req.headers?.["x-forwarded-for"];
        const ip =
          (typeof forwarded === "string"
            ? forwarded.split(",")[0].trim()
            : undefined) || "127.0.0.1";
        const userAgent = (req.headers?.["user-agent"] as string) || "unknown";

        // Check account lockout
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const attemptsCount = await prisma.failedAttempt.count({
          where: {
            email: credentials.email,
            createdAt: { gte: fifteenMinsAgo },
          },
        });

        if (attemptsCount >= 5) {
          throw new Error("Account locked. Try again in 15 minutes.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          await prisma.failedAttempt.create({
            data: { email: credentials.email, ip },
          });
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          await prisma.failedAttempt.create({
            data: { email: credentials.email, ip },
          });
          await logAudit({
            userId: user.id,
            action: "user.login_failed",
            resource: "Session",
            ipAddress: ip,
            userAgent,
          });
          throw new Error("Invalid credentials");
        }

        // On success
        await prisma.failedAttempt.deleteMany({
          where: { email: credentials.email },
        });

        await logAudit({
          userId: user.id,
          action: "user.login",
          resource: "Session",
          ipAddress: ip,
          userAgent,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      }
      return token;
    },
  },
};
