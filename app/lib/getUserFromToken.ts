import { prisma } from './prisma';
import { jwtVerify } from 'jose';

export interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
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
    // ✅ Extract JWT token
    const token =
      'cookies' in req
        ? req.cookies.get('token')?.value
        : req.headers
            ?.get?.('cookie')
            ?.split(';')
            ?.find((c) => c.trim().startsWith('token='))
            ?.split('=')[1];

    if (!token) {
      console.warn('[getUserFromToken] No token found');
      return null;
    }

    // ✅ Verify token
    const JWT_SECRET = process.env.JWT_SECRET!;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    const userId = (payload as any).id;
    if (!userId) {
      console.warn('[getUserFromToken] Invalid token payload');
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

    // ✅ Force cast to expected structure (TypeScript-safe)
    const addresses = (userRecord as any).addresses ?? [];

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.firstName,
      isAdmin: userRecord.isAdmin,
      addresses: addresses,
    };

    return user;
  } catch (err) {
    console.error('[getUserFromToken ERROR]', err);
    return null;
  }
}
