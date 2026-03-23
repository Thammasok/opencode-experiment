# AGENTS.md — Agentic Coding Guidelines

This repository contains AI agent skills for an agentic software development workflow. The skills define how AI agents should operate when assisting with software engineering tasks.

---

## 1. Build / Lint / Test Commands

This repository contains skill definitions (markdown files) rather than executable code. There are no build, lint, or test commands.

### Repository Structure

```
.opencode/
├── artifacts/           # Shared artifact templates and conventions
│   └── ARTIFACTS.md    # Artifact storage structure, IDs, templates
├── knowledge/           # Knowledge base for AI context
├── rules/               # Agent rules and guidelines
├── skills/              # Agent skill definitions
│   ├── agent-team-development/
│   ├── ai-orchestrator/
│   ├── business-analysis/
│   ├── find-skills/
│   ├── mobile-developer-flutter/
│   ├── project-management/
│   ├── software-architecture/
│   ├── software-engineer/
│   ├── software-tester-automation/
│   ├── software-tester-design/
│   ├── software-tester/
│   ├── technical-writer/
│   └── ux-ui-designer/
├── .gitignore
├── bun.lock
└── package.json
```

---

## 2. Code Style Guidelines

When working on code in **projects that use these skills**, follow these guidelines:

### 2.1 JavaScript / TypeScript

- Use **TypeScript** for large projects or multi-developer teams
- Prefer `const` > `let` > `var`
- Use `async/await` over callback chains
- **Error handling**: every async operation needs try/catch or `.catch()`
- Name things meaningfully: `getUserById` beats `getData`

### 2.2 React / Next.js

- Functional components + hooks as the default
- Separate logic from UI with custom hooks (`useXxx`)
- Use `useMemo` / `useCallback` only when there's a real performance issue
- Components should do one thing (Single Responsibility)
- Handle side effects in `useEffect` carefully — specify all dependencies
- **Next.js 13+**: Default to App Router, distinguish Server/Client Components with `"use client"`
- Use Server Actions for form submissions, Metadata API for SEO, `next/image` for images

### 2.3 API Design (REST)

- Use Express.js or Next.js API Routes
- Validate all input with Zod or Joi
- Return consistent response format: `{ data: ..., error: null }` or `{ data: null, error: {...} }`
- Forward errors to global error handler with `next(err)`
- Use proper HTTP status codes: 200, 201, 400, 401, 403, 404, 500

### 2.4 Database (Prisma)

- Use Prisma ORM with PostgreSQL or MongoDB
- Tables in `lowercase_snake_case`
- Every table has `created_at` and `updated_at`
- Use foreign keys and constraints (PostgreSQL)
- Instantiate PrismaClient as singleton to avoid connection exhaustion
- Prefer `select` over `include` when you don't need all fields

### 2.5 Testing

Follow the **Testing Pyramid**:

| Level | Tools | Coverage Target |
|-------|-------|-----------------|
| Unit | Vitest / Jest | All business logic |
| Integration | Supertest + test DB | All API endpoints |
| Contract | Pact.js | All inter-service APIs |
| E2E | Playwright / Axios | Critical paths only |

**Test structure (AAA)**:
```typescript
describe('createUser', () => {
  it('hashes password before saving', async () => {
    // Arrange
    const input = { email: 'a@b.com', password: 'plaintext' }
    
    // Act
    const result = await createUser(input)
    
    // Assert
    expect(result.password).not.toBe('plaintext')
  })
})
```

- One behavior per test, test names include TC-ID
- No test interdependency, each runs in isolation
- Use `vi.mock()` or `jest.mock()` for dependencies

### 2.6 Error Handling

- **Never expose stack traces in production**
- Use global error middleware in Express
- Always catch async errors with try/catch or `.catch()`
- Return user-friendly error messages, log details server-side

### 2.7 Security Checklist

- [ ] No secrets in source code — use `.env` + `.gitignore`
- [ ] Input validation on every endpoint (Zod / Joi)
- [ ] All SQL queries parameterized (no string concatenation)
- [ ] Passwords hashed with bcrypt (cost factor >= 12)
- [ ] JWT: verify expiry, HTTPS only
- [ ] Rate limiting on API endpoints
- [ ] CORS configured to allowed origins only
- [ ] HTTP security headers via Helmet.js

### 2.8 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-service.ts` |
| Components | PascalCase | `UserProfile.tsx` |
| Functions | camelCase | `getUserById` |
| Variables | camelCase | `userList` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Database tables | snake_case | `user_profiles` |

### 2.9 Documentation

When adding code, include:
- README with: features, tech stack, getting started, project structure
- OpenAPI/Swagger for API endpoints
- ADRs (Architecture Decision Records) for significant decisions

---

## 3. Using This Repository's Skills

When operating in projects that reference these skills, load them via the skill system:

```
skill: software-engineer     → General coding assistance
skill: software-tester       → Testing strategies
skill: software-tester-automation → Writing test code
skill: software-architecture  → API/DB design
skill: business-analysis    → Requirements gathering
skill: project-management    → Sprint planning
skill: technical-writer     → User documentation
skill: ai-orchestrator      → TDD development loop
```

### Artifact System

All skills share a common artifact system defined in `.opencode/artifacts/ARTIFACTS.md`. This document specifies:
- **Storage structure**: Where artifacts live (docs/requirements, docs/test-design, docs/project, docs/architecture, docs/user-guide, tests/)
- **ID conventions**: US-xxx, FR-xxx, NFR-xxx, SC-xxx, TC-xxx, DEV-xxx, ADR-###, EPIC-xxx
- **Templates**: All artifact types have standardized templates
- **Lifecycle**: How artifacts flow between skills

All skills MUST reference ARTIFACTS.md for artifact locations and naming conventions.

---

## 4. General Principles

- **TDD**: Write failing test first, then implement minimum code to pass
- **Shift-Left Testing**: Design tests before implementation
- **Human-in-the-Loop**: Human review is a hard gate before marking work done
- **Just-Enough Architecture**: Design per scenario, not upfront
- Adapt response detail to context: brief for quick questions, thorough for complex topics
