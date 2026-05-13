import { NextResponse } from "next/server";
import { prisma } from "@app/lib/prisma";



import { getServerSession } from "next-auth/next";
import { authOptions } from "@app/lib/auth";

/**
 * Verifies the admin session using NextAuth.
 * @returns The admin's user ID if the token is valid and the user is an admin, otherwise null.
 */
export async function verifyAdminToken(req: Request): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return null;
    }

    // Check if the user exists and is an admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true, isAdmin: true }
    });

    if (!user || user.isAdmin !== true) {
      return null; // Not an admin or user not found
    }

    // Success: Return the admin's user ID
    return user.id;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}


