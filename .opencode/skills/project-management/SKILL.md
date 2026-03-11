---
name: project-management
description: >
  Use this skill whenever the user needs to PLAN and COORDINATE delivery of a feature or system
  by consolidating artifacts from business analysis and QA into a structured project plan with
  developer task breakdowns. Covers: ingesting requirements (US-xxx, FR-xxx, NFR-xxx) from the
  business-analysis skill and test artifacts (SC-xxx, TC-xxx) from the software-tester-design
  skill, grouping them into Epics and Stories, breaking down developer implementation tasks
  (DEV-xxx) per layer (API, DB, frontend, infra), mapping dependencies, prioritising by MoSCoW,
  slicing them into agile iterations (iterative & incremental delivery), assigning SC-xxx test
  scenarios and TC-xxx test cases to each iteration as the Definition of Done, and producing a
  full traceability matrix.
  Trigger when the user mentions: project plan, sprint plan, iteration plan, task breakdown,
  developer tasks, backlog, epic, milestone, delivery plan, work breakdown, who builds what,
  implementation tasks, DEV tasks, agile, iterative, incremental, sprint, "break this into tasks",
  "plan the sprint for", "plan the iteration for", "assign work", "what does the dev need to
  implement", "map requirements to tasks", "slice the work", or asks to coordinate between
  BA and QA output.
  Always run AFTER business-analysis and software-tester-design — never before.
---

# Project Management — Delivery Planning Skill

## Role & Responsibility

This skill sits at the centre of the delivery pipeline. It receives artifacts from upstream skills and produces a structured plan that developers can execute against.

```
[business-analysis]          [software-tester-design]
────────────────────         ───────────────────────────
US-xxx  User Story Map  ──┐  SC-xxx  Test Scenarios   ──┐
FR-xxx  Functional Req  ──┤  TC-xxx  Test Cases        ──┤
NFR-xxx Non-Functional  ──┤  Test data specs           ──┘
IO spec Input/Output    ──┘
                              ↓
                   [project-management]
                   ─────────────────────────────────────
                   Step 1: Ingest & validate artifacts
                   Step 2: Build Epic → Story backlog
                   Step 3: Break down DEV-xxx tasks
                   Step 4: Map dependencies
                   Step 5: Slice into iterations
                            (assign SC-xxx + TC-xxx per iteration)
                   Step 6: Produce traceability matrix
                              ↓
                   [software-engineer]  [software-tester-automation]
                   Receives: DEV-xxx    Receives: TC-xxx scoped to
                   task cards + SC/TC  their iteration
                   for the iteration
```

---

## Core Philosophy — Agile Iterative & Incremental Development

Agile delivery is built on two complementary ideas:

| Concept         | What it means                                                                 |
| --------------- | ----------------------------------------------------------------------------- |
| **Iterative**   | Work in short cycles (iterations/sprints). At the end of each cycle, inspect what was built, get feedback, and adapt the plan for the next cycle. |
| **Incremental** | Each iteration delivers a **working, tested increment** — a real slice of the product that functions end-to-end, not a layer of plumbing that won't be usable until Sprint 6. |

### What this means for the PM

The PM does **not** dump all DEV-xxx tasks, SC-xxx scenarios, and TC-xxx test cases into a flat list and hand it to the team. Instead, the PM **slices** them:

```
Full backlog of scenarios and test cases
           ↓
    Slice into iterations
           ↓
  Iteration 1: happy path scenarios + P1 test cases → working increment
  Iteration 2: error paths + edge cases → more robust increment
  Iteration 3: NFRs, performance, security → production-ready increment
```

Each iteration gives the developer **exactly the scenarios and test cases that define done for that slice** — not the full test suite, not zero tests. The developer knows what to build, and the tester knows what to verify, before a single line of code is written.

### Vertical slicing rule

Slice **vertically** (end-to-end through one job step), not **horizontally** (all DB tasks, then all API tasks, then all frontend tasks).

```
❌ Horizontal (wrong): Sprint 1 = all DB migrations
                       Sprint 2 = all API endpoints
                       Sprint 3 = all frontend components
                       Sprint 4 = testing

✓  Vertical (correct): Sprint 1 = full happy path for Step 1 of the job
                               (DB + API + frontend + P1 tests — working end-to-end)
                        Sprint 2 = error handling and edge cases for Step 1
                        Sprint 3 = Step 2 of the job, happy path
                        Sprint 4 = Step 2 error handling + NFRs
```

### Iteration rhythm

```
┌─────────────────────────────────────────────────────────┐
│  ITERATION N  (1–2 weeks)                               │
│                                                         │
│  Day 1:   PM presents iteration scope                   │
│           → DEV-xxx task cards                          │
│           → SC-xxx scenarios in scope                   │
│           → TC-xxx test cases = Definition of Done      │
│                                                         │
│  Day 2–N: Developer builds against SC + TC              │
│           QA verifies TC as tasks complete              │
│                                                         │
│  Last day: Review increment against TC-xxx              │
│            All P1 TCs pass → iteration is done          │
│            Retrospect → adapt next iteration scope      │
└─────────────────────────────────────────────────────────┘
```

### Definition of Done (DoD) per iteration

An iteration is **done** when:
- All DEV-xxx tasks in scope are complete
- All **P1 test cases** assigned to this iteration pass
- No P1 scenario is untested
- The increment works end-to-end in the dev/staging environment
- No known blocker carries forward (blockers are escalated, not ignored)

---

## Step 1 — Ingest and Validate Upstream Artifacts

Before planning, verify that all required artifacts have been produced by the upstream skills.

### Artifact Checklist

```
From business-analysis:
  [ ] User Story Map — all US-xxx stories with AC and BC
  [ ] Functional Requirements — FR-xxx list, one per observable behaviour
  [ ] Non-Functional Requirements — NFR-xxx list grouped by category
  [ ] Input / Output field specification per action
  [ ] Swimlane / sequence diagram (confirms actor interactions)

From software-tester-design:
  [ ] SUT definition (architecture, components, environments)
  [ ] Test Scenarios — SC-xxx list
  [ ] Test Cases — TC-xxx list with technique, level, preconditions, expected output
  [ ] Test data catalogue
```

If any artifact is missing, **stop and request it** before proceeding. Do not plan delivery against incomplete requirements or untested assumptions.

### Artifact Summary Table

Produce this table once all artifacts are collected:

| ID          | Type              | Title / Summary                            | Priority    | Source Skill         |
| ----------- | ----------------- | ------------------------------------------ | ----------- | -------------------- |
| US-xxx-001  | User Story        | [Title]                                    | Must Have   | business-analysis    |
| FR-xxx-001  | Functional Req    | [Title]                                    | Must Have   | business-analysis    |
| NFR-PERF-001| Non-Functional    | [Title]                                    | Should Have | business-analysis    |
| SC-xxx-001  | Test Scenario     | [Title]                                    | High        | software-tester-design |
| TC-xxx-001  | Test Case         | [Title]                                    | P1          | software-tester-design |

---

## Step 2 — Build the Backlog (Epic → Story)

Group user stories into **Epics** — large themes of work — then list the stories under each.

### What is an Epic?

An Epic is a group of related user stories that together deliver a meaningful capability. Epics come from the Activities in the User Story Map (business-analysis Step 2).

### Structure

```
EPIC-[FEATURE]-[SEQ]   (maps to Activity in User Story Map)
  └── US-xxx-001       (user story from business-analysis)
  └── US-xxx-002
  └── US-xxx-003
```

### Output Format

```
## Backlog — [Feature Name]

### EPIC-[FEATURE]-001: [Epic Name — the Activity it represents]

| Story ID   | Title                              | Priority    | Linked FR                    | Linked TC              |
| ---------- | ---------------------------------- | ----------- | ---------------------------- | ---------------------- |
| US-xxx-001 | [Story title]                      | Must Have   | FR-xxx-001, FR-xxx-002       | TC-xxx-001, TC-xxx-002 |
| US-xxx-002 | [Story title]                      | Must Have   | FR-xxx-003                   | TC-xxx-003             |
| US-xxx-003 | [Story title]                      | Should Have | FR-xxx-004                   | TC-xxx-004, TC-xxx-005 |
```

---

## Step 3 — Break Down Developer Tasks (DEV-xxx)

For each user story, break the implementation into concrete **developer tasks** — one task per layer or concern. Each task must be independently implementable and verifiable.

### Implementation Layers

| Layer     | Examples                                                                 |
| --------- | ------------------------------------------------------------------------ |
| DB        | Schema migration, index, seed data, constraint                          |
| API       | Endpoint handler, request validation, service logic, error responses    |
| Domain    | Business logic, domain model, rules engine, state machine               |
| Frontend  | UI component, form, page, client-side validation, state management      |
| Infra     | Environment variable, config, queue consumer, cron job, cloud resource  |
| Auth      | Middleware, permission guard, token handling                             |
| Email/SMS | Template, trigger, retry logic                                          |
| Test hook | Seed script, test fixture, factory function needed by QA automation     |

### DEV Task Format

```
DEV-[FEATURE]-[SEQ]
Title:       [What the developer implements — one clear sentence]
Story:       US-xxx-001
Layer:       [DB | API | Domain | Frontend | Infra | Auth | Email | Test hook]
Description: [What needs to be built — concise, implementation-focused]

Acceptance Check:
  - [Testable condition that confirms this task is done]
  - [Linked TC-xxx test case that validates this task]

Dependencies:
  - Blocked by: [DEV-xxx-001 must be done first — reason]
  - Blocks:     [DEV-xxx-003 cannot start until this is done]

Complexity:   XS | S | M | L | XL
```

### Complexity Guide

| Size | Description                                      | Examples                                         |
| ---- | ------------------------------------------------ | ------------------------------------------------ |
| XS   | Trivial change, no logic                         | Add field to response, update config value       |
| S    | Simple, well-understood, no side effects         | CRUD endpoint, basic validation rule             |
| M    | Moderate — some logic, 1–2 integrations          | Auth middleware, email dispatch with retry       |
| L    | Complex — multiple layers or non-trivial logic   | State machine, payment flow, multi-step process  |
| XL   | High uncertainty — spike or breakdown needed     | New architecture, third-party integration, infra |

### Example — User Registration

```
DEV-REG-001
Title:       Create users table schema and migration
Story:       US-REG-001
Layer:       DB
Description: Create the `users` table with columns: id (UUID PK), display_name (varchar 30),
             email (varchar 255 unique), password_hash (varchar 255), is_verified (boolean default false),
             created_at (timestamptz), updated_at (timestamptz).
             Add unique index on email. Add index on created_at for audit queries.

Acceptance Check:
  - Migration runs cleanly on a fresh database
  - Unique constraint on email is enforced (validated by TC-REG-003)
  - password_hash column is NOT nullable

Dependencies:
  - Blocked by: —
  - Blocks:     DEV-REG-002 (cannot write user records without the table)

Complexity:   S

---

DEV-REG-002
Title:       Implement POST /api/auth/register endpoint
Story:       US-REG-001
Layer:       API
Description: Create the registration endpoint. Validate all input fields against the field spec
             (FR-REG-001, FR-REG-002). Hash the password with bcrypt (cost 12). Write the user
             record to the DB. Return 201 with userId, displayName, email, createdAt.
             Return 400 with VALIDATION_ERROR on field failures. Return 409 with EMAIL_ALREADY_EXISTS
             on duplicate email.

Acceptance Check:
  - TC-REG-001 passes (happy path — 201 response with correct body)
  - TC-REG-002 passes (duplicate email — 409)
  - TC-REG-003 passes (invalid input — 400 with field errors)
  - Password field never appears in any response body

Dependencies:
  - Blocked by: DEV-REG-001 (needs users table)
  - Blocks:     DEV-REG-003 (email trigger needs userId from this step)

Complexity:   M

---

DEV-REG-003
Title:       Implement verification email dispatch after registration
Story:       US-REG-002
Layer:       Email
Description: After successful account creation, generate a cryptographically random token (≥32 bytes),
             store it in the `email_verifications` table with an expiry of 24 hours, and dispatch
             the verification email via the mail provider. Implement retry logic: up to 3 attempts
             with exponential backoff if the mail provider is unavailable. Account must be created
             even if email dispatch fails.

Acceptance Check:
  - TC-REG-004 passes (email dispatched within 60 seconds)
  - TC-REG-005 passes (account created even when mail provider is unavailable)
  - Token is at least 32 bytes and cryptographically random (NFR-SEC-002)

Dependencies:
  - Blocked by: DEV-REG-002 (needs userId to generate and store the token)
  - Blocks:     DEV-REG-004 (verify endpoint needs tokens to exist)

Complexity:   M

---

DEV-REG-004
Title:       Implement GET /api/auth/verify-email?token=[token] endpoint
Story:       US-REG-003, US-REG-004
Layer:       API
Description: Accept a verification token as a query parameter. Look up the token in
             `email_verifications`. If valid and not expired, mark the user as `is_verified = true`
             and invalidate the token. Return appropriate responses for expired and already-used tokens.

Acceptance Check:
  - TC-REG-006 passes (valid token — account marked verified)
  - TC-REG-007 passes (expired token — returns expiry message)
  - TC-REG-008 passes (used token — cannot be reused)

Dependencies:
  - Blocked by: DEV-REG-003 (needs tokens in the DB)
  - Blocks:     —

Complexity:   S
```

---

## Step 4 — Map Dependencies

Produce a dependency map to show which tasks block others. This determines the critical path.

### Dependency Table

```
## Dependency Map — [Feature Name]

| Task        | Blocked By      | Reason                                          | Blocks          |
| ----------- | --------------- | ----------------------------------------------- | --------------- |
| DEV-xxx-001 | —               | No dependency — can start immediately           | DEV-xxx-002     |
| DEV-xxx-002 | DEV-xxx-001     | Needs DB schema before writing records          | DEV-xxx-003     |
| DEV-xxx-003 | DEV-xxx-002     | Needs userId from registration endpoint         | DEV-xxx-004     |
| DEV-xxx-004 | DEV-xxx-003     | Needs tokens stored in DB                       | —               |
```

### Critical Path

Highlight the longest chain of sequential dependencies — this is the minimum time to deliver.

```
Critical path: DEV-xxx-001 → DEV-xxx-002 → DEV-xxx-003 → DEV-xxx-004

Parallelisable tasks (can start independently):
  - DEV-xxx-005 (frontend form component — no backend dependency)
  - DEV-xxx-006 (email template — no API dependency)
```

---

## Step 5 — Slice into Iterations

This is where the PM applies the iterative & incremental principle: divide the full backlog of stories, tasks, scenarios, and test cases into **iterations** — each one delivering a working, tested increment.

### How to slice

1. **Start from the job flow** — use the User Story Map steps (from business-analysis) as the natural iteration boundaries. Each job step = a candidate iteration.
2. **Assign scenarios first** — for each iteration, select the SC-xxx scenarios that belong to the job step(s) in scope.
3. **Assign test cases by priority** — P1 TCs go into the iteration where the feature ships. P2/P3 go into the following iteration as "hardening".
4. **Assign DEV-xxx tasks** — only the tasks needed to make the scoped scenarios pass.
5. **State the increment** — what works end-to-end when this iteration is done.

### Slicing rules

- **Must Have** stories go into the earliest iteration possible.
- **Should Have / Could Have** are deferred unless a Must Have depends on them.
- **Happy path scenarios + P1 test cases** go into the first iteration for any job step.
- **Error paths, edge cases, P2/P3 test cases** go into the next iteration for the same step.
- **NFRs** are assigned to the iteration where the feature they govern first ships — not a separate hardening sprint.
- **No iteration ends without all its P1 TCs passing.** If they don't pass, the iteration is not done.

### Iteration Card Format

```
## Iteration [N] — [Goal: one sentence describing the working increment]

Story / Job Step in scope: [US-xxx-001 — Step N of the job]
Priority: Must Have | Should Have

─── Scenarios in scope ────────────────────────────────────────
  SC-xxx-001: [Scenario title]
  SC-xxx-002: [Scenario title]

─── Test Cases — Definition of Done ───────────────────────────
  P1 (must all pass before iteration is done):
    TC-xxx-001: [Test case title]
    TC-xxx-002: [Test case title]

  P2 (target — not blocking, carry to next iteration if not ready):
    TC-xxx-003: [Test case title]

─── Developer Tasks ────────────────────────────────────────────
  | Task        | Title                          | Layer    | Complexity |
  | ----------- | ------------------------------ | -------- | ---------- |
  | DEV-xxx-001 | [Title]                        | DB       | S          |
  | DEV-xxx-002 | [Title]                        | API      | M          |

─── NFRs enforced this iteration ──────────────────────────────
  NFR-xxx-001: [Requirement] — enforced in DEV-xxx-002

─── Increment ──────────────────────────────────────────────────
  At the end of this iteration, the following works end-to-end:
  [Description of what a user/tester can actually do and verify]
```

### Example — User Registration (4 iterations)

```
## Iteration 1 — User can submit the registration form and get an account created

Story / Job Step in scope: US-REG-001 — Step 1 & 2 of the job (form → account created)
Priority: Must Have

─── Scenarios in scope ────────────────────────────────────────
  SC-REG-001: Successful registration with valid data
  SC-REG-002: Registration rejected — email already registered
  SC-REG-003: Registration rejected — invalid input fields

─── Test Cases — Definition of Done ───────────────────────────
  P1 (must all pass):
    TC-REG-001: Happy path — 201 response with correct user body
    TC-REG-002: Duplicate email — 409 EMAIL_ALREADY_EXISTS
    TC-REG-003: Missing required field — 400 VALIDATION_ERROR

  P2 (target, not blocking):
    TC-REG-004: displayName at min boundary (3 chars) — accepted
    TC-REG-005: displayName below min (2 chars) — rejected
    TC-REG-006: Password without uppercase — rejected

─── Developer Tasks ────────────────────────────────────────────
  | Task        | Title                                   | Layer    | Complexity |
  | ----------- | --------------------------------------- | -------- | ---------- |
  | DEV-REG-001 | Create users table schema and migration | DB       | S          |
  | DEV-REG-002 | Implement POST /api/auth/register        | API      | M          |
  | DEV-REG-005 | Registration form UI component          | Frontend | M          |

─── NFRs enforced this iteration ──────────────────────────────
  NFR-SEC-001: bcrypt cost ≥12 — enforced in DEV-REG-002
  NFR-SEC-003: HTTPS only — validated in API layer

─── Increment ──────────────────────────────────────────────────
  A visitor can open the registration page, fill in the form, submit it,
  and receive either a 201 success response or a clear error. The account
  exists in the database. All P1 test cases pass in the staging environment.

---

## Iteration 2 — Boundary and edge cases for registration hardened

Story / Job Step in scope: US-REG-001 — hardening of Step 1 & 2
Priority: Must Have

─── Scenarios in scope ────────────────────────────────────────
  SC-REG-004: Registration boundary values for all input fields
  SC-REG-005: Special characters and injection attempts rejected

─── Test Cases — Definition of Done ───────────────────────────
  P1 (must all pass — these were P2 in Iteration 1):
    TC-REG-004: displayName at min boundary (3 chars) — accepted
    TC-REG-005: displayName below min (2 chars) — rejected
    TC-REG-006: Password without uppercase — rejected
    TC-REG-007: Email domain not on whitelist — rejected
    TC-REG-008: SQL injection in displayName — sanitised and rejected
    TC-REG-009: XSS attempt in displayName — sanitised and rejected

  P2:
    TC-REG-010: displayName at max boundary (30 chars) — accepted
    TC-REG-011: Password at max boundary (64 chars) — accepted

─── Developer Tasks ────────────────────────────────────────────
  | Task        | Title                                        | Layer  | Complexity |
  | ----------- | -------------------------------------------- | ------ | ---------- |
  | DEV-REG-006 | Add domain whitelist validation to register  | API    | S          |
  | DEV-REG-007 | Add input sanitisation for XSS and injection | Domain | S          |

─── NFRs enforced this iteration ──────────────────────────────
  NFR-SEC-004: Rate-limit registration to 10 req/IP/min — enforced in DEV-REG-008

─── Increment ──────────────────────────────────────────────────
  Registration is robust against bad input, boundary values, and injection.
  All boundary and security test cases pass.

---

## Iteration 3 — Verification email sent and user can verify account

Story / Job Step in scope: US-REG-002, US-REG-003, US-REG-004 — Steps 2–4 of the job
Priority: Must Have

─── Scenarios in scope ────────────────────────────────────────
  SC-REG-006: Verification email dispatched after successful registration
  SC-REG-007: User clicks valid verification link — account activated
  SC-REG-008: User clicks expired verification link — sees error + resend option

─── Test Cases — Definition of Done ───────────────────────────
  P1 (must all pass):
    TC-REG-012: Verification email dispatched within 60 seconds
    TC-REG-013: Valid token — account marked as verified
    TC-REG-014: Expired token — returns expiry message with resend option
    TC-REG-015: Used token — cannot be reused
    TC-REG-016: Account created even when mail provider unavailable

  P2:
    TC-REG-017: Resend requested — new email dispatched
    TC-REG-018: Resend limit (3/hour) enforced

─── Developer Tasks ────────────────────────────────────────────
  | Task        | Title                                          | Layer  | Complexity |
  | ----------- | ---------------------------------------------- | ------ | ---------- |
  | DEV-REG-003 | Implement verification email dispatch          | Email  | M          |
  | DEV-REG-004 | Implement GET /api/auth/verify-email endpoint  | API    | S          |
  | DEV-REG-009 | Verification email HTML template               | Email  | XS         |

─── NFRs enforced this iteration ──────────────────────────────
  NFR-SEC-002: Token ≥32 bytes cryptographically random — enforced in DEV-REG-003
  NFR-REL-002: Email retry up to 3× with exponential backoff — enforced in DEV-REG-003

─── Increment ──────────────────────────────────────────────────
  A registered user receives a verification email and can click the link to
  activate their account. Expired and reused tokens are handled correctly.
  The full registration job — from form submission to verified account — works end-to-end.
```

---

## Step 6 — Traceability Matrix

Every item must be traceable from business requirement to implementation task to test case.

```
## Traceability Matrix — [Feature Name]

| User Story  | Functional Req              | Dev Task(s)                  | Test Case(s)                  | Status  |
| ----------- | --------------------------- | ----------------------------- | ----------------------------- | ------- |
| US-xxx-001  | FR-xxx-001, FR-xxx-002      | DEV-xxx-001, DEV-xxx-002      | TC-xxx-001, TC-xxx-002        | Planned |
| US-xxx-001  | FR-xxx-003                  | DEV-xxx-002                   | TC-xxx-003                    | Planned |
| US-xxx-002  | FR-xxx-005, FR-xxx-007      | DEV-xxx-003                   | TC-xxx-004, TC-xxx-005        | Planned |
| US-xxx-003  | FR-xxx-008                  | DEV-xxx-004                   | TC-xxx-006, TC-xxx-007        | Planned |
| —           | NFR-SEC-001                 | DEV-xxx-002                   | TC-xxx-008 (security check)   | Planned |
```

**Status values:** `Planned` | `In Progress` | `In Review` | `Done` | `Blocked`

Use this matrix throughout delivery to track coverage gaps — if a FR has no linked DEV task, it is not planned. If a TC has no linked DEV task, it cannot pass.

---

## Output Document Template

```markdown
# Project Plan — [Feature Name]

## 1. Artifact Inventory
[Artifact summary table from Step 1]

## 2. Backlog
[Epic → Story grouping from Step 2]

## 3. Developer Task Breakdown
[All DEV-xxx task cards from Step 3]

## 4. Dependency Map
[Dependency table + critical path from Step 4]

## 5. Iteration Plan
[Iteration cards from Step 5 — each with: scenarios in scope, TC DoD, DEV tasks, NFRs, increment description]

## 6. Traceability Matrix
[Full matrix from Step 6]

## 7. Open Risks
| # | Risk                                  | Likelihood | Impact | Mitigation           |
|---|---------------------------------------|------------|--------|----------------------|
| 1 | [e.g. Mail provider SLA unknown]      | Medium     | High   | [Spike in Sprint 1]  |

## 8. Out of Scope
- [Tasks explicitly deferred or excluded]
```
