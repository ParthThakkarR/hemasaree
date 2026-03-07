// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// This prevents Prisma from creating too many connections during
// development hot-reloads in Next.js.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // You can add logging here for development
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;