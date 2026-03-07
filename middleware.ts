// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify<{ isAdmin?: boolean }>(
      token,
      new TextEncoder().encode(secret)
    );

    if (!payload.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };