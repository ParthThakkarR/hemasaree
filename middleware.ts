
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const verifyUrl = new URL("/api/verify", req.url);

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    // This log shows what the middleware received.
    console.log("✅ [MIDDLEWARE] Received from API:", data);

    if (!data.isAdmin) {
      console.log("❌ [MIDDLEWARE] Access Denied. Redirecting non-admin.");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("✅ [MIDDLEWARE] Admin access granted.");
    return NextResponse.next();

  } catch (error) {
    console.error("❌ [MIDDLEWARE] Error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};