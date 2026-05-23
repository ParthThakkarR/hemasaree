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

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  const isPublic = publicPaths.some(path => pathname.startsWith(path));
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/studio");

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
  response.headers.set('X-DNS-Prefetch-Control', 'off');
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
