import { prisma } from "@/app/lib/prisma";
import { jwtVerify } from 'jose';

type AdminTokenPayload = {
  id?: string;
  isAdmin?: boolean;
};

function getTokenFromCookieHeader(cookieHeader: string): string | null {
  for (const rawCookie of cookieHeader.split(';')) {
    const [name, ...rest] = rawCookie.trim().split('=');
    if (name !== 'token' || rest.length === 0) {
      continue;
    }

    try {
      return decodeURIComponent(rest.join('='));
    } catch {
      return rest.join('=');
    }
  }

  return null;
}



/**
 * Verifies the JWT from the request cookies.
 * @returns The admin's user ID if the token is valid and the user is an admin, otherwise null.
 */
export async function verifyAdminToken(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = getTokenFromCookieHeader(cookieHeader);
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return null;
    }

    const { payload } = await jwtVerify<AdminTokenPayload>(
      token,
      new TextEncoder().encode(secret)
    );

    const userId = typeof payload.id === 'string' ? payload.id : null;
    if (!userId || !payload.isAdmin) {
      return null;
    }

    // Find the user in the database to confirm admin status
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
    });

    // CRITICAL: Check if the user exists and is an admin
    if (!user || user.isAdmin !== true) {
        return null; // Not an admin or user not found
    }

    // Success: Return the admin's user ID
    return userId;

  } catch {
    return null;
  }
}

