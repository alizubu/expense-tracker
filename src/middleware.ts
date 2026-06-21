import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rate-limit";

const BLOCKED_PATHS = [
  "/.env", "/.git", "/wp-admin", "/wp-login.php",
  "/phpmyadmin", "/admin.php", "/xmlrpc.php",
  "/config.php", "/backup", "/.htaccess",
  "/shell.php", "/eval.php", "/.DS_Store",
];

const KNOWN_BOTS = ["curl", "wget", "python-requests", "scrapy", "httpclient"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Suspicious Path Blocking
  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 2. Bot Detection
  const ua = request.headers.get("user-agent") ?? "";
  if (KNOWN_BOTS.some((b) => ua.toLowerCase().includes(b))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3. Rate Limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.ip ||
    "127.0.0.1";
    
  let tier: "auth" | "api" | "dashboard" = "dashboard";
  if (pathname.startsWith("/api/auth") || pathname === "/api/register") {
    tier = "auth";
  } else if (pathname.startsWith("/api/")) {
    tier = "api";
  }

  const limitResult = rateLimit(ip, tier);
  if (!limitResult.success) {
    if (tier === "auth") {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "900",
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // 4. Route Protection
  const token = await getToken({ req: request });
  const isAuthRoute = pathname.startsWith("/api/auth") || pathname === "/api/register";
  const isPublicRoute =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    isAuthRoute;

  if (
    !token &&
    !isPublicRoute &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/favicon.ico")
  ) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(signInUrl);
  }

  if (token && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. Nonce Generation
  const nonce = Buffer.from(uuidv4()).toString("base64");

  // 6. Content Security Policy with Nonce
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-RateLimit-Limit", limitResult.limit.toString());
  response.headers.set("X-RateLimit-Remaining", limitResult.remaining.toString());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|images|assets|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
