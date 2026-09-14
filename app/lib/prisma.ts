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
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

// Always cache the Prisma client on the global object — critical for serverless.
// In serverless environments (Vercel), each function invocation reuses the same
// Node.js process for a period. Caching the client prevents connection pool
// exhaustion from creating a new PrismaClient (and new DB connections) per request.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production (Vercel serverless), also cache to prevent pool exhaustion
  globalForPrisma.prisma = prisma;
}
