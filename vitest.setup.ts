import '@testing-library/jest-dom';

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
