// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Clean up DATABASE_URL if it has quotes (common issue in some environments)
if (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('"') || process.env.DATABASE_URL.startsWith("'"))) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.slice(1, -1);
}

// This prevents Prisma from creating too many connections during
// development hot-reloads in Next.js.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;