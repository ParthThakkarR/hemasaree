// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Sanitize DATABASE_URL globally BEFORE Prisma validates it
if (process.env.DATABASE_URL) {
  const original = process.env.DATABASE_URL;
  process.env.DATABASE_URL = original.trim().replace(/^["']+|["']+$/g, '');
  
  if (original !== process.env.DATABASE_URL) {
    console.log(`[PRISMA] DATABASE_URL was sanitized (Length change: ${original.length} -> ${process.env.DATABASE_URL.length})`);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;