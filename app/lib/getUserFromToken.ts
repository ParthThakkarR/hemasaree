import { prisma } from '@lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/auth";

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
  lastName?: string | null;
  phone?: string | null;
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

    if (!userId || typeof userId !== 'string') {
      console.warn('[getUserFromToken] Invalid user ID format');
      return null;
    }

    // ✅ Fetch user with addresses (MongoDB-compatible)
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          select: {
            id: true,
            area: true,
            city: true,
            state: true,
            pincode: true,
            addressType: true,
            isDefault: true,
          },
        },
      },
    });

    if (!userRecord) return null;

    // ✅ Force cast to expected structure (TypeScript-safe)
    const rawAddresses = (userRecord as any).addresses ?? [];
    const addresses = rawAddresses.map((a: any) => ({
      id: a.id,
      streetAddress: a.area,
      city: a.city,
      state: a.state,
      zipCode: a.pincode,
      label: a.addressType,
      isDefault: a.isDefault,
    }));

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.firstName || userRecord.name?.split(' ')[0] || 'User',
      lastName: userRecord.lastName,
      phone: userRecord.phone,
      isAdmin: userRecord.isAdmin,
      addresses: addresses,
    };

    return user;
  } catch (err) {
    console.error('[getUserFromToken ERROR]', err);
    return null;
  }
}


