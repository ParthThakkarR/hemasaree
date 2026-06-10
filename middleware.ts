import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/api/auth",
  "/api/products",
  "/api/categories",
  "/api/reviews",
  "/api/site-settings",
  "/api/newsletter",
  "/api/send-otp",
  "/api/verify-otp",
  "/api/signup",
  "/api/verify",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/test",
  "/api/health",
  "/api/search",
  "/api/uploads",
];

// ─── Edge-compatible rate limiter (sliding window) ─────────────────────────
// Works in Next.js Edge Runtime without Redis dependency.
// In-memory store is per-island; acceptable for single-instance or short-lived
// rate-limit windows. For multi-instance, use Nginx rate limiting (nginx.conf).

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10); // 1 min

// Different limits per route category
const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  auth:     { max: 10,  window: 60000 },      // 10 req/min for auth routes
  otp:      { max: 3,   window: 60000 },       // 3 req/min for OTP
  search:   { max: 30,  window: 60000 },       // 30 req/min for search
  write:    { max: 20,  window: 60000 },       // 20 req/min for mutations
  read:     { max: 100, window: 60000 },       // 100 req/min for reads
  admin:    { max: 200, window: 60000 },       // 200 req/min for admin (trusted)
  health:   { max: 0,   window: 0 },           // no limit for health checks
};

function getRateLimitConfig(pathname: string): { max: number; window: number } {
  if (pathname.startsWith("/api/health") || pathname.startsWith("/api/test")) {
    return RATE_LIMITS.health;
  }
  if (pathname.startsWith("/api/admin")) {
    return RATE_LIMITS.admin;
  }
  if (pathname.match(/\/api\/(send-otp|verify-otp|forgot-password|reset-password)/)) {
    return RATE_LIMITS.otp;
  }
  if (pathname.match(/\/api\/(auth|signup|verify)/)) {
    return RATE_LIMITS.auth;
  }
  if (pathname.startsWith("/api/search")) {
    return RATE_LIMITS.search;
  }
  // Check if it's a write operation (POST/PUT/PATCH/DELETE handled at app level)
  // For middleware, we classify by path pattern
  if (pathname.match(/\/api\/(cart|checkout|wishlist|reviews|newsletter)/)) {
    return RATE_LIMITS.write;
  }
  return RATE_LIMITS.read;
}

function checkRateLimit(key: string, max: number, window: number): { success: boolean; remaining: number } {
  if (max === 0) return { success: true, remaining: Infinity }; // no limit

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + window });
    return { success: true, remaining: max - 1 };
  }

  entry.count++;

  // Periodic cleanup to prevent memory leak
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (entry.count > max) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: max - entry.count };
}

// ─── Middleware ─────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  const isPublic = publicPaths.some(path => pathname.startsWith(path));
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/studio");

  // ── Rate limiting for all API routes ───────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const { max, window } = getRateLimitConfig(pathname);
    const rateLimitKey = `rl:${ip}:${pathname}`;

    const { success, remaining } = checkRateLimit(rateLimitKey, max, window);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": Math.ceil(window / 1000).toString(),
          },
        }
      );
    }

    // Continue to auth check, then add rate limit headers to response
    if (isPublic && !isAdminRoute) {
      const response = NextResponse.next();
      if (!pathname.startsWith("/studio")) {
        setSecurityHeaders(response);
      }
      response.headers.set("X-RateLimit-Limit", max.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      return response;
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (isAdminRoute) {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      const response = NextResponse.next();
      if (!pathname.startsWith("/studio")) {
        setSecurityHeaders(response);
      }
      response.headers.set("X-RateLimit-Limit", RATE_LIMITS.admin.max.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      return response;
    }

    if (!isPublic && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.next();
    setSecurityHeaders(response);
    response.headers.set("X-RateLimit-Limit", max.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  // ── Non-API routes (pages) ────────────────────────────────────────────
  if (isPublic && !isAdminRoute) {
    const response = NextResponse.next();
    if (!pathname.startsWith("/studio")) {
      setSecurityHeaders(response);
    }
    return response;
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isAdminRoute) {
    if (!token?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    const response = NextResponse.next();
    if (!pathname.startsWith("/studio")) {
      setSecurityHeaders(response);
    }
    return response;
  }

  if (!isPublic && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.next();
  setSecurityHeaders(response);
  return response;
}

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains; preload');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.razorpay.com https://*.sanity.io",
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*", "/api/:path*"],
};
