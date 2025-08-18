// import { NextRequest, NextResponse } from "next/server";
// import { jwtVerify } from "jose"; // Use the 'jose' library for Edge compatibility

// // Define the expected structure of your JWT payload
// interface UserJWTPayload {
//   isAdmin: boolean;
// }

// export async function POST(req: NextRequest) {
//   // 1. Get the secret key securely from server environment
//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     console.error("JWT_SECRET is not configured on the server.");
//     return NextResponse.json({ error: "Configuration error" }, { status: 500 });
//   }

//   try {
//     // 2. Get the token from the request body sent by the middleware
//     const { token } = await req.json();
//     if (!token) {
//       return NextResponse.json({ isAuthenticated: false }, { status: 400 });
//     }

//     // 3. Verify the token using 'jose'
//     const { payload } = await jwtVerify<UserJWTPayload>(
//       token,
//       new TextEncoder().encode(secret)
//     );

//     // 4. Return the verification result in a simple JSON object
//     return NextResponse.json({
//       isAuthenticated: true,
//       isAdmin: payload.isAdmin || false, // Default to false if not present
//     });

//   } catch (error) {
//     // This catches invalid/expired tokens
//     console.log("Token verification failed in API route:", error);
//     return NextResponse.json({ isAuthenticated: false }, { status: 401 });
//   }
// }

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