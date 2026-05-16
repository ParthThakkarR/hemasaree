import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAdmin = req.nextauth.token?.isAdmin;
    
    // Protect admin + studio routes
    if ((req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/studio")) && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const response = NextResponse.next();

    // Skip restrictive CSP for Sanity Studio — it needs full API access
    if (!req.nextUrl.pathname.startsWith("/studio")) {
      // Security Headers
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

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public API routes that unauthenticated users MUST access
        const publicPaths = [
          "/api/auth",           // NextAuth signin/signout/session/csrf
          "/api/products",       // Product listings (public storefront)
          "/api/categories",     // Category listings
          "/api/reviews",        // Customer reviews (public GET)
          "/api/site-settings",  // Sanity CMS site settings (public)
          "/api/newsletter",     // Newsletter subscription
          "/api/send-otp",       // Signup: step 1 (send verification code)
          "/api/verify-otp",     // Signup: step 2 (verify code)
          "/api/signup",         // Signup: step 3 (create account)
          "/api/verify",         // Email verification
          "/api/forgot-password",// Password reset: request
          "/api/reset-password", // Password reset: confirm
          "/api/test",           // Health check
          "/api/health",         // Health check
        ];

        const isPublic = publicPaths.some(path => pathname.startsWith(path));
        if (isPublic) return true;

        // All other API routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*", "/api/:path*"],
};
