import { prisma } from './prisma';
import { jwtVerify } from 'jose';

type TokenPayload = {
  id?: string;
};

function extractToken(
  req: Request | { cookies: Map<string, { value: string }> }
): string | null {
  if ('cookies' in req) {
    return req.cookies.get('token')?.value ?? null;
  }

  const cookieHeader = req.headers?.get?.('cookie') ?? '';
  for (const cookie of cookieHeader.split(';')) {
    const [name, ...rest] = cookie.trim().split('=');
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

export interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string | null;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  isAdmin: boolean;
  addresses: Address[];
}

/**
 * Fetches user from JWT token (stored in cookies)
 * Returns full user object with all saved addresses
 */
export async function getUserFromToken(
  req: Request | { cookies: Map<string, { value: string }> }
): Promise<User | null> {
  try {
    const token = extractToken(req);
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return null;
    }

    const { payload } = await jwtVerify<TokenPayload>(
      token,
      new TextEncoder().encode(secret)
    );

    const userId = typeof payload.id === 'string' ? payload.id : null;
    if (!userId) {
      return null;
    }

    // ✅ Fetch user with addresses (MongoDB-compatible)
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          select: {
            id: true,
            streetAddress: true,
            city: true,
            state: true,
            zipCode: true,
            label: true,
            isDefault: true,
          },
        },
      },
    });

    if (!userRecord) return null;

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.firstName,
      isAdmin: userRecord.isAdmin,
      addresses: userRecord.addresses ?? [],
    };

    return user;
  } catch {
    return null;
  }
}
