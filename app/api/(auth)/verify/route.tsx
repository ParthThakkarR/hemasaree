// api/(auth)/verify/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const dynamic = "force-dynamic";

interface UserJWTPayload { /* ... */ }

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET; /* ... */

  try {
    const authHeader = req.headers.get('Authorization');
    // --- ADD LOG ---
    console.log(`[VERIFY API] Received Authorization header: ${authHeader ? 'Yes' : 'No'}`);
    // -------------
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.log("❌ [VERIFY API] No token found in header.");
      return NextResponse.json({ isAuthenticated: false, isAdmin: false }, { status: 401 });
    }

    // --- ADD LOG ---
    console.log(`[VERIFY API] Attempting to verify token (first 10 chars): ${token.substring(0, 10)}...`);
    // -------------

    const { payload } = await jwtVerify<UserJWTPayload>(
      token,
      new TextEncoder().encode(secret)
    );

    // --- ADD LOG ---
    console.log("[VERIFY API] Token verified successfully. Payload:", payload);
    // -------------

    const result = {
      isAuthenticated: true,
      isAdmin: payload.isAdmin || false,
    };
    console.log("✅ [VERIFY API] Returning:", result);
    return NextResponse.json(result);

  } catch (error) {
    // --- MODIFY LOG ---
    console.log("❌ [VERIFY API] Token verification FAILED:", error); // Log the actual error
    // -----------------
    return NextResponse.json({ isAuthenticated: false, isAdmin: false }, { status: 401 });
  }
}
