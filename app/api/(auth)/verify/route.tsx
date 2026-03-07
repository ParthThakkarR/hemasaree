// api/(auth)/verify/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

interface UserJWTPayload {
  id?: string;
  email?: string;
  isAdmin?: boolean;
}

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return NextResponse.json(
      { isAuthenticated: false, isAdmin: false },
      { status: 500 }
    );
  }

  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, isAdmin: false }, { status: 401 });
    }

    const { payload } = await jwtVerify<UserJWTPayload>(
      token,
      new TextEncoder().encode(secret)
    );

    const result = {
      isAuthenticated: true,
      isAdmin: Boolean(payload.isAdmin),
    };
    return NextResponse.json(result);

  } catch {
    return NextResponse.json({ isAuthenticated: false, isAdmin: false }, { status: 401 });
  }
}