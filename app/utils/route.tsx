import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Verifies the JWT from the request cookies.
 * @returns The admin's user ID if the token is valid and the user is an admin, otherwise null.
 */
export async function verifyAdminToken(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='));

    if (!tokenCookie) {
        return null;
    }

    const token = tokenCookie.split('=')[1];
    if (!token) {
        return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string; isAdmin?: boolean };

    // Find the user in the database to confirm admin status
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { isAdmin: true }
    });

    // CRITICAL: Check if the user exists and is an admin
    if (!user || user.isAdmin !== true) {
        return null; // Not an admin or user not found
    }

    // Success: Return the admin's user ID
    return decoded.id;

  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

