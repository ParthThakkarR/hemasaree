// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

let databaseUrl = process.env.DATABASE_URL || "";

// Aggressive sanitization: remove all quotes, whitespace, and handle common formatting issues
if (databaseUrl) {
  databaseUrl = databaseUrl.trim().replace(/^["']+|["']+$/g, '');
  
  // Log metadata (not the full URL for security)
  console.log(`[PRISMA] Initializing with URL: ${databaseUrl.substring(0, 12)}... (Total length: ${databaseUrl.length})`);
  
  if (!databaseUrl.startsWith('mongodb')) {
    console.error(`[PRISMA] CRITICAL: DATABASE_URL does not start with mongo! Current start: ${databaseUrl.substring(0, 10)}`);
  }
} else {
  console.error("[PRISMA] CRITICAL: DATABASE_URL is undefined or empty!");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;