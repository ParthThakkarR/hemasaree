import { prisma } from './prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

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
 * Fetches user from NextAuth session
 * Returns full user object with all saved addresses
 */
export async function getUserFromToken(
  req?: Request | { cookies: Map<string, { value: string }> }
): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      console.warn('[getUserFromToken] No active session found');
      return null;
    }

    const userId = (session.user as any).id;

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
      firstName: userRecord.firstName || userRecord.name?.split(' ')[0] || 'User',
      isAdmin: userRecord.isAdmin,
      addresses: addresses,
    };

    return user;
  } catch (err) {
    console.error('[getUserFromToken ERROR]', err);
    return null;
  }
}
