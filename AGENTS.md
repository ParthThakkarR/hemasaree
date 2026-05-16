# HemaSaree - Agent Guidelines

## Project Overview
E-commerce platform for sarees built with Next.js 14, Prisma (MongoDB), and TypeScript.

## Key Directories
- `app/` - Next.js app router pages and components
- `lib/` - Business logic, services, and utilities
- `lib/services/` - Service classes (ProductService, OrderService)
- `app/lib/` - App-level utilities and prisma client
- `prisma/` - Database schema and migrations

## Testing
- Run tests with `npm test`
- Tests use Vitest with jsdom environment
- Test files in `tests/unit/`

## Linting & Type Checking
- `npm run lint` - ESLint
- `npm run type-check` - TypeScript strict mode

## Database
- MongoDB via Prisma
- Schema in `prisma/schema.prisma`
- Run `npx prisma generate` after schema changes

## Code Style
- TypeScript strict mode enabled
- Zod for validation schemas
- React Server Components (RSC) where possible
- Client components use `use client` directive

## Important Patterns
- Use `ValidationError`, `NotFoundError`, `ConflictError` from `lib/errors.ts`
- Prisma client singleton in `app/lib/prisma.ts`
- Services in `lib/services/` use relative imports for errors
- `@lib` alias points to `app/lib`, use relative paths for `lib/`

## Prisma Import Best Practices
- Schema: `prisma/schema.prisma`
- After schema changes: run `npx prisma generate`
- In tests, set `DATABASE_URL` environment variable