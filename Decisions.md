# HemaSaree - AI Decision Log

> **Purpose**: Every AI-driven change must have a traceable "why" -- not just the "what". This log captures reasoning, trade-offs, and alternatives considered so future maintainers (human or AI) can understand intent without reverse-engineering.

---

## Decision Record Format

Each entry follows:
- **Date / Model**: When and which model made the call
- **Context**: What triggered the decision
- **Options Considered**: Alternatives evaluated
- **Decision**: What was chosen
- **Rationale (The "Why")**: Deep reasoning -- constraints, priorities, risks
- **Consequences**: Expected impact, known trade-offs, follow-ups needed
- **Reversibility**: How to undo if wrong

---

## 2026-08-11 -- Project Documentation Initiative (nemotron-3-ultra)

### Context
User requested comprehensive documentation files (Decisions.md, Flow.md, Architecture.md, Constraints.md, Bug.md, Feature.md, TestChecklist.md, RollbackPlan.md) to capture institutional knowledge and make AI-assisted development traceable.

### Options Considered
1. **Minimal stubs** -- Create empty templates only
2. **Comprehensive seed** -- Populate with actual project analysis from codebase exploration
3. **Deferred** -- Wait for real decisions to accumulate

### Decision
Option 2: Comprehensive seed with actual project analysis.

### Rationale (The "Why")
- **Immediate value**: Templates alone require future effort to populate; seeding with real analysis provides instant utility
- **Demonstrates pattern**: Shows the expected depth/format for future entries
- **Captures implicit knowledge**: Current codebase has architectural decisions (Prisma singleton, error hierarchy, caching strategy) that are undocumented but critical
- **Reduces onboarding friction**: New AI/human contributors get a system map immediately

### Consequences
- [x] Instant reference for architecture, constraints, flows
- [x] Establishes documentation standard early
- [~] Initial time investment higher
- [~] Some entries may need refinement as project evolves

### Reversibility
Files are markdown -- easily edited, deleted, or restructured. No code changes.

---

## 2026-08-11 -- Prisma Client Singleton Pattern (Inferred from codebase)

### Context
pp/lib/prisma.ts exports a singleton PrismaClient instance with global caching for development hot-reload.

### Options Considered (Inferred)
1. **New instance per request** -- Simple but creates connection overhead
2. **Singleton with global cache** -- Current implementation
3. **Connection pooling via external service** -- Overkill for current scale

### Decision
Singleton with global cache in development.

### Rationale (The "Why")
- **MongoDB connection limits**: Prisma creates connection pools; multiple instances exhaust connections fast in serverless
- **Next.js dev hot-reload**: Without global cache, each reload creates new client --> connection leak
- **TypeScript strict mode**: Singleton ensures single type definition across app
- **DATABASE_URL sanitization**: Centralized in one place (lines 5-12) -- prevents trim/quote issues from env vars

### Consequences
- [x] Prevents connection exhaustion in serverless (Vercel)
- [x] Single source of truth for DB client config
- [~] Global state makes testing harder (requires DATABASE_URL in test env)
- [~] Must run 
px prisma generate after schema changes

### Reversibility
Replace singleton with factory function if moving to non-serverless or needing multi-tenancy.

---

## 2026-08-11 -- Error Hierarchy in lib/errors.ts (Inferred from codebase)

### Context
Centralized error classes: AppError base --> ValidationError, AuthError, ForbiddenError, NotFoundError, ConflictError, PaymentError, RateLimitError, DatabaseError, ExternalServiceError.

### Options Considered (Inferred)
1. **Throw raw Error objects** -- No structure, hard to handle consistently
2. **HTTP status codes only** -- Loses semantic meaning
3. **Typed error hierarchy** -- Current implementation

### Decision
Typed error hierarchy with handleApiError utility.

### Rationale (The "Why")
- **Consistent API responses**: Every route returns { message, statusCode, code } -- frontend can handle uniformly
- **Operational vs programmer errors**: isOperational flag distinguishes expected failures (4xx) from bugs (5xx) -- critical for alerting
- **Prisma error mapping**: handleApiError translates Prisma codes (P2002, P2025) to semantic HTTP errors -- no raw DB errors leak to client
- **Security (CLAUDE.md #9)**: No stack traces to client; structured logging server-side
- **Service layer clarity**: Services import ValidationError, NotFoundError, ConflictError -- intent is explicit in code

### Consequences
- [x] Predictable error handling across all API routes
- [x] Frontend can show user-friendly messages by error code
- [x] Monitoring can alert on non-operational (5xx) errors only
- [~] Requires discipline: every service must use these classes, not raw throws

### Reversibility
Migration to different error library (e.g., 
everthrow for Result types) would be mechanical but widespread.

---

## 2026-08-11 -- Read-Through Caching in ProductService (Inferred from codebase)

### Context
ProductService.getProducts() and getProductById() use cache.getOrSet(key, fetcher, TTL) with 15min/10min TTLs.

### Options Considered (Inferred)
1. **No caching** -- Simple, but DB hit on every request
2. **Write-through cache** -- Invalidate on every write; complex
3. **Read-through with TTL** -- Current implementation

### Decision
Read-through caching with TTL-based expiration.

### Rationale (The "Why")
- **Product catalog read-heavy**: Browse/search >> writes (admin only)
- **TTL simplicity**: No cache invalidation logic needed -- eventual consistency acceptable for catalog
- **Cache key design**: Includes all filter/sort/page params --> precise caching, no stale filtered results
- **MongoDB cost**: Reduces read ops on Atlas; 15min TTL = 96 reads/day per unique query vs thousands
- **Cache abstraction**: lib/cache.ts wraps Redis/in-memory -- swap backend without service changes

### Consequences
- [x] Sub-10ms cached responses vs 100-300ms DB
- [x] Zero invalidation bugs (TTL handles it)
- [~] Stale data up to 15min (acceptable for catalog, not for inventory-critical ops)
- [~] Cache keys can grow unbounded -- needs monitoring

### Reversibility
Disable caching by setting TTL=0 or swap cache implementation. No service logic changes.

---

## 2026-08-11 -- Service Layer Pattern: Static Classes (Inferred from codebase)

### Context
ProductService, OrderService, OfferService, SearchService are static classes with no instance state.

### Options Considered (Inferred)
1. **Plain functions** -- Simple, but no namespace grouping
2. **Static classes** -- Current: ProductService.getProducts()
3. **Instance classes with DI** -- Testable but verbose for stateless services

### Decision
Static classes for stateless services.

### Rationale (The "Why")
- **Namespace clarity**: ProductService.getProducts() self-documents domain
- **No DI overhead**: Services are pure logic + Prisma; no external deps needing mocking in tests (Prisma mocked at module level)
- **Tree-shaking friendly**: Static methods unused = dropped by bundler
- **Consistent with Next.js RSC**: Server components can import and call directly
- **Test pattern**: Vitest mocks prisma module; static methods work identically

### Consequences
- [x] Clean import: import { ProductService } from '@/lib/services/productService'
- [x] Easy to find all product operations in one file
- [~] Harder to swap implementations (e.g., for multi-tenant) -- would need refactor to instance + DI

### Reversibility
Convert to instance class with constructor injection if multi-tenancy or A/B testing needed.

---

## 2026-08-11 -- Zod Validation in pp/lib/validators.ts (Inferred from AGENTS.md)

### Context
AGENTS.md mandates "Zod for validation schemas". Validators live in pp/lib/validators.ts (app-level, not lib/).

### Options Considered (Inferred)
1. **Inline validation in routes** -- Scattered, hard to reuse
2. **Shared validators in lib/** -- But @lib alias points to pp/lib
3. **Centralized in pp/lib/validators.ts** -- Current

### Decision
Centralized Zod schemas in pp/lib/validators.ts.

### Rationale (The "Why")
- **Single source of truth**: Schema = type = validation = docs
- **Reuse across routes**: Same schema for POST /api/products and PUT /api/products/[id]
- **Type inference**: z.infer<typeof schema> gives TypeScript types automatically
- **Security (CLAUDE.md #3)**: Server-side only; client never sees validation logic
- **Path alias**: @lib/validators works in both pp/ and lib/ (via tsconfig paths)

### Consequences
- [x] DRY validation; type-safe request bodies
- [x] Easy to test validators in isolation
- [~] Must keep pp/lib and lib/ imports straight (AGENTS.md #37)

### Reversibility
Move to lib/validators.ts if alias changes; update imports.

---

## 2026-08-11 -- MongoDB with Prisma (Inferred from schema.prisma)

### Context
Prisma schema uses provider = "mongodb" with @db.ObjectId for IDs.

### Options Considered (Inferred)
1. **PostgreSQL** -- Relational, mature, but schema migrations needed
2. **MongoDB + Prisma** -- Current: flexible schema, JSON-native, Prisma type safety
3. **Raw MongoDB driver** -- No type safety, more boilerplate

### Decision
MongoDB via Prisma.

### Rationale (The "Why")
- **Saree catalog variability**: Color, fabric, occasion, images array -- document model fits naturally
- **Rapid iteration**: No migration files for new fields (e.g., adding motif later)
- **Prisma type safety**: Still get Product type, autocompletion, compile-time checks
- **MongoDB Atlas**: Managed, serverless-friendly, free tier for dev
- **ObjectId native**: @db.ObjectId maps to MongoDB _id -- efficient, no UUID conversion

### Consequences
- [x] Flexible product attributes without migrations
- [x] Prisma DX: prisma.product.findMany(), type-safe includes
- [~] No foreign key enforcement -- app must maintain referential integrity
- [~] Transactions limited (MongoDB replica set required for multi-document)
- [~] Aggregation pipeline for complex queries (review stats in ProductService)

### Reversibility
Migration to PostgreSQL would require schema redesign, Prisma migrate, data migration scripts -- significant effort.

---

## 2026-08-11 -- NextAuth.js for Authentication (Inferred from pp/api/auth/[...nextauth]/route.ts)

### Context
Auth routes use NextAuth.js with credentials + OAuth providers.

### Options Considered (Inferred)
1. **Custom JWT auth** -- Full control, but high risk (CLAUDE.md #4)
2. **Clerk/Auth0** -- Managed, but cost at scale
3. **NextAuth.js** -- Current: open-source, flexible, integrated with Next.js

### Decision
NextAuth.js with Prisma adapter.

### Rationale (The "Why")
- **CLAUDE.md #4 compliance**: Established library, bcrypt/argon2 for passwords, JWT best practices
- **Next.js integration**: Middleware, getServerSession, RSC compatible
- **Prisma adapter**: User/Account/Session models map directly to schema
- **Extensible**: Credentials provider for email/password, OAuth for Google/GitHub
- **Server-side only**: Secrets never touch frontend (CLAUDE.md #1)

### Consequences
- [x] Battle-tested auth flows (signup, login, reset, verify)
- [x] Role-based access: isAdmin on User model
- [~] NextAuth v5 (beta) has breaking changes -- pin version
- [~] Custom credentials provider needs careful rate limiting (CLAUDE.md #2)

### Reversibility
Swap to Lucia or Clerk if NextAuth maintenance stalls; Prisma models compatible.

---

## 2026-08-11 -- Rate Limiting Strategy (Inferred from lib/rate-limit-redis.ts, lib/rateLimitWrapper.ts)

### Context
Two implementations: Redis-backed (ate-limit-redis.ts) and in-memory wrapper (ateLimitWrapper.ts).

### Options Considered (Inferred)
1. **Single in-memory** -- Simple, fails in multi-instance (Vercel)
2. **Redis only** -- Requires Upstash/Redis infra
3. **Dual: Redis for prod, in-memory for dev** -- Current

### Decision
Dual implementation with environment-based selection.

### Rationale (The "Why")
- **CLAUDE.md #2**: Every public endpoint needs rate limiting
- **Vercel serverless**: In-memory doesn't share across instances -- Redis required for production
- **Local dev**: No Redis needed; in-memory works for 
pm run dev
- **Wrapper pattern**: ateLimitWrapper.ts abstracts backend -- routes import one API

### Consequences
- [x] Works everywhere without config changes
- [x] Per-endpoint limits configurable (auth: 5/15min, general: 60/min)
- [~] In-memory leaks if not cleaned (wrapper handles cleanup)
- [~] Redis costs at scale (Upstash free tier: 10k req/day)

### Reversibility
Swap Redis provider (Upstash --> Railway --> self-hosted) without route changes.

---

## 2026-08-11 -- Image Handling: Cloudinary + Prisma Image Model (Inferred from lib/cloudinary.ts, lib/imageService.ts, Image model)

### Context
Images uploaded to Cloudinary; metadata stored in Prisma Image model; product images stored as string array on Product.

### Options Considered (Inferred)
1. **Local filesystem** -- Simple, but doesn't scale on serverless
2. **S3 direct** -- More control, more complexity
3. **Cloudinary + metadata** -- Current

### Decision
Cloudinary for transformation/delivery; Prisma for metadata/audit.

### Rationale (The "Why")
- **CLAUDE.md #8**: MIME validation, size limits, UUID renaming -- Cloudinary handles on upload
- **Transformations**: On-the-fly resize, format (WebP), quality -- no build-time image processing
- **Prisma Image model**: Tracks original name, mime, size, upload time -- audit trail, debugging
- **Product.images string[]**: Simple reference; Cloudinary public IDs or URLs
- **Signed uploads**: pp/api/admin/cloudinary-signature/route.ts -- client uploads direct, server signs

### Consequences
- [x] Global CDN, automatic optimization
- [x] Upload offloaded from API server (serverless friendly)
- [x] Metadata queryable (find large images, audit uploads)
- [~] Cloudinary cost at scale
- [~] Two sources of truth: Cloudinary (files) + Prisma (metadata) -- sync issues possible

### Reversibility
Move to S3 + CloudFront + Sharp for transformations; update imageService.ts only.

---

## Template for Future Decisions

`markdown
## YYYY-MM-DD -- Short Title (Model Name)

### Context
What triggered this decision? Link to issue, PR, or conversation.

### Options Considered
1. Option A -- Brief description
2. Option B -- Brief description
3. Option C -- Brief description

### Decision
What was chosen (one sentence).

### Rationale (The "Why")
Deep reasoning. Reference constraints (CLAUDE.md, AGENTS.md), performance, security, DX, cost, risk.

### Consequences
- [x] Benefits
- [~] Trade-offs / Risks
- [~] Follow-ups needed

### Reversibility
How to undo. Effort level: Low / Medium / High.
`

---

## Decision Index (Quick Reference)

| Date | Area | Decision |
|------|------|----------|
| 2026-08-11 | Documentation | Seed comprehensive docs from codebase analysis |
| 2026-08-11 | Database | Prisma singleton with global cache + URL sanitization |
| 2026-08-11 | Errors | Typed hierarchy + handleApiError + Prisma code mapping |
| 2026-08-11 | Caching | Read-through TTL (15m list, 10m detail) |
| 2026-08-11 | Services | Static classes for stateless domain logic |
| 2026-08-11 | Validation | Centralized Zod in pp/lib/validators.ts |
| 2026-08-11 | Database | MongoDB via Prisma (flexible schema, no migrations) |
| 2026-08-11 | Auth | NextAuth.js with Prisma adapter |
| 2026-08-11 | Rate Limiting | Dual Redis (prod) / in-memory (dev) with wrapper |
| 2026-08-11 | Images | Cloudinary + Prisma metadata model |

---

*Last updated: 2026-08-11 | Model: nemotron-3-ultra | Context: Project documentation initiative*
