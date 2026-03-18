# Iteration 1 — Foundation: User can register, sign in, and sign out

**Goal:** A visitor can open the app, register an account, sign in, and sign out. Sessions are secured with JWT. The app shell renders at all breakpoints.

**Stories in scope:** US-MB-001, US-MB-002, US-MB-003
**Priority:** Must Have
**Duration:** 1 week

---

## Scenarios in Scope

| SC-ID       | Scenario                                                       | Type       |
|-------------|----------------------------------------------------------------|------------|
| SC-AUTH-001 | Successful registration with all valid fields                  | Functional |
| SC-AUTH-002 | Registration rejected — username below minimum (2 chars)       | Boundary   |
| SC-AUTH-003 | Registration rejected — username at minimum (3 chars) — accepted | Boundary |
| SC-AUTH-004 | Registration rejected — username contains invalid chars        | Negative   |
| SC-AUTH-005 | Registration rejected — invalid email format                   | Negative   |
| SC-AUTH-006 | Registration rejected — password below minimum                 | Boundary   |
| SC-AUTH-007 | Registration rejected — password missing required char types   | Negative   |
| SC-AUTH-008 | Registration rejected — email already registered               | Negative   |
| SC-AUTH-009 | Registration rejected — username already taken                 | Negative   |
| SC-AUTH-010 | Password never returned in registration response               | Security   |
| SC-AUTH-011 | Successful sign-in with valid credentials                      | Functional |
| SC-AUTH-012 | Sign-in rejected — wrong password (generic message)            | Security   |
| SC-AUTH-013 | Sign-in rejected — unregistered email (same generic message)   | Security   |
| SC-AUTH-015 | Sign-out invalidates session token                             | Functional |
| SC-AUTH-016 | Unauthenticated request to protected endpoint rejected         | Security   |

---

## Definition of Done — Test Cases

**P1 — All must pass before iteration is done:**

| TC-ID       | Title                                                   | Level |
|-------------|---------------------------------------------------------|-------|
| TC-AUTH-001 | Successful registration — 201 with correct body         | API   |
| TC-AUTH-002 | Username below min (2 chars) → 400 MIN_LENGTH           | API   |
| TC-AUTH-003 | Username at min boundary (3 chars) → 201                | API   |
| TC-AUTH-004 | Username above max (31 chars) → 400 MAX_LENGTH          | API   |
| TC-AUTH-005 | Username uppercase chars → 400 INVALID_FORMAT           | API   |
| TC-AUTH-006 | Email already registered → 409 EMAIL_ALREADY_EXISTS     | API   |
| TC-AUTH-007 | Password missing uppercase → 400 INVALID_FORMAT         | API   |
| TC-AUTH-008 | Sign-in valid credentials → 200 + tokens                | API   |
| TC-AUTH-009 | Sign-in wrong password → 401 generic message            | API   |
| TC-AUTH-011 | Sign-out → subsequent request with same token → 401     | API   |

**P2 — Target, not blocking:**

| TC-ID       | Title                                                   |
|-------------|------------------------------------------------------|
| TC-AUTH-010 | 5 failed sign-ins → 6th attempt locked (429)          |

---

## Developer Tasks

| Task        | Title                                                        | Layer    | Complexity | Owner |
|-------------|--------------------------------------------------------------|----------|------------|-------|
| DEV-MB-045  | Docker Compose setup (postgres + redis + app + worker)       | Infra    | M          | Dev   |
| DEV-MB-001  | Create users table schema and migration                      | DB       | S          | Dev   |
| DEV-MB-033  | Redis timeline store setup and infrastructure                | Infra    | M          | Dev   |
| DEV-MB-002  | POST /api/auth/register endpoint                             | API      | M          | Dev   |
| DEV-MB-003  | POST /api/auth/signin + JWT generation                       | API+Domain | M        | Dev   |
| DEV-MB-004  | POST /api/auth/signout + token denylist                      | API      | S          | Dev   |
| DEV-MB-005  | JWT authentication middleware                                | Auth     | M          | Dev   |
| DEV-MB-009  | Auth test fixtures and seed helpers                          | Test hook| S          | Dev   |
| DEV-MB-046  | App layout (3-col desktop, icon sidebar, bottom nav mobile)  | Frontend | M          | Dev   |
| DEV-MB-007  | Register form UI (/register)                                 | Frontend | M          | Dev   |
| DEV-MB-008  | Sign-in form UI (/signin)                                    | Frontend | S          | Dev   |

**Parallel work available:**
- DEV-MB-045 (Docker) and DEV-MB-046 (App layout) can start simultaneously — no interdependency
- DEV-MB-007 (register UI) and DEV-MB-008 (signin UI) can be built in parallel

---

## NFRs Enforced This Iteration

| NFR          | Requirement                                     | Enforced in       |
|--------------|-------------------------------------------------|-------------------|
| NFR-SEC-001  | bcrypt cost ≥ 12 for password hashing           | DEV-MB-002        |
| NFR-SEC-002  | JWT access token HS256, 1h TTL                  | DEV-MB-003        |
| NFR-SEC-003  | Refresh token ≥32 bytes, stored as hash         | DEV-MB-003        |
| NFR-SEC-006  | Rate limit: 10 req/IP/min on auth endpoints     | DEV-MB-006 (→ Iter 2) |
| NFR-COMP-001 | Auth attempts logged (timestamp, IP, outcome)   | DEV-MB-002–003    |
| NFR-COMP-003 | Email never in public API response              | DEV-MB-002        |

---

## Increment

At the end of Iteration 1:
- A visitor can open `/register`, fill in username, email, and password, and create an account
- The system rejects invalid inputs with inline field-level error messages
- A member can sign in at `/signin` and receive a JWT + refresh token
- Signing out invalidates the session token — subsequent requests return 401
- The app shell renders correctly on mobile (375px), tablet (768px), and desktop (1280px)
- All P1 API test cases pass in the local environment
