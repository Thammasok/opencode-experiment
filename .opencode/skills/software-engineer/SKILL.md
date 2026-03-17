---
name: software-engineer
description: >
  Use this skill whenever the user needs software engineering assistance, including:
  writing and reviewing code (JavaScript, TypeScript, React, Next.js, Express, REST API,
  GraphQL, MongoDB, PostgreSQL, Prisma ORM), system architecture design, debugging and bug fixing,
  writing technical documentation, and testing strategies in microservice architectures.
  Trigger when the user mentions: code, components, APIs, database schemas, Prisma models/migrations,
  architecture diagrams, bugs, errors, performance issues, refactoring, PR reviews, unit/integration/
  contract/e2e tests, microservices, or asks to write/explain/fix any code.
  Adapt response detail to context: brief and direct for quick questions, thorough with best practices for complex topics.
  For UI/frontend work: read design-system/design-system.config.json first to load active theme,
  then reference tokens/, components/, accessibility/, and frameworks/ directories.
---

## Design System Integration

When writing UI code, **always** read the design system config first (located in the `ux-ui-designer` skill):

```
../.opencode/skills/ux-ui-designer/design-system/design-system.config.json   ← active theme, framework, tokens
../.opencode/skills/ux-ui-designer/design-system/tokens/                     ← colors, typography, spacing, shadows, borders, breakpoints
../.opencode/skills/ux-ui-designer/design-system/components/                 ← atoms, molecules, organisms, templates specs
../.opencode/skills/ux-ui-designer/design-system/accessibility/              ← WCAG checklist, ARIA patterns
../.opencode/skills/ux-ui-designer/design-system/frameworks/                 ← react-tailwind, nextjs, swiftui patterns
```

**Token usage rule:** Use `semantic.*` tokens in component code. Never reference `palette.*` directly.

---

> **Artifact Reference:** Refer to [`.opencode/artifacts/ARTIFACTS.md`](../../artifacts/ARTIFACTS.md) for artifact templates and storage locations when working with project documentation.

# Software Engineer Skill

## Response Principles

**Adapt mode to context:**
- Quick fix / specific question → Answer directly, provide code immediately, no fluff
- Design / architecture / concept explanation → Detailed explanation with rationale and trade-offs
- Code review → List issues clearly, provide fixes with reasoning

---

## 1. Code Writing & Review

### Coding Guidelines

**JavaScript / TypeScript**
- Use TypeScript for large projects or multi-developer teams
- Prefer `const` > `let` > `var`
- Use async/await over callback chains
- Error handling: every async operation needs try/catch or `.catch()`
- Name things meaningfully: `getUserById` beats `getData`

**React**
- Functional components + hooks as the default
- Separate logic from UI with custom hooks (`useXxx`)
- Use `useMemo` / `useCallback` only when there's a real performance issue — not prematurely
- Components should do one thing (Single Responsibility)
- Handle side effects in `useEffect` carefully — specify all dependencies

**Next.js**
- Default to App Router (Next.js 13+)
- Distinguish Server Components from Client Components (`"use client"`) correctly
- Use Server Actions for form submissions and data mutations
- Use Metadata API for SEO
- Always use `next/image` for image optimization

### Code Review Checklist
When reviewing code, check in this order:
1. **Correctness** — Does the code do what the requirement asks?
2. **Security** — Any SQL injection, XSS, or exposed secrets?
3. **Performance** — Any N+1 queries, unnecessary re-renders, or memory leaks?
4. **Readability** — Can someone understand it without excessive comments?
5. **Maintainability** — Is it easy to change later?
6. **Tests** — Is there sufficient test coverage?

---

## 2. System Architecture

### Design Approach

**Start from requirements:**
- Functional requirements: what must the system do?
- Non-functional: how much scale, what latency, what availability?

**Common stack:**
```
Frontend:  React / Next.js (App Router)
Backend:   Express.js / Node.js or Next.js API Routes
Database:  PostgreSQL (relational) or MongoDB (document)
ORM:       Prisma (type-safe DB access + migrations)
API:       REST or GraphQL depending on needs
Auth:      JWT + Refresh Token or NextAuth.js
Cache:     Redis
Deploy:    Vercel (frontend) / Railway, Render, or AWS (backend)
```

**REST vs GraphQL — how to choose:**
| Use REST when | Use GraphQL when |
|---|---|
| Simple API, clear endpoints | Client needs flexible queries |
| Team is comfortable with REST | Multiple clients (web, mobile) |
| Caching is critical | Need to reduce over/under-fetching |
| Public API | Real-time (subscriptions) |

**Database Design Principles:**
- Normalize first, denormalize only when you have a proven performance issue
- Name tables/collections in `lowercase_snake_case`
- Every table should have `created_at` and `updated_at`
- Index columns used in WHERE, JOIN, and ORDER BY frequently
- PostgreSQL: always use foreign keys and constraints
- MongoDB: design schema around access patterns, not relations

---

## 3. Debugging

### Systematic Debug Process

1. **Reproduce** — Make the bug happen consistently first
2. **Isolate** — Narrow down where the problem lives (binary search approach)
3. **Hypothesize** — Form a theory about the root cause
4. **Test** — Validate the hypothesis, one change at a time
5. **Fix** — Fix the root cause, not the symptom
6. **Verify** — Test after the fix and confirm nothing else broke

### Common Patterns

**React / Frontend:**
- `Cannot read properties of undefined` → Check optional chaining `?.` and loading states
- Infinite loop in `useEffect` → Check dependency array
- Stale closure → Use `useRef` or functional update `setState(prev => ...)`
- Memory leak → Add cleanup function in `useEffect`

**Node.js / Express:**
- Unhandled Promise rejection → Add try/catch or error middleware
- CORS error → Configure `cors()` middleware correctly
- `req.body` is undefined → Missing `express.json()` middleware

**Database:**
- N+1 query → Use JOIN (SQL) or populate/aggregate (MongoDB)
- Slow query → Run `EXPLAIN ANALYZE` (PostgreSQL) or `.explain()` (MongoDB)
- Connection pool exhausted → Review connection management

---

## 4. Technical Documentation

### Choose format by purpose

| Need | Format |
|---|---|
| Describe API endpoints | OpenAPI / Swagger spec |
| Describe architecture | Diagram + Markdown |
| Project README | Markdown (see structure below) |
| Design decision record | ADR (Architecture Decision Record) |
| Onboarding guide | Step-by-step Markdown |

### Good README Structure
```markdown
# Project Name

Short description (1–2 lines)

## Features
## Tech Stack
## Getting Started (Prerequisites, Installation, Environment Variables)
## Project Structure
## API Documentation (if applicable)
## Contributing
## License
```

### ADR Structure
```markdown
# ADR-XXX: Title of Decision

## Status
Accepted / Proposed / Deprecated

## Context
Why does this decision need to be made?

## Decision
What was decided?

## Consequences
What follows from this decision? (both positive and negative)
```

---

## 5. Code Patterns & Examples

### Express API Route with error handling
```javascript
// routes/users.js
import { Router } from 'express'
import { validateBody } from '../middleware/validate.js'
import { createUserSchema } from '../schemas/user.schema.js'
import * as userService from '../services/user.service.js'

const router = Router()

router.post('/', validateBody(createUserSchema), async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json({ data: user })
  } catch (err) {
    next(err) // forward to global error handler
  }
})

export default router
```

### Custom React Hook
```typescript
// hooks/useAsync.ts
import { useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsync<T>(asyncFn: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null, loading: false, error: null
  })

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await asyncFn()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [asyncFn])

  return { ...state, execute }
}
```

### Prisma — Schema, Queries & Migrations

**Schema definition (`prisma/schema.prisma`)**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

**Prisma Client — common patterns**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Find with relation
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: { where: { published: true } } }
})

// Create with nested relation
const post = await prisma.post.create({
  data: {
    title: 'Hello World',
    author: { connect: { id: userId } }
  }
})

// Paginate
const posts = await prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})

// Transaction
const [updatedUser, newLog] = await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { name } }),
  prisma.auditLog.create({ data: { action: 'UPDATE_USER', userId: id } })
])
```

**Migration workflow**
```bash
# After editing schema.prisma
npx prisma migrate dev --name add_post_table   # dev: creates + applies migration
npx prisma migrate deploy                       # production: applies pending migrations
npx prisma db seed                              # run seed script
npx prisma studio                               # open visual DB browser
```

**Prisma best practices**
- Instantiate `PrismaClient` as a singleton (avoid connection exhaustion in dev/hot-reload)
- Use `prisma.$transaction` for operations that must succeed or fail together
- Prefer `select` over `include` when you don't need all fields — reduces payload size
- Use `prisma.$queryRaw` only as a last resort; always parameterize: `` prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}` ``
- Keep migration files in version control — never edit them after they've been applied

**Singleton pattern for Next.js / Express**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### PostgreSQL Raw Query (parameterized — when Prisma isn't enough)
```javascript
// ✅ Safe — parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE id = $1 AND active = $2',
  [userId, true]
)

// ❌ Unsafe — SQL injection risk
const user = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
)
```

---

## 6. Security Checklist

Always verify before review or deploy:

- [ ] No secrets / API keys in source code (use `.env` + `.gitignore`)
- [ ] Input validation on every endpoint (Zod / Joi)
- [ ] All SQL queries are parameterized
- [ ] Passwords hashed with bcrypt (cost factor ≥ 12)
- [ ] JWT: verify expiry, HTTPS only
- [ ] Rate limiting on API endpoints
- [ ] CORS configured to allowed origins only
- [ ] HTTP security headers via Helmet.js (Express)
- [ ] No stack traces returned to client in production

---

## 7. Performance Tips

**Frontend:**
- Code splitting via dynamic import: `const Comp = dynamic(() => import('./Heavy'))`
- Virtualize long lists (react-virtual, react-window)
- Optimize images: WebP, lazy loading, correct sizing
- Analyze bundle size with `@next/bundle-analyzer`

**Backend:**
- Cache frequently computed results with Redis
- Paginate every endpoint that returns a list
- Use database connection pooling (pg-pool, mongoose connection)
- Avoid blocking the event loop — use worker threads for CPU-intensive tasks

**Database:**
- Index at minimum on columns used for filtering and joining
- `SELECT` only needed columns, never `SELECT *`
- Batch inserts instead of inserting row by row

---

*Always adapt output to context: brief and direct for quick questions, full explanation with examples for deep dives.*

## 8. Testing Strategies in a Microservice Architecture

In microservices, no single test type is enough. Use the **Testing Pyramid** as a guide:

```
          /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
         /   E2E / System   \       ← fewest, slowest, highest confidence
        /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
       /  Integration Tests   \     ← test service + real DB/dependencies
      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
     /   Contract Tests (CDC)   \   ← verify service boundaries
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
   /        Unit Tests            \  ← most, fastest, isolated
  /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

---

### Unit Tests
**What:** Test a single function or class in isolation. All external dependencies (DB, HTTP, message queue) are mocked.

**Tools:** Vitest or Jest

**When to write:** For all business logic, transformations, validators, and utility functions.

```typescript
// user.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createUser } from './user.service'
import { prisma } from '../lib/prisma'

vi.mock('../lib/prisma', () => ({
  prisma: { user: { create: vi.fn() } }
}))

describe('createUser', () => {
  it('hashes password before saving', async () => {
    const mockUser = { id: '1', email: 'a@b.com', name: 'Alice' }
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

    const result = await createUser({ email: 'a@b.com', password: 'plaintext' })

    const callArgs = vi.mocked(prisma.user.create).mock.calls[0][0]
    expect(callArgs.data.password).not.toBe('plaintext')
    expect(result.email).toBe('a@b.com')
  })
})
```

---

### Integration Tests
**What:** Test a service end-to-end internally — real DB, real middleware, no external services.

**Tools:** Vitest / Jest + Supertest + a real test database (Docker or `prisma migrate deploy` against a test DB)

**When to write:** For every API endpoint; verify request → handler → DB → response.

```typescript
// users.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /users', () => {
  it('creates a user and returns 201', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', name: 'Test User' })

    expect(res.status).toBe(201)
    expect(res.body.data.email).toBe('test@example.com')

    const saved = await prisma.user.findUnique({ where: { email: 'test@example.com' } })
    expect(saved).not.toBeNull()
  })
})
```

**Prisma integration test setup — use a dedicated test database:**
```typescript
// vitest.setup.ts
import { execSync } from 'child_process'

export async function setup() {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  execSync('npx prisma migrate deploy')
}
```

---

### Contract Tests (Consumer-Driven Contract Testing)
**What:** Verify that services honor the API contract agreed upon with their consumers. The consumer defines what it expects; the provider proves it can deliver.

**Tools:** Pact.js

**Why it matters in microservices:** Services evolve independently. Contract tests catch breaking changes before they reach staging or production — without requiring all services to be running at once.

```
Consumer Service          Pact Broker          Provider Service
      |                       |                       |
      |-- defines contract -->|                       |
      |                       |<-- verifies against --|
      |                       |       (CI/CD)         |
```

**Consumer side — define expectations:**
```typescript
// order.consumer.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact'

const provider = new PactV3({ consumer: 'OrderService', provider: 'UserService' })

describe('UserService contract', () => {
  it('returns user by id', async () => {
    await provider
      .given('user with id 123 exists')
      .uponReceiving('a GET request for user 123')
      .withRequest({ method: 'GET', path: '/users/123' })
      .willRespondWith({
        status: 200,
        body: {
          id: MatchersV3.string('123'),
          email: MatchersV3.email('user@example.com'),
          name: MatchersV3.string('Alice')
        }
      })
      .executeTest(async (mockServer) => {
        const user = await fetchUser(mockServer.url, '123')
        expect(user.id).toBe('123')
      })
  })
})
```

**Provider side — verify the contract is met (runs in CI):**
```typescript
// user.provider.test.ts
import { PactV3 } from '@pact-foundation/pact'

const verifier = new PactV3({
  provider: 'UserService',
  pactBrokerUrl: process.env.PACT_BROKER_URL,
  providerBaseUrl: 'http://localhost:3001'
})

describe('Pact verification', () => {
  it('satisfies all consumer contracts', () => verifier.verifyProvider())
})
```

---

### E2E / System Tests
**What:** Test complete user flows across multiple real services (all running, usually in Docker Compose or a staging env).

**Tools:** Playwright (UI flows) or Supertest/Axios (API flows) against a full environment

**When to write:** For critical happy-path flows only. Keep this layer thin — they are slow and brittle.

```typescript
// checkout.e2e.test.ts
describe('Checkout flow', () => {
  it('user can place an order end-to-end', async () => {
    // 1. Create user via User Service
    const user = await createUser({ email: 'buyer@test.com' })

    // 2. Add item via Inventory Service
    const item = await addInventoryItem({ name: 'Widget', stock: 10 })

    // 3. Place order via Order Service
    const order = await placeOrder({ userId: user.id, itemId: item.id, qty: 2 })
    expect(order.status).toBe('CONFIRMED')

    // 4. Verify inventory was decremented
    const updated = await getInventoryItem(item.id)
    expect(updated.stock).toBe(8)
  })
})
```

---

### Test Strategy Summary

| Layer | Scope | Speed | Tools | Coverage target |
|---|---|---|---|---|
| Unit | Single function/class | Very fast | Vitest / Jest | All business logic |
| Integration | Service + real DB | Medium | Supertest + test DB | All API endpoints |
| Contract | Service boundary | Fast | Pact.js | All inter-service APIs |
| E2E | Full system | Slow | Playwright / Axios | Critical paths only |

**Key rules:**
- Each service owns and runs its own unit + integration tests
- Contract tests run in CI on every PR that touches a shared API
- E2E tests run in a dedicated staging environment, not on every commit
- Never share a database between services — even in tests
- Use `DATABASE_URL` env var to point tests at an isolated test database