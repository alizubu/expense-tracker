import { prisma } from "./prisma";

export async function logAudit({
  userId,
  action,
  resource,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  metadata?: object;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch (error) {
    console.error("[AuditLog Error]", error);
  }
}
