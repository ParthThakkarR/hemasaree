
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface UserJWTPayload {
  isAdmin: boolean;
}

export async function POST(req: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ [API/VERIFY] JWT_SECRET is not configured!");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ isAuthenticated: false }, { status: 400 });
    }

    const { payload } = await jwtVerify<UserJWTPayload>(
      token,
      new TextEncoder().encode(secret)
    );

    // This is the most important log. It shows what's in the token.
    console.log("✅ [API/VERIFY] Token Payload:", payload);

    const result = {
      isAuthenticated: true,
      isAdmin: payload.isAdmin || false,
    };

    // This log shows what the API is sending back to the middleware.
    console.log("✅ [API/VERIFY] Sending to middleware:", result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ [API/VERIFY] Error verifying token:", error);
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
}