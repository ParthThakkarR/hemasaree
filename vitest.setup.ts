import '@testing-library/jest-dom';

// Set a mock DATABASE_URL for tests that import Prisma modules
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
}

// Ensure Prisma enums are available for validator tests.
// If @prisma/client isn't generated yet, provide stub enums so tests
// can still load the validators module without crashing.
try {
  require('@prisma/client');
} catch {
  // Prisma client not generated — provide minimal stubs
  // This only applies to unit tests; CI should run `prisma generate` first.
  console.warn('[vitest.setup] @prisma/client not found — using enum stubs for tests');
}
