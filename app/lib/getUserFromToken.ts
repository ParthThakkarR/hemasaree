// import jwt from 'jsonwebtoken';
// import { NextRequest } from "next/server";

// export function getUserFromToken(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;

//   if (!token) throw new Error("No token provided");

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       id: string;
//       name: string;
//       email: string;
//     };

//     return decoded;
//   } catch {
//     throw new Error("Invalid token");
//   }
// }

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

/**
 * Decodes the JWT from request cookies to get user information.
 * @param req The Next.js request object.
 * @returns The decoded user payload if the token is valid, otherwise null.
 */
export function getUserFromToken(req: NextRequest): DecodedToken | null {
  const tokenCookie = req.cookies.get("token");

  if (!tokenCookie) {
    console.log("No token cookie found in request.");
    return null;
  }
  
  const token = tokenCookie.value;

  if (!token) {
    console.log("Token value is empty.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    // Invalidate the cookie by throwing, which can be caught to clear it
    // Or just return null for silent failure
    return null;
  }
}
