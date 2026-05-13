import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAdmin = req.nextauth.token?.isAdmin;
    
    // Protect admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const response = NextResponse.next();

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com; frame-src 'self' https://api.razorpay.com;");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't need auth
        const publicPaths = ["/api/auth", "/api/products", "/api/categories", "/api/newsletter"];
        const isPublic = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
        
        if (isPublic) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
