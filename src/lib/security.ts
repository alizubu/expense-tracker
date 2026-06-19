export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
}

export function sanitizeString(input: string, maxLength = 200): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"]/g, "");
}

export function isStrongPassword(password: string): boolean {
  return /^(?=.*[A-Z])(?=.*[0-9!@#$%^&*]).{8,128}$/.test(password);
}

export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function timingSafeCompare(a: string, b: string): boolean {
  // Prevent timing attacks on string comparison
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function maskEmail(email: string): string {
  // For logs: show only first 2 chars + domain
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

export function isValidCUID(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}
